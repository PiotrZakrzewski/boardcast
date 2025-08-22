#!/usr/bin/env node

import { readFileSync, watch, writeFileSync } from 'fs';
import { createServer } from 'http';
import path from 'path';
import { compileBoardFile } from './board-to-js.js';
import { validateBoardFile } from './board-validator-chevrotain.js';

/**
 * Unified Boardcast Toolchain CLI
 * Provides a complete workflow for .board files:
 * - Validation
 * - Compilation to JavaScript
 * - Integration with boardcast-cli for recording
 */

const COMMANDS = {
  validate: {
    description: 'Validate a .board file',
    usage: 'validate <file.board>',
    action: validateCommand
  },
  compile: {
    description: 'Compile .board file to JavaScript',
    usage: 'compile <file.board> [output.js]',
    action: compileCommand
  },
  build: {
    description: 'Validate and compile .board file',
    usage: 'build <file.board> [output.js]',
    action: buildCommand
  },
  serve: {
    description: 'Serve .board file with live reload for development',
    usage: 'serve <file.board> [port]',
    action: serveCommand
  },
  record: {
    description: 'Compile and record .board file (requires boardcast-cli)',
    usage: 'record <file.board> [output.js]',
    action: recordCommand
  },
  help: {
    description: 'Show help information',
    usage: 'help [command]',
    action: helpCommand
  }
};

/**
 * Validate command
 */
async function validateCommand(args) {
  if (args.length === 0) {
    console.error('❌ Error: No file specified');
    console.error('Usage: boardcast-toolchain validate <file.board>');
    process.exit(1);
  }
  
  const boardFile = args[0];
  
  if (!boardFile.endsWith('.board')) {
    console.error('❌ Error: File must have .board extension');
    process.exit(1);
  }
  
  console.log('🔍 Validating board file...');
  console.log(`File: ${boardFile}`);
  console.log('');
  
  const result = validateBoardFile(boardFile);
  
  if (result.valid) {
    console.log('✅ ' + result.message);
    return { success: true };
  } else {
    console.error('❌ Validation failed:');
    if (result.line) {
      console.error(`   Line ${result.line}${result.column ? ':' + result.column : ''}: ${result.lineContent}`);
    }
    console.error(`   Error: ${result.error}`);
    
    if (result.formattedError) {
      console.error('');
      console.error('Detailed error:');
      console.error(result.formattedError);
    }
    
    return { success: false, error: result.error };
  }
}

/**
 * Compile command
 */
