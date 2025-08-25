import { readFileSync } from 'fs';
import path from 'path';
import { parseBoardContent, formatParsingError } from './board-parser.js';

/**
 * Boardcast Board File Validator with Chevrotain
 * Validates .board files using robust parsing and reports detailed errors
 */

/**
 * Valid method signatures for BoardcastHexBoard
 */
const VALID_METHODS = {
  // Grid configuration
  setGridSize: { args: 1, types: ['number'], description: 'setGridSize(radius)' },
  setGridSizeWithScaling: { args: 1, types: ['number'], description: 'setGridSizeWithScaling(radius)' },
  showCoordinates: { args: 0, types: [], description: 'showCoordinates()' },
  hideCoordinates: { args: 0, types: [], description: 'hideCoordinates()' },
  resetBoard: { args: 0, types: [], description: 'resetBoard()' },
  
  // Hex effects
  highlight: { 
    args: [2, 3], 
    types: [['number', 'number'], ['number', 'number', 'string']], 
    description: 'highlight(q, r, color?)' 
  },
  blink: { 
    args: [2, 3], 
    types: [['number', 'number'], ['number', 'number', 'string']], 
    description: 'blink(q, r, color?)' 
  },
  pulse: { 
    args: [2, 3], 
    types: [['number', 'number'], ['number', 'number', 'string']], 
    description: 'pulse(q, r, color?)' 
  },
  
  // Visual indicators
  point: { 
    args: [2, 3], 
    types: [['number', 'number'], ['number', 'number', 'string']], 
    description: 'point(q, r, label?)' 
  },
  caption: { 
    args: [1, 2, 3], 
    types: [['string'], ['string', 'number'], ['string', 'number', 'string']], 
    description: 'caption(text, duration?, position?)' 
  },
  dice: {
    args: 2,
    types: ['string', 'number'],
    description: 'dice(dieType, displayedNumber)'
  },
  
  // Game pieces
  token: { 
    args: [5, 6], 
    types: [['number', 'number', 'string', 'string', 'string'], ['number', 'number', 'string', 'string', 'string', 'string']], 
    description: 'token(q, r, name, shape, color, label?)' 
  },
  move: { 
    args: 3, 
    types: ['string', 'number', 'number'], 
    description: 'move(tokenName, q, r)' 
  },
  
  // Clearing
  clear: { 
    args: [0, 1], 
    types: [[], ['string']], 
    description: 'clear(type?)' 
  },
  
  // Timing
  sleep: {
    args: 1,
    types: ['number'],
    description: 'sleep(milliseconds)'
  }
};

/**
 * Valid values for specific parameters
 */
const VALID_VALUES = {
  shapes: ['circle', 'rect', 'triangle', 'star'],
  clearTypes: ['ALL', 'HIGHLIGHT', 'BLINK', 'PULSE', 'POINT', 'TOKEN', 'CAPTION', 'DICE'],
  positions: ['center', 'bottom']
};

/**
 * Calculate similarity score between two strings (higher is better)
 */
function calculateSimilarityScore(str1, str2) {
  // Exact match
  if (str1 === str2) return 100;
  
  // Contains check
  if (str2.includes(str1) || str1.includes(str2)) return 80;
  
  // Starts with check
  if (str2.startsWith(str1) || str1.startsWith(str2)) return 70;
  
  // Levenshtein distance based score
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  
  if (distance <= 1) return 60;
  if (distance <= 2) return 40;
  if (distance <= 3) return 25;
  if (distance <= 4) return 15;
  if (distance <= 5 && maxLen > 6) return 10;
  
  return 0;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Validate color format
 */
function isValidColor(color) {
  // Hex color pattern
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return true;
  }
  
  // Colors constant
  if (color.startsWith('Colors.')) {
    return true;
  }
  
  // Common color names (basic validation)
  const commonColors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'white', 'black'];
  if (commonColors.includes(color.toLowerCase())) {
    return true;
  }
  
  return false;
}

/**
 * Convert parsed argument to simple type for validation
 */
function getArgumentTypeAndValue(arg) {
  if (typeof arg === 'object' && arg.type) {
    return { type: arg.type, value: arg.value };
  }
  
  // Fallback for simple values
  if (typeof arg === 'string') return { type: 'string', value: arg };
  if (typeof arg === 'number') return { type: 'number', value: arg };
  if (typeof arg === 'boolean') return { type: 'boolean', value: arg };
  
  return { type: 'unknown', value: arg };
}

/**
 * Validate specific argument values
 */
function validateArgumentValue(method, argIndex, value, type) {
  // Coordinate validation (q, r parameters)
  if ((method === 'highlight' || method === 'blink' || method === 'pulse' || 
       method === 'point' || method === 'token' || method === 'move') && 
      (argIndex === 0 || argIndex === 1) && type === 'number') {
    if (!Number.isInteger(value) || value < -20 || value > 20) {
      return `Coordinate must be an integer between -20 and 20, got ${value}.`;
    }
  }

  // Grid radius validation
  if ((method === 'setGridSize' || method === 'setGridSizeWithScaling') && 
      argIndex === 0 && type === 'number') {
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      return `Grid radius must be an integer between 1 and 20, got ${value}.`;
    }
  }

  // Shape validation
  if (method === 'token' && argIndex === 3 && type === 'string') {
    if (!VALID_VALUES.shapes.includes(value)) {
      return `Token shape must be one of: ${VALID_VALUES.shapes.join(', ')}, got "${value}".`;
    }
  }

  // Color validation
  if (type === 'string' && (
    (method === 'highlight' && argIndex === 2) ||
    (method === 'blink' && argIndex === 2) ||
    (method === 'pulse' && argIndex === 2) ||
    (method === 'token' && argIndex === 4)
  )) {
    if (!isValidColor(value)) {
      return `Color must be a valid hex color (e.g., "#FF0000") or Colors constant, got "${value}".`;
    }
  }

  // Clear type validation
  if (method === 'clear' && argIndex === 0 && type === 'string') {
    if (!VALID_VALUES.clearTypes.includes(value)) {
      return `Clear type must be one of: ${VALID_VALUES.clearTypes.join(', ')}, got "${value}".`;
    }
  }

  // Caption position validation
  if (method === 'caption' && argIndex === 2 && type === 'string') {
    if (!VALID_VALUES.positions.includes(value)) {
      return `Caption position must be one of: ${VALID_VALUES.positions.join(', ')}, got "${value}".`;
    }
  }

  // Duration validation
  if (method === 'caption' && argIndex === 1 && type === 'number') {
    if (!Number.isInteger(value) || value < 0 || value > 60000) {
      return `Caption duration must be an integer between 0 and 60000 milliseconds, got ${value}.`;
    }
  }

  return null;
}

