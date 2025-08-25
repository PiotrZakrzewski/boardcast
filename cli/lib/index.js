#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from package.json
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const VERSION = packageJson.version;

/**
 * Print version information
 */
function printVersion() {
  console.log(`Boardcast v${VERSION}`);
}

const command = process.argv[2];
const arg = process.argv[3];

function showHelp() {
  printVersion();
  console.log(`
Boardcast CLI - Create animated hex board tutorials

DSL Commands (.board files):
  boardcast validate <file.board>      Validate .board file syntax
  boardcast compile <file.board>       Compile .board to JavaScript  
  boardcast build <file.board>         Validate and compile .board file
  boardcast serve <file.board>         Live development server with hot reload
  boardcast record <file.board>        Build and record .board file to video

JavaScript Commands (.js files):
  boardcast create <filename.js>       Create new tutorial boilerplate
  boardcast record <filename.js>       Record JavaScript tutorial to video

Examples:
  boardcast serve my-tutorial.board    # Live development
  boardcast build my-tutorial.board    # Build for production
  boardcast record my-tutorial.board   # Create video

  boardcast create my-tutorial.js      # Create JS boilerplate
  boardcast record my-tutorial.js      # Record JS tutorial

Standalone commands:
  boardcast-create <filename.js>       Direct create command
  boardcast-record <filename.js>       Direct record command
  boardcast-toolchain <command>        Direct DSL toolchain access
  `);
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  // Handle version command
  if (command === 'version' || command === '--version' || command === '-v') {
    printVersion();
    return;
  }

  // Check if this is a DSL command by looking at file extension or command type
  const isDSLCommand = ['validate', 'compile', 'build', 'serve'].includes(command) || 
                       (arg && arg.endsWith('.board'));

  // Handle DSL commands by delegating to toolchain
  if (isDSLCommand && ['validate', 'compile', 'build', 'serve', 'record'].includes(command)) {
    const { main: toolchainMain } = await import('../../toolchain/boardcast-toolchain.js');
    // Set up argv for toolchain: [node, script, command, ...args]
    const originalArgv = process.argv;
    process.argv = ['node', 'boardcast-toolchain', command, ...process.argv.slice(3)];
    
    try {
      await toolchainMain();
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      process.exit(1);
    } finally {
      process.argv = originalArgv;
    }
    return;
  }

  // Handle JavaScript-based commands (legacy)
  switch (command) {
    case 'create':
      printVersion();
      if (!arg) {
        console.error('❌ Error: Please specify a filename');
        console.log('Usage: boardcast create <filename.js>');
        process.exit(1);
      }
      const { createTutorial } = await import('./create.js');
      await createTutorial(arg);
      break;

    case 'record':
      printVersion();
      if (!arg) {
        console.error('❌ Error: Please specify a tutorial file');
        console.log('Usage: boardcast record <filename.js>');
        process.exit(1);
      }
      
      // Check file extension to determine which record command to use
      if (arg.endsWith('.board')) {
        // Use toolchain for .board files
        const { main: toolchainMain } = await import('../../toolchain/boardcast-toolchain.js');
        const originalArgv = process.argv;
        process.argv = ['node', 'boardcast-toolchain', 'record', arg];
        
        try {
          await toolchainMain();
        } finally {
          process.argv = originalArgv;
        }
      } else {
        // Use traditional record for .js files
        const { recordTutorial } = await import('./record.js');
        await recordTutorial(arg);
      }
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});