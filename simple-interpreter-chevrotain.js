import { readFileSync, watch } from 'fs';
import { createServer } from 'http';
import path from 'path';
import { parseBoardContent, formatParsingError } from './board-parser.js';

/**
 * Boardcast Interpreter with Chevrotain Parser
 * Parses .board files using robust grammar and serves them via HTTP
 */

/**
 * Convert parsed arguments to simple values for frontend
 */
function convertArgumentsForFrontend(args) {
  return args.map(arg => {
    switch (arg.type) {
      case 'string':
      case 'number':
      case 'boolean':
        return arg.value;
      case 'identifier':
        return arg.value;
      case 'enum':
        // Handle enum values
        if (arg.enumType === 'ClearType') {
          return arg.value;
        } else if (arg.enumType === 'Colors') {
          return arg.raw; // Keep Colors.RED format
        }
        return arg.value;
      default:
        return arg.value || arg.raw;
    }
  });
}

/**
 * Load and parse a .board file using Chevrotain
 */
function loadBoardFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parseResult = parseBoardContent(content);
    
    if (!parseResult.success) {
      console.error('Parse errors in board file:');
      parseResult.errors.forEach(error => {
        console.error(formatParsingError(error, content));
      });
      return [];
    }
    
    // Convert commands to simple format for frontend
    return parseResult.commands.map(command => ({
      method: command.method,
      args: convertArgumentsForFrontend(command.args)
    }));
    
  } catch (error) {
    console.error(`Failed to load board file: ${error.message}`);
    return [];
  }
}

/**
 * Start HTTP server to display the visualization
 */
async function startInterpreterServer(boardFile, port = 3001) {
  // Track SSE clients for file change notifications
  const sseClients = new Set();
  
  // File watching with debouncing
  let reloadTimeout;
  const watcher = watch(boardFile, (eventType) => {
    if (eventType === 'change') {
      // Debounce rapid file changes (editors often save multiple times)
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(() => {
        console.log(`File changed: ${boardFile} - notifying clients`);
        // Notify all connected SSE clients
        for (const client of sseClients) {
          try {
            client.write('data: reload' + String.fromCharCode(10, 10));
          } catch (error) {
            // Remove disconnected clients
            sseClients.delete(client);
          }
        }
      }, 100); // 100ms debounce
    }
  });
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    watcher.close();
    for (const client of sseClients) {
      try {
        client.end();
      } catch (error) {
        // Ignore errors on cleanup
      }
    }
    process.exit(0);
  });

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
        .error-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4444;
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 14px;
            z-index: 1000;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        .error-overlay.hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div id="error-overlay" class="error-overlay hidden"></div>
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
        
        // Error display functions
        function showError(message) {
            const errorOverlay = document.getElementById('error-overlay');
            errorOverlay.textContent = message;
            errorOverlay.classList.remove('hidden');
        }
        
        function hideError() {
            const errorOverlay = document.getElementById('error-overlay');
            errorOverlay.classList.add('hidden');
        }
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('Initializing Boardcast Interpreter with Chevrotain...');
            
            try {
                board = new BoardcastHexBoard('#chart');
                console.log('Board initialized successfully!');
                
                // Set up Server-Sent Events for file change notifications
                const eventSource = new EventSource('/events');
                
                eventSource.onmessage = function(event) {
                    if (event.data === 'reload') {
                        console.log('File changed - reloading script...');
                        runScript();
                    } else if (event.data === 'connected') {
                        console.log('File watching connected');
                    }
                };
                
                eventSource.onerror = function(error) {
                    console.log('SSE connection error:', error);
                };
                
                // Auto-run the script initially
                await runScript();
            } catch (error) {
                console.error('Failed to initialize:', error);
                showError('Failed to initialize: ' + error.message);
            }
        });
        
        async function runScript() {
            console.log('Running board script...');
            hideError();
            
            try {
                board.resetBoard();
                
                // Fetch and execute the board commands
                const response = await fetch('/board-commands');
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    const errorMessages = result.errors.map(e => e.message);
                    const errorMessage = 'Parse errors:' + String.fromCharCode(10) + errorMessages.join(String.fromCharCode(10));
                    throw new Error(errorMessage);
                }
                
                const commands = result.commands;
                console.log(`Executing ${commands.length} commands...`);
                
                for (const command of commands) {
                    console.log('Executing:', command.method, command.args);
                    
                    // Handle ClearType enum conversion
                    const args = command.args.map(arg => {
                        if (typeof arg === 'string' && ClearType[arg]) {
                            return ClearType[arg];
                        }
                        return arg;
                    });
                    
                    try {
                        const result = board[command.method](...args);
                        if (result instanceof Promise) {
                            await result;
                        }
                    } catch (methodError) {
                        throw new Error(`Error executing ${command.method}(${args.join(', ')}): ${methodError.message}`);
                    }
                }
                
                console.log('Script execution completed successfully!');
            } catch (error) {
                console.error('Error running script:', error);
                showError(error.message);
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
        try {
          const content = readFileSync(boardFile, 'utf-8');
          const parseResult = parseBoardContent(content);
          
          if (!parseResult.success) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              errors: parseResult.errors.map(error => ({
                ...error,
                formattedMessage: formatParsingError(error, content)
              }))
            }));
            return;
          }
          
          // Convert commands to simple format
          const commands = parseResult.commands.map(command => ({
            method: command.method,
            args: convertArgumentsForFrontend(command.args)
          }));
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            commands: commands
          }));
        } catch (error) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            errors: [{
              type: 'file',
              message: `Failed to read board file: ${error.message}`
            }]
          }));
        }
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
      } else if (url === '/events') {
        // Server-Sent Events endpoint for file change notifications
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        
        // Add client to SSE clients set
        sseClients.add(res);
        
        // Send initial connection event
        res.write('data: connected' + String.fromCharCode(10, 10));
        
        // Remove client when connection closes
        req.on('close', () => {
          sseClients.delete(res);
        });
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
      console.log(`Boardcast Interpreter (Chevrotain) server running at http://localhost:${port}`);
      console.log(`Board file: ${boardFile}`);
      resolve();
    });
  });
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node simple-interpreter-chevrotain.js <board-file> [port]');
  console.error('');
  console.error('Options:');
  console.error('  board-file  Path to .board file containing Boardcast commands');
  console.error('  port        Port to run HTTP server on (default: 3001)');
  console.error('');
  console.error('Example:');
  console.error('  node simple-interpreter-chevrotain.js example.board');
  console.error('  node simple-interpreter-chevrotain.js example.board 8080');
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
console.log('Boardcast Interpreter (Chevrotain)');
console.log('=================================');
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