/**
 * Validate a parsed command using semantic analysis
 */
function validateCommand(command) {
  const { method, args, location } = command;

  // Check if method exists
  if (!VALID_METHODS[method]) {
    const suggestions = Object.keys(VALID_METHODS)
      .map(m => ({
        method: m,
        score: calculateSimilarityScore(method.toLowerCase(), m.toLowerCase())
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.method);
    
    let error = `Unknown method: "${method}".`;
    if (suggestions.length > 0) {
      error += ` Did you mean: ${suggestions.join(', ')}?`;
    }
    
    return { 
      valid: false, 
      error, 
      line: location.startLine,
      column: location.startColumn 
    };
  }

  const methodSpec = VALID_METHODS[method];

  // Check argument count
  const expectedArgs = Array.isArray(methodSpec.args) ? methodSpec.args : [methodSpec.args];
  if (!expectedArgs.includes(args.length)) {
    return {
      valid: false,
      error: `Method "${method}" expects ${expectedArgs.join(' or ')} arguments, got ${args.length}. Usage: ${methodSpec.description}`,
      line: location.startLine,
      column: location.startColumn
    };
  }

  // Validate argument types and values
  const expectedTypes = Array.isArray(methodSpec.types[0]) ? 
    methodSpec.types.find(typePattern => typePattern.length === args.length) || methodSpec.types[0] :
    methodSpec.types;

  if (expectedTypes) {
    for (let i = 0; i < args.length; i++) {
      const expectedType = expectedTypes[i];
      const argInfo = getArgumentTypeAndValue(args[i]);
      const actualType = argInfo.type;
      const actualValue = argInfo.value;

      if (expectedType !== actualType) {
        return {
          valid: false,
          error: `Argument ${i + 1} of "${method}" expects ${expectedType}, got ${actualType} ("${actualValue}"). Usage: ${methodSpec.description}`,
          line: location.startLine,
          column: location.startColumn
        };
      }

      // Validate specific value constraints
      const validationError = validateArgumentValue(method, i, actualValue, actualType);
      if (validationError) {
        return {
          valid: false,
          error: `${validationError} Usage: ${methodSpec.description}`,
          line: location.startLine,
          column: location.startColumn
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Validate a complete board file using Chevrotain parser
 */
function validateBoardFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parseResult = parseBoardContent(content);
    
    // Check for parsing errors first
    if (!parseResult.success) {
      const firstError = parseResult.errors[0];
      return {
        valid: false,
        error: firstError.message,
        line: firstError.line,
        column: firstError.column,
        lineContent: firstError.line ? content.split('\\n')[firstError.line - 1]?.trim() : '',
        formattedError: formatParsingError(firstError, content)
      };
    }
    
    // Perform semantic validation on each command
    for (const command of parseResult.commands) {
      const validation = validateCommand(command);
      
      if (!validation.valid) {
        const lines = content.split('\\n');
        return {
          valid: false,
          error: validation.error,
          line: validation.line,
          column: validation.column,
          lineContent: validation.line ? lines[validation.line - 1]?.trim() : ''
        };
      }
    }
    
    return { valid: true, message: 'Board file is valid!' };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { valid: false, error: `File not found: ${filePath}` };
    }
    return { valid: false, error: `Failed to read file: ${error.message}` };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node board-validator-chevrotain.js <board-file>');
    console.error('');
    console.error('Validates a .board file using Chevrotain parser and reports the first error found.');
    console.error('');
    console.error('Example:');
    console.error('  node board-validator-chevrotain.js example.board');
    process.exit(1);
  }
  
  const boardFile = args[0];
  
  // Validate file extension
  if (!boardFile.endsWith('.board')) {
    console.error('Error: Board file must have .board extension');
    process.exit(1);
  }
  
  const fullPath = path.resolve(boardFile);
  console.log('Boardcast Board Validator (Chevrotain)');
  console.log('=====================================');
  console.log(`Validating: ${fullPath}`);
  console.log('');
  
  const result = validateBoardFile(fullPath);
  
  if (result.valid) {
    console.log('✅ ' + result.message);
    process.exit(0);
  } else {
    console.error('❌ Validation failed:');
    if (result.line) {
      console.error(`   Line ${result.line}${result.column ? ':' + result.column : ''}: ${result.lineContent}`);
    }
    console.error(`   Error: ${result.error}`);
    
    // Show formatted error if available (for parsing errors)
    if (result.formattedError) {
      console.error('');
      console.error('Detailed error:');
      console.error(result.formattedError);
    }
    
    process.exit(1);
  }
}

export { validateBoardFile };