import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { parseBoardContent, formatParsingError } from './board-parser.js';

/**
 * Board to JavaScript Compiler
 * Converts .board files to JavaScript files compatible with the boardcast CLI
 */

/**
 * Default configuration for generated tutorials
 */
const DEFAULT_CONFIG = {
  gridRadius: 8,
  title: "Generated Tutorial"
};

/**
 * Convert parsed argument to JavaScript code representation
 */
function argumentToJS(arg) {
  switch (arg.type) {
    case 'string':
      return `"${arg.value.replace(/"/g, '\\"')}"`;
    case 'number':
      return arg.value.toString();
    case 'boolean':
      return arg.value.toString();
    case 'identifier':
      return `"${arg.value}"`;
    case 'enum':
      if (arg.enumType === 'ClearType') {
        return `"${arg.value}"`;
      } else if (arg.enumType === 'Colors') {
        // Pass color constants as strings to be resolved by BoardcastHexBoard
        // This allows dynamic color resolution and easier maintenance
        if (arg.raw.startsWith('Colors.')) {
          // Convert "Colors.BLUE" to just "BLUE"
          return `"${arg.raw.slice(7)}"`;
        }
        return `"${arg.raw}"`;
      }
      return `"${arg.value}"`;
    default:
      return `"${arg.value || arg.raw}"`;
  }
}

/**
 * Convert a command to JavaScript code
 */
function commandToJS(command, isAsync = false) {
  // Special handling for sleep method
  if (command.method === 'sleep') {
    const args = command.args.map(argumentToJS).join(', ');
    return `  await sleep(${args});`;
  }
  
  const args = command.args.map(argumentToJS).join(', ');
  const methodCall = `board.${command.method}(${args})`;
  
  if (isAsync) {
    return `  await ${methodCall};`;
  } else {
    return `  ${methodCall};`;
  }
}

/**
 * Analyze commands to determine sleep delays
 */
function analyzeCommands(commands) {
  const jsLines = [];
  let needsSleep = false;
  
  // Group commands and add appropriate delays
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const nextCommand = commands[i + 1];
    
    // Check if this command might need to be awaited
    const isAsyncCommand = ['move', 'caption', 'sleep'].includes(command.method);
    
    jsLines.push(commandToJS(command, isAsyncCommand));
    
    if (isAsyncCommand) {
      needsSleep = true;
    }
    
    // Add natural delays between different types of operations
    if (nextCommand) {
      const shouldAddDelay = shouldAddDelayBetween(command, nextCommand);
      if (shouldAddDelay) {
        jsLines.push('  await sleep(1000);');
        needsSleep = true;
      }
    }
  }
  
  return { jsLines, needsSleep };
}

/**
 * Determine if a delay should be added between two commands
 */
function shouldAddDelayBetween(currentCommand, nextCommand) {
  // Add delay after clearing operations
  if (currentCommand.method === 'clear') {
    return true;
  }
  
  // Add delay between token placement and movement
  if (currentCommand.method === 'token' && nextCommand.method === 'move') {
    return true;
  }
  
  // Add delay between setup commands and action commands
  const setupCommands = ['setGridSize', 'setGridSizeWithScaling', 'showCoordinates', 'token'];
  const actionCommands = ['move', 'point', 'caption'];
  
  if (setupCommands.includes(currentCommand.method) && actionCommands.includes(nextCommand.method)) {
    return true;
  }
  
  // Add delay after highlighting groups
  if (currentCommand.method === 'highlight' && nextCommand.method !== 'highlight') {
    return true;
  }
  
  return false;
}

/**
 * Extract configuration from commands
 */
function extractConfig(commands) {
  const config = { ...DEFAULT_CONFIG };
  
  // Look for grid size commands
  for (const command of commands) {
    if (command.method === 'setGridSize' || command.method === 'setGridSizeWithScaling') {
      if (command.args.length > 0 && command.args[0].type === 'number') {
        config.gridRadius = command.args[0].value;
      }
    }
  }
  
  return config;
}