async function compileCommand(args) {
  if (args.length === 0) {
    console.error('❌ Error: No file specified');
    console.error('Usage: boardcast-toolchain compile <file.board> [output.js]');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  if (!inputFile.endsWith('.board')) {
    console.error('❌ Error: Input file must have .board extension');
    process.exit(1);
  }
  
  console.log('⚙️  Compiling board file to JavaScript...');
  console.log(`Input: ${inputFile}`);
  
  const result = compileBoardFile(inputFile, outputFile);
  
  if (result.success) {
    console.log(`✅ Compilation successful!`);
    console.log(`📝 Generated: ${result.outputFile}`);
    console.log(`📊 Commands processed: ${result.commandCount}`);
    return { success: true, outputFile: result.outputFile };
  } else {
    console.error('❌ Compilation failed:');
    if (result.errors) {
      result.errors.forEach(error => {
        console.error(`   ${error.message}`);
      });
    } else {
      console.error(`   ${result.error}`);
    }
    return { success: false, error: result.error };
  }
}

/**
 * Build command (validate + compile)
 */
async function buildCommand(args) {
  if (args.length === 0) {
    console.error('❌ Error: No file specified');
    console.error('Usage: boardcast-toolchain build <file.board> [output.js]');
    process.exit(1);
  }
  
  console.log('🏗️  Building board file...');
  console.log('');
  
  // First validate
  const validateResult = await validateCommand(args);
  if (!validateResult.success) {
    process.exit(1);
  }
  
  console.log('');
  
  // Then compile
  const compileResult = await compileCommand(args);
  if (!compileResult.success) {
    process.exit(1);
  }
  
  console.log('');
  console.log('🎉 Build complete!');
  console.log('');
  console.log('🎬 Next steps:');
  console.log(`   boardcast record ${compileResult.outputFile}`);
  
  return compileResult;
}

/**
 * Serve command (local development server with live reload)
 */
async function serveCommand(args) {
  if (args.length === 0) {
    console.error('❌ Error: No file specified');
    console.error('Usage: boardcast-toolchain serve <file.board> [port]');
    process.exit(1);
  }
  
  const boardFile = args[0];
  const port = parseInt(args[1]) || 3001;
  
  if (!boardFile.endsWith('.board')) {
    console.error('❌ Error: File must have .board extension');
    process.exit(1);
  }
  
  const fullPath = path.resolve(boardFile);
  const jsFileName = path.basename(boardFile, '.board') + '.js';
  const jsPath = path.join(path.dirname(fullPath), jsFileName);
  
  console.log('🌐 Starting Boardcast development server...');
  console.log(`📁 Board file: ${fullPath}`);
  console.log(`🔧 Generated JS: ${jsPath}`);
  console.log(`🌍 Port: ${port}`);
  console.log('');
  
  // Initial validation and compilation
  console.log('🔍 Initial validation and compilation...');
  const buildResult = await buildBoardFile(boardFile);
  if (!buildResult.success) {
    console.error('❌ Initial build failed. Fix errors before serving.');
    process.exit(1);
  }
  
  // Create development server
  const sseClients = new Set();
  let compilationInProgress = false;
  
  // File watching with validation and compilation
  let reloadTimeout;
  const watcher = watch(fullPath, async (eventType) => {
    if (eventType === 'change' && !compilationInProgress) {
      compilationInProgress = true;
      
      // Debounce rapid file changes
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(async () => {
        console.log(`📝 File changed: ${path.basename(boardFile)}`);
        
        try {
          // Validate and compile
          const result = await buildBoardFile(boardFile);
          
          if (result.success) {
            console.log('✅ Compilation successful - reloading clients');
            
            // Notify all connected SSE clients
            for (const client of sseClients) {
              try {
                client.write('data: reload\n\n');
              } catch (error) {
                sseClients.delete(client);
              }
            }
          } else {
            console.error('❌ Compilation failed:');
            console.error('   ' + result.error);
            
            // Send error to clients
            for (const client of sseClients) {
              try {
                client.write(`data: error\ndata: ${result.error}\n\n`);
              } catch (error) {
                sseClients.delete(client);
              }
            }
          }
        } catch (error) {
          console.error('❌ Build error:', error.message);
        }
        
        compilationInProgress = false;
      }, 300); // 300ms debounce
    }
  });
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    watcher.close();
    for (const client of sseClients) {
      try {
        client.end();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    process.exit(0);
  });
  
  // Create HTTP server
  const server = createServer(async (req, res) => {
    const url = req.url || '/';
    
    try {
      if (url === '/') {
        // Serve main HTML page
        const htmlContent = createDevelopmentHTML(jsFileName, port);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
        
      } else if (url === `/${jsFileName}` || url.startsWith(`/${jsFileName}?`)) {
        // Serve the generated JavaScript file (handle cache-busting query params)
        try {
          const jsContent = readFileSync(jsPath, 'utf-8');
          res.writeHead(200, { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          });
          res.end(jsContent);
        } catch (error) {
          console.error(`Error serving ${jsFileName}:`, error.message);
          res.writeHead(404);
          res.end('Tutorial JavaScript file not found. Ensure build was successful.');
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
          res.end('Boardcast library not found. Run "npm run build" in the boardcast directory.');
        }
        
      } else if (url === '/d3.js') {
        // Redirect to D3 CDN
        res.writeHead(302, { 'Location': 'https://cdn.skypack.dev/d3@7' });
        res.end();
        
      } else if (url === '/events') {
        // Server-Sent Events for live reload
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        });
        
        sseClients.add(res);
        res.write('data: connected\n\n');
        
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
  
  // Start server
  return new Promise((resolve, reject) => {
    server.listen(port, (error) => {
      if (error) {
        reject(error);
        return;
      }
      
      console.log('✅ Development server started!');
      console.log('');
      console.log(`🌍 Open: http://localhost:${port}`);
      console.log('👀 Watching for changes...');
      console.log('🔄 Auto-reloads when .board file changes');
      console.log('🛑 Press Ctrl+C to stop');
      console.log('');
      
      resolve();
    });
  });
}

/**
 * Build board file (validate + compile) for serve command
 */
async function buildBoardFile(boardFile) {
  // Validate first
  const validateResult = validateBoardFile(boardFile);
  if (!validateResult.valid) {
    return {
      success: false,
      error: validateResult.error
    };
  }
  
  // Then compile
  const compileResult = compileBoardFile(boardFile);
  return compileResult;
}

/**
 * Create HTML template for development server
 */
function createDevelopmentHTML(jsFileName, port) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boardcast Development - ${jsFileName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #1a1a1a;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        }
        
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        
        .header {
            background: #2d2d2d;
            padding: 10px 20px;
            border-bottom: 1px solid #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .title {
            font-size: 16px;
            font-weight: bold;
            color: #4fc3f7;
        }
        
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4caf50;
        }
        
        .status-dot.error {
            background: #f44336;
            animation: blink 1s infinite;
        }
        
        .status-text {
            font-size: 14px;
            color: #ccc;
        }
        
        .board-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #0a0a0a;
        }
        
        #chart {
            background: #0a0a0a;
            max-width: 95vw;
            max-height: 85vh;
        }
        
        .error-overlay {
            position: fixed;
            top: 60px;
            left: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            white-space: pre-wrap;
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
        
        .error-overlay.show {
            display: block;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        .dev-info {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            color: #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">🎮 Boardcast Development Server</div>
            <div class="status">
                <div class="status-dot" id="statusDot"></div>
                <div class="status-text" id="statusText">Connected</div>
            </div>
        </div>
        
        <div class="error-overlay" id="errorOverlay"></div>
        
        <div class="board-container">
            <svg id="chart" width="1400" height="900"></svg>
        </div>
        
        <div class="dev-info">
            Press F5 or edit .board file to reload
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
        let currentError = null;
        
        // Status elements
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const errorOverlay = document.getElementById('errorOverlay');
        
        // Update status display
        function updateStatus(status, text, error = null) {
            statusDot.className = 'status-dot' + (status === 'error' ? ' error' : '');
            statusText.textContent = text;
            
            if (error) {
                errorOverlay.textContent = error;
                errorOverlay.classList.add('show');
                currentError = error;
            } else {
                errorOverlay.classList.remove('show');
                currentError = null;
            }
        }
        
        // Initialize board and tutorial
        async function initializeTutorial() {
            try {
                updateStatus('loading', 'Loading...');
                
                // Dynamic import of tutorial
                const tutorialModule = await import('/${jsFileName}?t=' + Date.now());
                const { runTutorial, config } = tutorialModule;
                
                // Create or recreate board
                if (board) {
                    // Clear existing board
                    const chartElement = document.getElementById('chart');
                    chartElement.innerHTML = '';
                }
                
                const boardConfig = {
                    gridRadius: config?.gridRadius || 8,
                    hexRadius: calculateHexRadius(config?.gridRadius || 8),
                    width: 1400,
                    height: 900
                };
                
                board = new BoardcastHexBoard('#chart', boardConfig);
                
                // Run tutorial
                updateStatus('running', 'Running tutorial...');
                await runTutorial(board);
                
                updateStatus('success', 'Tutorial complete');
                console.log('✅ Tutorial completed successfully');
                
            } catch (error) {
                console.error('❌ Tutorial error:', error);
                updateStatus('error', 'Tutorial error', error.message);
            }
        }
        
        function calculateHexRadius(gridRadius) {
            const maxRadius = Math.min(1400, 900) / (gridRadius * 3);
            return Math.max(15, Math.min(45, maxRadius));
        }
        
        // Set up Server-Sent Events for live reload
        const eventSource = new EventSource('/events');
        
        eventSource.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('🔄 File changed - reloading...');
                updateStatus('loading', 'Reloading...');
                setTimeout(initializeTutorial, 100);
            } else if (event.data === 'connected') {
                console.log('🔗 Connected to development server');
                updateStatus('connected', 'Connected');
            } else if (event.data === 'error') {
                // Error message will be in next data event
            }
        };
        
        eventSource.onerror = function(error) {
            console.log('⚠️ Connection error:', error);
            updateStatus('error', 'Connection lost');
        };
        
        // Handle manual reload
        document.addEventListener('keydown', (event) => {
            if (event.key === 'F5') {
                event.preventDefault();
                initializeTutorial();
            }
        });
        
        // Initial load
        window.addEventListener('load', () => {
            setTimeout(initializeTutorial, 500);
        });
    </script>
</body>
</html>`;
}

/**
 * Record command (build + record with boardcast-cli)
 */
async function recordCommand(args) {
  if (args.length === 0) {
    console.error('❌ Error: No file specified');
    console.error('Usage: boardcast-toolchain record <file.board> [output.js]');
    process.exit(1);
  }
  
  console.log('🎬 Recording board file tutorial...');
  console.log('');
  
  // First build the file
  const buildResult = await buildCommand(args);
  if (!buildResult.success) {
    process.exit(1);
  }
  
  // Check if boardcast-cli is available
  const { spawn } = await import('child_process');
  
  console.log('');
  console.log('🎥 Starting recording with boardcast-cli...');
  
  // Try to run boardcast record
  const boardcastProcess = spawn('npx', ['boardcast', 'record', buildResult.outputFile], {
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    boardcastProcess.on('close', (code) => {
      if (code === 0) {
        console.log('');
        console.log('✅ Recording complete!');
        resolve({ success: true });
      } else {
        console.error('');
        console.error('❌ Recording failed. Make sure boardcast-cli is installed:');
        console.error('   npm install -g boardcast-cli');
        console.error('   or ensure you are in a project with boardcast as a dependency');
        reject(new Error(`boardcast-cli exited with code ${code}`));
      }
    });
    
    boardcastProcess.on('error', (error) => {
      console.error('');
      console.error('❌ Failed to start boardcast-cli:');
      console.error(`   ${error.message}`);
      console.error('');
      console.error('Make sure boardcast-cli is installed:');
      console.error('   npm install -g boardcast-cli');
      reject(error);
    });
  });
}

/**
 * Help command
 */
async function helpCommand(args) {
  if (args.length > 0) {
    const command = args[0];
    if (COMMANDS[command]) {
      console.log(`Boardcast Toolchain - ${command}`);
      console.log('='.repeat(30));
      console.log(`Description: ${COMMANDS[command].description}`);
      console.log(`Usage: boardcast-toolchain ${COMMANDS[command].usage}`);
      console.log('');
      
      // Add specific help for each command
      switch (command) {
        case 'validate':
          console.log('Examples:');
          console.log('  boardcast-toolchain validate tutorial.board');
          console.log('');
          console.log('This command validates the syntax and semantics of a .board file,');
          console.log('checking for proper command syntax, valid arguments, and type correctness.');
          break;
          
        case 'compile':
          console.log('Examples:');
          console.log('  boardcast-toolchain compile tutorial.board');
          console.log('  boardcast-toolchain compile tutorial.board my-tutorial.js');
          console.log('');
          console.log('This command converts a .board file to JavaScript compatible with');
          console.log('boardcast-cli for recording and playback.');
          break;
          
        case 'build':
          console.log('Examples:');
          console.log('  boardcast-toolchain build tutorial.board');
          console.log('');
          console.log('This command validates and compiles a .board file in one step.');
          break;
          
        case 'serve':
          console.log('Examples:');
          console.log('  boardcast-toolchain serve tutorial.board');
          console.log('  boardcast-toolchain serve tutorial.board 8080');
          console.log('');
          console.log('This command starts a development server with live reload.');
          console.log('- Validates and compiles on file changes');
          console.log('- Shows real-time preview in browser');
          console.log('- Displays compilation errors in the UI');
          console.log('- Supports hot reload without manual refresh');
          break;
          
        case 'record':
          console.log('Examples:');
          console.log('  boardcast-toolchain record tutorial.board');
          console.log('');
          console.log('This command builds the .board file and records it using boardcast-cli.');
          console.log('Requires boardcast-cli to be installed and available.');
          break;
      }
    } else {
      console.error(`❌ Unknown command: ${command}`);
      console.error('');
      showGeneralHelp();
    }
  } else {
    showGeneralHelp();
  }
}

/**
 * Show general help
 */
function showGeneralHelp() {
  console.log('Boardcast Toolchain');
  console.log('===================');
  console.log('');
  console.log('A complete toolkit for creating animated tutorials with Boardcast DSL');
  console.log('');
  console.log('Commands:');
  
  Object.entries(COMMANDS).forEach(([name, cmd]) => {
    console.log(`  ${name.padEnd(12)} ${cmd.description}`);
  });
  
  console.log('');
  console.log('Usage:');
  console.log('  boardcast-toolchain <command> [options]');
  console.log('');
  console.log('Examples:');
  console.log('  boardcast-toolchain validate tutorial.board');
  console.log('  boardcast-toolchain build tutorial.board');
  console.log('  boardcast-toolchain serve tutorial.board');
  console.log('  boardcast-toolchain record tutorial.board');
  console.log('');
  console.log('For detailed help on a command:');
  console.log('  boardcast-toolchain help <command>');
  console.log('');
  console.log('Workflow:');
  console.log('  1. Create a .board file with your tutorial commands');
  console.log('  2. Develop: boardcast-toolchain serve tutorial.board (live preview)');
  console.log('  3. Validate: boardcast-toolchain validate tutorial.board');
  console.log('  4. Build: boardcast-toolchain build tutorial.board');
  console.log('  5. Record: boardcast-toolchain record tutorial.board');
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showGeneralHelp();
    process.exit(0);
  }
  
  const command = args[0];
  const commandArgs = args.slice(1);
  
  if (!COMMANDS[command]) {
    console.error(`❌ Unknown command: ${command}`);
    console.error('');
    console.error('Available commands: ' + Object.keys(COMMANDS).join(', '));
    console.error('');
    console.error('Use "boardcast-toolchain help" for more information.');
    process.exit(1);
  }
  
  try {
    await COMMANDS[command].action(commandArgs);
  } catch (error) {
    console.error(`❌ Command failed: ${error.message}`);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

export { main, COMMANDS };