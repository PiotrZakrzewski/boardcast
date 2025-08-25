import { 
  createToken, 
  Lexer, 
  CstParser, 
  tokenMatcher 
} from 'chevrotain';

/**
 * Boardcast DSL Parser using Chevrotain
 * Provides robust parsing for .board files with detailed error reporting
 */

// Token definitions
const WhiteSpace = createToken({ 
  name: "WhiteSpace", 
  pattern: /\s+/, 
  group: Lexer.SKIPPED 
});

const Comment = createToken({ 
  name: "Comment", 
  pattern: /#[^\r\n]*/, 
  group: Lexer.SKIPPED 
});

const Identifier = createToken({ 
  name: "Identifier", 
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ 
});

const StringLiteral = createToken({ 
  name: "StringLiteral", 
  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/ 
});

const NumberLiteral = createToken({ 
  name: "NumberLiteral", 
  pattern: /-?\d+(?:\.\d+)?/ 
});

const BooleanLiteral = createToken({ 
  name: "BooleanLiteral", 
  pattern: /true|false/ 
});

const Dot = createToken({ 
  name: "Dot", 
  pattern: /\./ 
});

const LeftParen = createToken({ 
  name: "LeftParen", 
  pattern: /\(/ 
});

const RightParen = createToken({ 
  name: "RightParen", 
  pattern: /\)/ 
});

const Comma = createToken({ 
  name: "Comma", 
  pattern: /,/ 
});

const NewLine = createToken({ 
  name: "NewLine", 
  pattern: /\r?\n/ 
});

// All tokens
const allTokens = [
  WhiteSpace,
  Comment,
  NewLine,
  StringLiteral,
  NumberLiteral,
  BooleanLiteral,
  LeftParen,
  RightParen,
  Comma,
  Dot,
  Identifier
];

// Lexer
const BoardLexer = new Lexer(allTokens);

// Parser
class BoardParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  program = this.RULE("program", () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.command) },
        { ALT: () => this.CONSUME(NewLine) }
      ]);
    });
  });

  command = this.RULE("command", () => {
    this.SUBRULE(this.methodCall);
    this.OPTION(() => this.CONSUME(NewLine));
  });

  methodCall = this.RULE("methodCall", () => {
    this.CONSUME(Identifier, { LABEL: "methodName" });
    this.CONSUME(LeftParen);
    this.OPTION(() => this.SUBRULE(this.argumentList));
    this.CONSUME(RightParen);
  });

  argumentList = this.RULE("argumentList", () => {
    this.SUBRULE(this.argument);
    this.MANY(() => {
      this.CONSUME(Comma);
      this.SUBRULE2(this.argument);
    });
  });

  argument = this.RULE("argument", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.stringLiteral) },
      { ALT: () => this.SUBRULE(this.numberLiteral) },
      { ALT: () => this.SUBRULE(this.booleanLiteral) },
      { ALT: () => this.SUBRULE(this.enumValue) },
      { ALT: () => this.CONSUME(Identifier) }
    ]);
  });

  stringLiteral = this.RULE("stringLiteral", () => {
    this.CONSUME(StringLiteral);
  });

  numberLiteral = this.RULE("numberLiteral", () => {
    this.CONSUME(NumberLiteral);
  });

  booleanLiteral = this.RULE("booleanLiteral", () => {
    this.CONSUME(BooleanLiteral);
  });

  enumValue = this.RULE("enumValue", () => {
    this.CONSUME(Identifier, { LABEL: "enumType" });
    this.CONSUME(Dot);
    this.CONSUME2(Identifier, { LABEL: "enumValue" });
  });
}

// Parser instance
const parserInstance = new BoardParser();

/**
 * Visitor for converting CST to AST and performing semantic analysis
 */
class BoardInterpreter extends parserInstance.getBaseCstVisitorConstructor() {
  constructor() {
    super();
    this.validateVisitor();
  }

  program(ctx) {
    const commands = [];
    if (ctx.command) {
      ctx.command.forEach(commandCtx => {
        const command = this.visit(commandCtx);
        if (command) {
          commands.push(command);
        }
      });
    }
    return commands;
  }

  command(ctx) {
    return this.visit(ctx.methodCall);
  }

  methodCall(ctx) {
    const methodName = ctx.methodName[0].image;
    const args = ctx.argumentList ? this.visit(ctx.argumentList) : [];
    
    return {
      method: methodName,
      args: args,
      location: {
        startLine: ctx.methodName[0].startLine,
        startColumn: ctx.methodName[0].startColumn,
        endLine: ctx.RightParen[0].endLine,
        endColumn: ctx.RightParen[0].endColumn
      }
    };
  }

