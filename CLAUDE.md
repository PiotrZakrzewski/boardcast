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
src/
├── main.ts          # Entry point with ParticleAnimation class
index.html           # HTML template with SVG canvas
package.json         # Dependencies and scripts
tsconfig.json        # TypeScript configuration
vite.config.ts       # Vite build configuration
```

## Key Architecture Patterns

- **Hex Coordinate System**: Uses axial coordinates (q, r) for hexagonal grid positioning
- **Game Piece Management**: Entities that can be animated between hex positions
- **Coordinate Display**: Toggle-able coordinate labels for development and education
- **Smooth Animations**: Easing functions for natural piece movement between hexes

## Library Components

The `BoardcastHexBoard` class in `src/main.ts` provides the core functionality:
- `showCoordinates()` / `hideCoordinates()` - Toggle coordinate display
- `movePiece(id, hexes[])` - Animate piece movement through sequence of hex positions
- `resetBoard()` - Reset all pieces to starting positions
- Automatic highlighting of target hexes during movement animations

## Hex Coordinate System

Uses axial coordinates where each hex has (q, r) coordinates:
- Center hex is (0, 0)
- Adjacent hexes differ by ±1 in one coordinate
- `axialToPixel()` converts hex coordinates to screen positions

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