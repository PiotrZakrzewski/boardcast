#!/usr/bin/env node

import { readFileSync } from 'fs';
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
  console.log('  boardcast-toolchain record tutorial.board');
  console.log('');
  console.log('For detailed help on a command:');
  console.log('  boardcast-toolchain help <command>');
  console.log('');
  console.log('Workflow:');
  console.log('  1. Create a .board file with your tutorial commands');
  console.log('  2. Validate: boardcast-toolchain validate tutorial.board');
  console.log('  3. Build: boardcast-toolchain build tutorial.board');
  console.log('  4. Record: boardcast-toolchain record tutorial.board');
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