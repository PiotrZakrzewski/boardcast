# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boardcast is a TypeScript library for creating animated demonstrations of tabletop game rules on hex-based boards. Built with D3.js for smooth animations and Vite for fast development.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck
```

## Technology Stack

- **TypeScript**: Primary language with strict type checking
- **D3.js**: Data visualization and animation library
- **Vite**: Build tool and development server
- **ES Modules**: Modern JavaScript module system

## Project Structure

```
lib/                          # Library source code
├── BoardcastHexBoard.ts         # Main library class
├── types.ts                    # TypeScript interfaces
└── index.ts                    # Library exports
demo/                         # Demo application
├── index.html                  # Demo HTML
└── demo.ts                     # Demo TypeScript
dist/                         # Built files (generated)
├── lib/                        # Built library for npm
└── demo/                       # Built demo for deployment
package.json                  # Dependencies and scripts
tsconfig.json                 # TypeScript configuration
vite.lib.config.ts           # Vite config for library build
vite.demo.config.ts          # Vite config for demo build
```

## Key Architecture Patterns

- **Configurable Grid System**: Adjustable grid size and hex dimensions for different game scales
- **Hex Coordinate System**: Uses axial coordinates (q, r) for hexagonal grid positioning
- **Game Piece Management**: Entities that can be animated between hex positions
- **Coordinate Display**: Toggle-able coordinate labels for development and education
- **Smooth Animations**: Easing functions for natural piece movement between hexes
- **Library/Demo Separation**: Clean separation between importable library and web demonstration

## Library vs Demo

**Library (`lib/`)**: 
- Pure TypeScript classes and interfaces
- No DOM initialization or event handlers
- Requires SVG selector parameter in constructor
- Designed for import by other projects
- Exports: `BoardcastHexBoard`, `HexCell`, `GamePiece`, `GridConfig`

**Demo (`demo/`)**:
- Web application showcasing library features
- HTML interface with buttons and controls
- Event handlers and UI interactions
- Initializes library with DOM elements
- Serves as documentation and testing environment

## Library Components

The `BoardcastHexBoard` class in `lib/BoardcastHexBoard.ts` provides the core functionality:

### Configuration Methods:
- `new BoardcastHexBoard(config?)` - Initialize with optional GridConfig
- `setGridSize(radius)` - Change number of hexes displayed (fixed hex size)
- `setGridSizeWithScaling(radius)` - Change grid size with auto-scaled hex size
- `setHexSize(radius)` - Change size of individual hexes
- `configure(config)` - Update multiple configuration options
- `getGridConfig()` - Get current configuration

### Display Methods:
- `showCoordinates()` / `hideCoordinates()` - Toggle coordinate display
- `resetBoard()` - Reset all pieces and effects

### Animation Methods:
- `highlight(q, r, colour)` - Static hex highlighting
- `blink(q, r, colour)` - Sharp blinking animation
- `pulse(q, r, colour)` - Gradual color transitions
- `token(q, r, name, shape, colour, label?)` - Place tokens with optional labels
- `move(tokenName, q, r)` - Animate token movement

## Grid Configuration

The `gridRadius` parameter controls how many hexes are displayed from the center:
- gridRadius = 3: Small grid (37 hexes total) - good for simple demos
- gridRadius = 6: Medium grid (127 hexes total) - good for medium games  
- gridRadius = 8: Default grid (217 hexes total) - good for complex games
- gridRadius = 10: Large grid (331 hexes total) - good for large battle maps

**Auto-scaling**: Demo buttons use `setGridSizeWithScaling()` which automatically calculates optimal hex size to fill available space. Smaller grids get larger hexes, larger grids get smaller hexes to maintain good visual coverage.

Use smaller grids (3-5) for focused rule demonstrations, larger grids (8-12) for complex scenarios.

## Hex Coordinate System

Uses axial coordinates where each hex has (q, r) coordinates:
- Center hex is (0, 0)
- Adjacent hexes differ by ±1 in one coordinate
- `axialToPixel()` converts hex coordinates to screen positions
- Grid spans from -gridRadius to +gridRadius in each direction

## Public API Implementation Plan

Based on the README.md specification, here's the plan to implement the public methods:

### 1. Highlight Method
```javascript
highlight(q, r, colour = '#4fc3f7')
```
**Implementation Status: ✅ COMPLETED**
- Find hex cell by coordinates (q, r)
- Update cell's fill color to specified colour
- Added `highlightColor` property to HexCell interface
- Modified render() to use highlightColor when present
- Stores original color for restoration

### 2. Blink Method
```javascript
blink(q, r, colour = '#4fc3f7')
```
**Implementation Status: ✅ COMPLETED**
- Added animation state tracking for blinking hexes
- Created continuous animation loop that toggles between highlight and normal colors
- Uses sin wave for smooth blinking transition
- Stores blink state in HexCell (isBlinking, blinkColor, blinkPhase)
- Animation loop handles blink timing automatically

### 3. Pulse Method
```javascript
pulse(q, r, colour = '#4fc3f7')
```
**Implementation Status: ✅ COMPLETED**
- Added pulse animation state tracking for gradual color transitions
- Uses RGB color interpolation for smooth gradual transitions
- Slower animation speed (0.8x) compared to blink for gentler effect
- Stores pulse state in HexCell (isPulsing, pulseColor, pulsePhase)
- Mutually exclusive with blink and highlight effects

### 4. Token Method
```javascript
token(q, r, tokenName, shape, colour, label?)
```
**Implementation Status: ✅ COMPLETED**
- Extended GamePiece interface to include shape, tokenName, and optional label
- Created shape rendering functions:
  - `createRectPath()` for rectangles
  - `createTrianglePath()` for triangles  
  - `createStarPath()` for stars
  - Circles supported via SVG circle elements
- Added token registry to track tokens by name
- Modified render() to handle different shapes and optional labels
- Labels positioned below tokens with outline for readability
- Position tokens at hex centers using axialToPixel()

### 5. Move Method
```javascript
move(tokenName, q, r)
```
**Implementation Status: ✅ COMPLETED**
- Find token by tokenName in registry
- Get target hex coordinates and convert to pixel position
- Uses smooth easing animation with requestAnimationFrame
- Updates token's currentHex property
- Returns Promise for chaining animations
- Temporarily highlights target hex during movement

## Implementation Status: ✅ ALL METHODS COMPLETED

All public API methods from the README.md specification have been successfully implemented:

### Key Features Added:

1. **Enhanced HexCell Interface:** ✅
   - Added highlightColor, isBlinking, blinkColor, blinkPhase properties
   - Added original color storage for restoration

2. **Enhanced GamePiece Interface:** ✅
   - Added tokenName, shape, and optional label properties
   - Support for different rendering based on shape type

3. **Animation System:** ✅
   - Continuous blink animation loop using sin waves
   - Smooth token movement with easing functions
   - Promise-based animation chaining for sequences

4. **Shape Rendering:** ✅
   - SVG path generators for rect, triangle, and star shapes
   - Circle support via SVG circle elements
   - Consistent sizing across all shape types

5. **Token Registry:** ✅
   - Map tokenName -> GamePiece for efficient lookup
   - Automatic replacement of tokens with same name
   - Label rendering with outline for readability

6. **Demo System:** ✅
   - Interactive demo buttons showcasing each API method
   - Example usage with labeled tokens (Player, Guard, Enemy, Treasure)

The library maintains the existing coordinate system and rendering architecture while providing all the animation features specified in the README.md.