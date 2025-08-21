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
    <title>Boardcast - ${path.basename(boardFile)}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #chart {
            background: #222;
        }
    </style>
</head>
<body>
    <svg id="chart" width="1000" height="700"></svg>

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
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('Initializing Boardcast Interpreter...');
            
            try {
                board = new BoardcastHexBoard('#chart');
                console.log('Board initialized successfully!');
                
                // Auto-run the script
                await runScript();
            } catch (error) {
                console.error('Failed to initialize:', error);
            }
        });
        
        async function runScript() {
            console.log('Running board script...');
            
            try {
                board.resetBoard();
                
                // Fetch and execute the board commands
                const response = await fetch('/board-commands');
                const commands = await response.json();
                
                console.log(\`Executing \${commands.length} commands...\`);
                
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
                
                console.log('Script execution completed successfully!');
            } catch (error) {
                console.error('Error running script:', error);
            }
        }
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