  argumentList(ctx) {
    return ctx.argument.map(argCtx => this.visit(argCtx));
  }

  argument(ctx) {
    if (ctx.stringLiteral) {
      return this.visit(ctx.stringLiteral);
    } else if (ctx.numberLiteral) {
      return this.visit(ctx.numberLiteral);
    } else if (ctx.booleanLiteral) {
      return this.visit(ctx.booleanLiteral);
    } else if (ctx.enumValue) {
      return this.visit(ctx.enumValue);
    } else if (ctx.Identifier) {
      return {
        type: 'identifier',
        value: ctx.Identifier[0].image,
        raw: ctx.Identifier[0].image
      };
    }
  }

  stringLiteral(ctx) {
    const raw = ctx.StringLiteral[0].image;
    const value = raw.slice(1, -1); // Remove quotes
    return {
      type: 'string',
      value: value,
      raw: raw
    };
  }

  numberLiteral(ctx) {
    const raw = ctx.NumberLiteral[0].image;
    const value = parseFloat(raw);
    return {
      type: 'number',
      value: value,
      raw: raw
    };
  }

  booleanLiteral(ctx) {
    const raw = ctx.BooleanLiteral[0].image;
    const value = raw === 'true';
    return {
      type: 'boolean',
      value: value,
      raw: raw
    };
  }

  enumValue(ctx) {
    const enumType = ctx.enumType[0].image;
    const enumValue = ctx.enumValue[0].image;
    
    // Handle specific enum types
    if (enumType === 'ClearType') {
      return {
        type: 'string',
        value: enumValue,
        raw: `${enumType}.${enumValue}`
      };
    } else if (enumType === 'Colors') {
      return {
        type: 'enum',
        enumType: 'Colors',
        value: enumValue,
        raw: `${enumType}.${enumValue}`
      };
    }
    
    return {
      type: 'enum',
      enumType: enumType,
      value: enumValue,
      raw: `${enumType}.${enumValue}`
    };
  }
}

/**
 * Parse board file content using Chevrotain
 */
function parseBoardContent(content) {
  // Lexical analysis
  const lexResult = BoardLexer.tokenize(content);
  
  if (lexResult.errors.length > 0) {
    return {
      success: false,
      errors: lexResult.errors.map(error => ({
        type: 'lexical',
        message: error.message,
        line: error.line,
        column: error.column,
        length: error.length
      }))
    };
  }

  // Set the parser input
  parserInstance.input = lexResult.tokens;

  // Parse
  const cst = parserInstance.program();

  if (parserInstance.errors.length > 0) {
    return {
      success: false,
      errors: parserInstance.errors.map(error => ({
        type: 'syntactic',
        message: error.message,
        line: error.token?.startLine,
        column: error.token?.startColumn,
        expectedTokenTypes: error.expectedTokenTypes?.map(t => t.name),
        actualToken: error.token?.image
      }))
    };
  }

  // Convert CST to AST
  const interpreter = new BoardInterpreter();
  const commands = interpreter.visit(cst);

  return {
    success: true,
    commands: commands,
    tokens: lexResult.tokens
  };
}

/**
 * Parse a board file from file path
 */
async function parseBoardFile(filePath) {
  try {
    const fs = await import('fs');
    const content = fs.readFileSync(filePath, 'utf-8');
    return parseBoardContent(content);
  } catch (error) {
    return {
      success: false,
      errors: [{
        type: 'file',
        message: `Failed to read file: ${error.message}`,
        filePath: filePath
      }]
    };
  }
}

/**
 * Format parsing errors for display
 */
function formatParsingError(error, content) {
  const lines = content.split('\n');
  let message = `${error.type.toUpperCase()} ERROR: ${error.message}`;
  
  if (error.line && error.line <= lines.length) {
    const line = lines[error.line - 1];
    message += `\n  Line ${error.line}: ${line.trim()}`;
    
    if (error.column) {
      const pointer = ' '.repeat(error.column + 8) + '^';
      message += `\n${pointer}`;
    }
  }
  
  if (error.expectedTokenTypes && error.expectedTokenTypes.length > 0) {
    message += `\n  Expected: ${error.expectedTokenTypes.join(', ')}`;
  }
  
  if (error.actualToken) {
    message += `\n  Found: "${error.actualToken}"`;
  }
  
  return message;
}

export { 
  parseBoardContent, 
  parseBoardFile, 
  formatParsingError,
  BoardLexer,
  BoardParser,
  BoardInterpreter
};