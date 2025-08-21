import { readFileSync } from 'fs';
import { createServer } from 'http';
import path from 'path';

/**
 * Simple Boardcast Interpreter
 * Parses .board files and serves them via HTTP
 */

/**
 * Parse a single command line and extract method name and arguments
 */
function parseCommand(line) {
  const trimmed = line.trim();
  
  // Match method(arg1, arg2, ...)
  const match = trimmed.match(/^(\w+)\s*\((.*)\)$/);
  if (!match) {
    console.warn(`Invalid command format: ${line}`);
    return null;
  }

  const [, method, argsStr] = match;
  
  // Parse arguments - simple CSV parsing with string/number support
  const args = [];
  if (argsStr.trim()) {
    const argTokens = parseArguments(argsStr);
    args.push(...argTokens);
  }

  return { method, args };
}

/**
 * Parse argument string into typed values
 */
function parseArguments(argsStr) {
  const args = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes && char === ',') {
      args.push(parseValue(current.trim()));
      current = '';
      continue;
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    args.push(parseValue(current.trim()));
  }
  
  return args;
}

/**
 * Convert string value to appropriate type
 */
function parseValue(value) {
  value = value.trim();
  
  // String (quoted)
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value);
  }
  
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // ClearType enum - map to strings that the frontend can handle
  if (value.startsWith('ClearType.')) {
    return value.replace('ClearType.', '');
  }
  
  // Default to string
  return value;
}

/**
 * Load and parse a .board file
 */
function loadBoardFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const commands = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments
  
  return commands.map(cmd => parseCommand(cmd)).filter(cmd => cmd !== null);
}

/**
 * Start HTTP server to display the visualization
 */
async function startInterpreterServer(boardFile, port = 3001) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boardcast Interpreter</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: white;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .board-container {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
        #chart {
            border: 1px solid #444;
            background: #222;
        }
        .controls {
            text-align: center;
            margin: 20px 0;
        }
        button {
            background: #4a90e2;
            border: none;
            color: white;
            padding: 10px 20px;
            margin: 0 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #357abd;
        }
        .info {
            text-align: center;
            color: #ccc;
            margin-top: 20px;
        }
        .status {
            text-align: center;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .status.success {
            background: #4CAF50;
            color: white;
        }
        .status.error {
            background: #f44336;
            color: white;
        }
        .status.info {
            background: #2196F3;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Boardcast Interpreter</h1>
            <p>File: <code>${path.basename(boardFile)}</code></p>
        </div>
        
        <div id="status"></div>
        
        <div class="board-container">
            <svg id="chart" width="1000" height="700"></svg>
        </div>
        
        <div class="controls">
            <button onclick="runScript()">Run Script</button>
            <button onclick="resetBoard()">Reset Board</button>
            <button onclick="location.reload()">Reload Page</button>
        </div>
        
        <div class="info">
            <p>The script will automatically execute when the page loads.</p>
            <p>Use the controls above to re-run or reset the visualization.</p>
        </div>
    </div>

    <script type="importmap">
        {
            "imports": {
                "d3": "/d3.js"
            }
        }
    </script>
    <script type="module">
        import { BoardcastHexBoard } from '/boardcast.js';
        
        let board;
        
        // ClearType enum mapping
        const ClearType = {
            ALL: 'ALL',
            HIGHLIGHT: 'HIGHLIGHT', 
            BLINK: 'BLINK',
            PULSE: 'PULSE',
            POINT: 'POINT',
            TOKEN: 'TOKEN',
            CAPTION: 'CAPTION'
        };
        
        function showStatus(message, type = 'info') {
            const statusDiv = document.getElementById('status');
            statusDiv.innerHTML = \`<div class="status \${type}">\${message}</div>\`;
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 3000);
        }
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('Initializing Boardcast Interpreter...');
            showStatus('Initializing Boardcast Interpreter...', 'info');
            
            try {
                board = new BoardcastHexBoard('#chart');
                window.board = board; // Make available globally
                
                showStatus('Board initialized successfully!', 'success');
                
                // Auto-run the script
                await runScript();
            } catch (error) {
                console.error('Failed to initialize:', error);
                showStatus('Failed to initialize: ' + error.message, 'error');
            }
        });
        
        window.runScript = async function() {
            console.log('Running board script...');
            showStatus('Running board script...', 'info');
            
            try {
                board.resetBoard();
                
                // Fetch and execute the board commands
                const response = await fetch('/board-commands');
                const commands = await response.json();
                
                showStatus(\`Executing \${commands.length} commands...\`, 'info');
                
                for (const command of commands) {
                    console.log('Executing:', command.method, command.args);
                    
                    // Handle ClearType enum conversion
                    const args = command.args.map(arg => {
                        if (typeof arg === 'string' && ClearType[arg]) {
                            return ClearType[arg];
                        }
                        return arg;
                    });
                    
                    const result = board[command.method](...args);
                    if (result instanceof Promise) {
                        await result;
                    }
                }
                
                console.log('Script execution completed!');
                showStatus('Script execution completed successfully!', 'success');
            } catch (error) {
                console.error('Error running script:', error);
                showStatus('Error running script: ' + error.message, 'error');
            }
        };
        
        window.resetBoard = function() {
            board.resetBoard();
            showStatus('Board reset', 'info');
        };
    </script>
</body>
</html>`;

  const server = createServer(async (req, res) => {
    const url = req.url || '/';
    
    try {
      if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
      } else if (url === '/board-commands') {
        // Parse the board file and return commands as JSON
        const commands = loadBoardFile(boardFile);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(commands));
      } else if (url === '/boardcast.js') {
        // Serve the built boardcast library
        const boardcastPath = path.join(process.cwd(), 'boardcast/dist/lib/index.js');
        try {
          const content = readFileSync(boardcastPath, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(content);
        } catch (error) {
          res.writeHead(404);
          res.end('Boardcast library not found. Run "npm run build" first.');
        }
      } else if (url === '/d3.js') {
        // Serve d3 as ES module from CDN
        res.writeHead(302, { 'Location': 'https://cdn.skypack.dev/d3@7' });
        res.end();
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Boardcast Interpreter server running at http://localhost:${port}`);
      console.log(`Board file: ${boardFile}`);
      resolve();
    });
  });
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node simple-interpreter.js <board-file> [port]');
  console.error('');
  console.error('Options:');
  console.error('  board-file  Path to .board file containing Boardcast commands');
  console.error('  port        Port to run HTTP server on (default: 3001)');
  console.error('');
  console.error('Example:');
  console.error('  node simple-interpreter.js example.board');
  console.error('  node simple-interpreter.js example.board 8080');
  process.exit(1);
}

const boardFile = args[0];
const port = parseInt(args[1]) || 3001;

// Validate board file
if (!boardFile.endsWith('.board')) {
  console.error('Error: Board file must have .board extension');
  process.exit(1);
}

const fullPath = path.resolve(boardFile);
console.log('Boardcast Interpreter');
console.log('====================');
console.log(`Board file: ${fullPath}`);
console.log(`Port: ${port}`);
console.log('');

try {
  await startInterpreterServer(fullPath, port);
  
  console.log('');
  console.log('Server started successfully!');
  console.log(`Open http://localhost:${port} in your browser to view the visualization.`);
  console.log('Press Ctrl+C to stop the server.');
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}