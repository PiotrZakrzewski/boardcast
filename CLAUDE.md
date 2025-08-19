# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boardcast is a monorepo ecosystem containing three packages for creating animated demonstrations of tabletop game rules on hex-based boards. Built with TypeScript, D3.js, and Vite.

## Monorepo Structure

This is an npm workspaces monorepo with the following packages:

```
/
├── boardcast/              # Core library package
│   ├── lib/               # Core library source code
│   ├── dist/              # Built library files
│   ├── package.json       # Core library config
│   └── tsconfig.json      # TypeScript config
├── boardcast-cli/          # CLI tools package
│   ├── bin/               # CLI executables
│   ├── lib/               # CLI implementation
│   └── package.json       # CLI config
├── boardcast-contrib/      # Game system extensions
│   ├── lancer/            # Lancer RPG mechanics
│   ├── dist/              # Built contrib files
│   ├── package.json       # Contrib config
│   └── tsconfig.json      # TypeScript config
├── demo/                   # Demo application (uses all packages)
│   ├── demo.ts            # Demo TypeScript using both packages
│   ├── index.html         # Demo HTML
│   ├── dist/              # Built demo files
│   ├── package.json       # Demo config
│   └── tsconfig.json      # TypeScript config
└── package.json           # Workspace root configuration
```

## Development Commands

From the root directory:

```bash
# Install all dependencies
npm install

# Start demo development server (localhost:3000)
npm run dev

# Build all packages
npm run build

# Build specific package
npm run build --workspace=boardcast
npm run build --workspace=boardcast-contrib

# Run tests
npm run test

# Type checking
npm run typecheck

# Demo commands
npm run build:demo
npm run preview
```

## Technology Stack

- **TypeScript**: Primary language with strict type checking
- **D3.js**: Data visualization and animation library
- **Vite**: Build tool and development server
- **npm workspaces**: Monorepo management
- **ES Modules**: Modern JavaScript module system

## Package Architecture

### 📦 Boardcast (Core Library)
**Location**: `boardcast/`
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

### 🎮 Boardcast-Contrib (Game Extensions)
**Location**: `boardcast-contrib/`
**Purpose**: Game-specific mechanics and specialized visualizations

Current modules:
- `lancer/`: Lancer RPG mechanics (movement, combat, terrain)

The contrib library provides:
- Game-specific classes (LancerMovement, LancerCombat)
- Specialized visualization methods
- Pre-configured constants and types

### 🛠️ Boardcast-CLI (Command Line Tools)
**Location**: `boardcast-cli/`
**Purpose**: Tools for creating and recording tutorials

Features:
- Template generation
- Video recording with Playwright
- Tutorial automation

### 🖥️ Demo Application
**Location**: `demo/`
**Purpose**: Interactive showcase of all packages

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
- **Package Separation**: Clean separation between core, contrib, CLI, and demo

## Cross-Package Dependencies

```
demo → boardcast (core animations)
demo → boardcast-contrib (game mechanics)
boardcast-contrib → boardcast (extends core)
boardcast-cli → boardcast (creates tutorials)
```

## Import Patterns

### Using Core Library
```typescript
import { BoardcastHexBoard, ClearType } from 'boardcast';
```

### Using Contrib Extensions
```typescript
import { Lancer } from 'boardcast-contrib/lancer';
const movement = new Lancer.LancerMovement(board);
```

### Demo Usage (Both Packages)
```typescript
import { BoardcastHexBoard, ClearType } from 'boardcast';
import * as Lancer from 'boardcast-contrib/lancer';
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

### Lancer Module (`boardcast-contrib/lancer`)

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

1. **Core Changes**: Modify `boardcast/lib/` for new animation features
2. **Game Extensions**: Add to `boardcast-contrib/` for game-specific mechanics
3. **Demo Updates**: Update `demo/demo.ts` to showcase new features
4. **CLI Tools**: Extend `boardcast-cli/` for new recording capabilities

## Build Process

1. `boardcast` builds first (core dependency)
2. `boardcast-contrib` builds next (depends on core)
3. `demo` builds last (uses both packages)
4. All packages use Vite for bundling
5. TypeScript compilation generates declaration files

## Testing Strategy

- Core library: Full test suite with Vitest
- Contrib packages: Integration tests planned
- Demo: Manual testing and visual verification
- CLI: End-to-end automation testing

The monorepo maintains clean separation while enabling rich cross-package integration for comprehensive hex-based game tutorials and educational content.