/**
 * Generate JavaScript code from parsed commands
 */
function generateJS(commands, options = {}) {
  const config = extractConfig(commands);
  const title = options.title || path.basename(options.filename || 'tutorial', '.board');
  config.title = title;
  
  const { jsLines, needsSleep } = analyzeCommands(commands);
  
  // Build the JavaScript output
  const js = `// Generated from ${options.filename || 'board file'}
// Tutorial Configuration
export const config = {
  gridRadius: ${config.gridRadius},
  title: "${config.title}"
};

// Main tutorial function - automatically generated from .board file
export async function runTutorial(board) {
  console.log('Starting generated tutorial...');
  
  // Clear any existing state
  board.resetBoard();
  
${jsLines.join('\n')}
  
  console.log('Tutorial complete!');
}
${needsSleep ? `
// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}` : ''}

/*
Generated Tutorial Notes:
- This file was automatically generated from a .board file
- You can modify this file manually if needed
- The tutorial can be recorded using: boardcast record ${title}.js
- Commands are executed sequentially with automatic timing
*/`;

  return js;
}

/**
 * Compile a .board file to JavaScript
 */
function compileBoardFile(inputPath, outputPath = null) {
  try {
    // Read and parse the board file
    const content = readFileSync(inputPath, 'utf-8');
    const parseResult = parseBoardContent(content);
    
    if (!parseResult.success) {
      console.error('❌ Parse errors in board file:');
      parseResult.errors.forEach(error => {
        console.error(formatParsingError(error, content));
      });
      return { success: false, errors: parseResult.errors };
    }
    
    // Generate output path if not provided
    if (!outputPath) {
      const baseName = path.basename(inputPath, '.board');
      outputPath = path.join(path.dirname(inputPath), `${baseName}.js`);
    }
    
    // Generate JavaScript code
    const options = {
      filename: path.basename(inputPath),
      title: path.basename(inputPath, '.board')
    };
    
    const jsCode = generateJS(parseResult.commands, options);
    
    // Write the output file
    writeFileSync(outputPath, jsCode, 'utf-8');
    
    return {
      success: true,
      inputFile: inputPath,
      outputFile: outputPath,
      commandCount: parseResult.commands.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node board-to-js.js <input.board> [output.js]');
    console.error('');
    console.error('Compiles a .board file to JavaScript compatible with the boardcast CLI');
    console.error('');
    console.error('Options:');
    console.error('  input.board   Input .board file');
    console.error('  output.js     Output JavaScript file (optional, defaults to input name with .js extension)');
    console.error('');
    console.error('Examples:');
    console.error('  node board-to-js.js tutorial.board');
    console.error('  node board-to-js.js tutorial.board my-tutorial.js');
    console.error('');
    console.error('Generated files can be used with the boardcast CLI:');
    console.error('  boardcast record tutorial.js');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  // Validate input file
  if (!inputFile.endsWith('.board')) {
    console.error('❌ Error: Input file must have .board extension');
    process.exit(1);
  }
  
  console.log('Boardcast Board-to-JS Compiler');
  console.log('==============================');
  console.log(`Input file: ${inputFile}`);
  
  const result = compileBoardFile(inputFile, outputFile);
  
  if (result.success) {
    console.log(`✅ Compilation successful!`);
    console.log(`📝 Generated: ${result.outputFile}`);
    console.log(`📊 Commands processed: ${result.commandCount}`);
    console.log('');
    console.log('🎬 Next steps:');
    console.log(`   1. Review generated file: ${result.outputFile}`);
    console.log(`   2. Record tutorial: boardcast record ${result.outputFile}`);
    process.exit(0);
  } else {
    console.error('❌ Compilation failed:');
    if (result.errors) {
      result.errors.forEach(error => {
        console.error(`   ${error.message}`);
      });
    } else {
      console.error(`   ${result.error}`);
    }
    process.exit(1);
  }
}

export { compileBoardFile, generateJS, extractConfig };