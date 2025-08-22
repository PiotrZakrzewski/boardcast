# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boardcast is a unified npm package for creating animated demonstrations of tabletop game rules on hex-based boards. Built with TypeScript, D3.js, and Vite. It provides both a DSL toolchain for content creators and JavaScript APIs for developers.

## Package Structure

This is a single npm package with the following structure:

```
boardcast/
├── lib/                    # Core library source code
│   ├── BoardcastHexBoard.ts # Main library class
│   ├── types.ts           # TypeScript interfaces
│   └── index.ts           # Library exports
├── contrib/               # Game system extensions
│   └── lancer/            # Lancer RPG mechanics
│       ├── movement.ts    # Movement mechanics
│       ├── combat.ts      # Combat mechanics
│       ├── types.ts       # Lancer-specific types
│       └── index.ts       # Lancer exports
├── cli/                   # CLI tools for recording
│   ├── bin/               # CLI executables
│   ├── lib/               # CLI implementation
│   └── runtime/           # Runtime files for tutorials
├── toolchain/             # DSL toolchain for .board files
│   ├── bin/               # Toolchain CLI executable
│   ├── board-parser.js    # Chevrotain-based parser
│   ├── board-to-js.js     # Compiler (.board → JS)
│   ├── board-validator-chevrotain.js # DSL validator
│   └── boardcast-toolchain.js # Main toolchain CLI
├── demo/                  # Demo application
│   ├── demo.ts            # Demo TypeScript
│   ├── index.html         # Demo HTML
│   └── dist/              # Built demo files
├── dist/                  # Built library files
├── package.json           # Single package configuration
└── tsconfig.json          # Single TypeScript config
```

## Development Commands

From the boardcast directory:

```bash
# Install all dependencies
npm install

# Start demo development server (localhost:3000)
npm run dev

# Build library and contrib packages
npm run build

# Build everything including demo
npm run build:all

# Build specific components
npm run build:lib        # Core library only
npm run build:contrib    # Contrib packages only
npm run build:demo       # Demo only

# Run tests
npm run test

# Type checking
npm run typecheck

# Preview demo
npm run preview

# DSL Toolchain Commands (after npm install -g boardcast)
boardcast validate tutorial.board
boardcast serve tutorial.board
boardcast build tutorial.board
boardcast record tutorial.board

# Development commands (from project root)
npm run build        # Build all packages
npm run dev          # Start demo development server
npm run test         # Run tests
```

## Technology Stack

- **TypeScript**: Primary language with strict type checking
- **D3.js**: Data visualization and animation library
- **Vite**: Build tool and development server
- **ES Modules**: Modern JavaScript module system
- **Chevrotain**: Parser library for DSL toolchain
- **Node.js**: Runtime for CLI tools and development server

## Package Architecture

### 📦 Core Library (`lib/`)
**Purpose**: Main animation library for hex-based visualizations

Key Components:
- `BoardcastHexBoard.ts`: Main library class
- `types.ts`: TypeScript interfaces
- `index.ts`: Library exports

The core library provides:
- Hex grid visualization
- Animation methods (highlight, blink, pulse, point, caption)
- Token management and movement
- Clear/reset functionality

### 🎮 Game Extensions (`contrib/`)
**Purpose**: Game-specific mechanics and specialized visualizations

Current modules:
- `lancer/`: Lancer RPG mechanics (movement, combat, terrain)

The contrib library provides:
- Game-specific classes (LancerMovement, LancerCombat)
- Specialized visualization methods
- Pre-configured constants and types

### 🛠️ CLI Tools (`cli/`)
**Purpose**: Tools for creating and recording tutorials

Features:
- Template generation
- Video recording with Playwright
- Tutorial automation

### 🔥 DSL Toolchain (`toolchain/`)
**Purpose**: Complete workflow for .board files with Chevrotain-based parsing

Features:
- Robust parsing with Chevrotain lexer/parser
- Syntax and semantic validation
- Compilation to JavaScript
- Live development server with hot reload
- Real-time error display
- File watching and automatic recompilation

Components:
- `board-parser.js`: Chevrotain-based lexer and parser
- `board-validator-chevrotain.js`: Comprehensive validation with suggestions
- `board-to-js.js`: Compiler that outputs boardcast-cli compatible JavaScript
- `boardcast-toolchain.js`: Main CLI with validate, compile, build, serve, record commands
- `bin/boardcast-toolchain`: Executable CLI entry point

Usage:
```bash
# Install globally
npm install -g boardcast

# Available commands (primary interface)
boardcast validate tutorial.board
boardcast serve tutorial.board    # Live development server
boardcast build tutorial.board
boardcast record tutorial.board

# Also available as standalone commands
boardcast-toolchain validate tutorial.board  # Direct toolchain access
boardcast-create my-tutorial.js             # JavaScript boilerplate
boardcast-record my-tutorial.js             # JavaScript recording
```

### 🖥️ Demo Application (`demo/`)
**Purpose**: Interactive showcase of all functionality

Features:
- Demonstrates core library methods
- Shows contrib package capabilities
- Interactive buttons and tutorials
- Live examples of API usage

## Key Architecture Patterns

- **Configurable Grid System**: Adjustable grid size and hex dimensions for different game scales
- **Hex Coordinate System**: Uses axial coordinates (q, r) for hexagonal grid positioning
- **Game Piece Management**: Entities that can be animated between hex positions
- **Coordinate Display**: Toggle-able coordinate labels for development and education
- **Smooth Animations**: Easing functions for natural piece movement between hexes
- **Unified Package**: All functionality in one package with clean exports

## Import Patterns

### Using Core Library
```typescript
import { BoardcastHexBoard, ClearType } from 'boardcast';
```

### Using Contrib Extensions
```typescript
import { Lancer } from 'boardcast/contrib/lancer';
const movement = new Lancer.LancerMovement(board);
```

### Using CLI Tools
```typescript
import { createTutorial, recordVideo } from 'boardcast/cli';
```

### Demo Usage (All Features)
```typescript
import { BoardcastHexBoard, ClearType } from 'boardcast';
import * as Lancer from 'boardcast/contrib/lancer';
```

## Core Library API

The `BoardcastHexBoard` class provides the main functionality:

### Configuration Methods:
- `new BoardcastHexBoard(selector, config?)` - Initialize with optional GridConfig
- `setGridSize(radius)` - Change number of hexes displayed
- `setGridSizeWithScaling(radius)` - Change grid size with auto-scaled hex size
- `configure(config)` - Update multiple configuration options

### Animation Methods:
- `highlight(q, r, colour)` - Static hex highlighting
- `blink(q, r, colour)` - Sharp blinking animation
- `pulse(q, r, colour)` - Gradual color transitions
- `point(q, r, label?)` - Display arrows pointing at hexes
- `caption(text, duration?)` - Display text overlays
- `token(q, r, name, shape, colour, label?)` - Place tokens
- `move(tokenName, q, r)` - Animate token movement
- `clear(type?)` - Clear specific or all artifacts

### Utility Methods:
- `showCoordinates()` / `hideCoordinates()` - Toggle coordinate display
- `resetBoard()` - Reset all pieces and effects

## Contrib Library Extensions

### Lancer Module (`contrib/lancer`)

Classes:
- `LancerMovement`: Movement range calculation and visualization
- `LancerCombat`: Combat mechanics (engagement zones, weapon ranges)

Key Methods:
- `showMovementRange(q, r, speed)` - Visualize movement options
- `showEngagementZone(q, r)` - Display threat zones
- `showWeaponRange(q, r, weapon)` - Weapon targeting
- `showDifficultTerrain(hexes)` - Terrain effects
- `showDangerousTerrain(hexes)` - Hazard visualization

## Development Workflow

### For DSL Content Creation (End Users)
1. **Install**: `npm install -g boardcast`
2. **Create**: Write `.board` files using the Boardcast DSL
3. **Develop**: Use `boardcast serve` for live preview with hot reload
4. **Validate**: Use `boardcast validate` for syntax checking
5. **Build**: Use `boardcast build` for production compilation
6. **Record**: Use `boardcast record` for video generation

### For Core Development
1. **Core Changes**: Modify `lib/` for new animation features
2. **Game Extensions**: Add to `contrib/` for game-specific mechanics
3. **Demo Updates**: Update `demo/demo.ts` to showcase new features
4. **CLI Tools**: Extend `cli/` for new recording capabilities
5. **Toolchain**: Extend `toolchain/` for DSL parser improvements

## Build Process

1. Core library builds first (TypeScript compilation + Vite bundling)
2. Contrib packages build next (depends on core)
3. Demo builds last (uses both lib and contrib)
4. All components use Vite for bundling
5. TypeScript compilation generates declaration files

## Testing Strategy

- Core library: Full test suite with Vitest
- Contrib packages: Integration tests planned
- Demo: Manual testing and visual verification
- CLI: End-to-end automation testing

The unified package maintains clean separation while enabling rich integration for comprehensive hex-based game tutorials and educational content.