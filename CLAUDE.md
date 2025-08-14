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
**Implementation Plan:**
- Find hex cell by coordinates (q, r)
- Update cell's fill color to specified colour
- Add/update a `highlightColor` property to HexCell interface
- Modify render() to use highlightColor when present
- Store original color for potential restoration

### 2. Blink Method
```javascript
blink(q, r, colour = '#4fc3f7')
```
**Implementation Plan:**
- Add animation state tracking for blinking hexes
- Create interval-based animation that toggles between highlight and normal colors
- Use smooth transitions (CSS transitions or D3 transitions)
- Store blink state in HexCell (isBlinking, blinkColor, blinkPhase)
- Update animation loop to handle blink timing

### 3. Token Method
```javascript
token(q, r, tokenName, shape, colour)
```
**Implementation Plan:**
- Extend GamePiece interface to include shape and tokenName
- Create shape rendering functions:
  - `createRectPath()` for rectangles
  - `createTrianglePath()` for triangles  
  - `createStarPath()` for stars
  - Circles already supported via SVG circle elements
- Add token registry to track tokens by name
- Modify render() to handle different shapes
- Position tokens at hex centers using axialToPixel()

### 4. Move Method
```javascript
move(tokenName, q, r)
```
**Implementation Plan:**
- Find token by tokenName in registry
- Get target hex coordinates and convert to pixel position
- Use existing smooth animation from movePiece() method
- Update token's currentHex property
- Support queuing multiple moves for same token
- Return Promise for chaining animations

### Implementation Architecture Changes Needed:

1. **Enhanced HexCell Interface:**
   - Add highlightColor, isBlinking, blinkColor properties
   - Add original color storage

2. **Enhanced GamePiece Interface:**
   - Add tokenName and shape properties
   - Support different rendering based on shape

3. **Animation System:**
   - Add blink animation loop
   - Token move queue system
   - Promise-based animation chaining

4. **Shape Rendering:**
   - SVG path generators for different shapes
   - Consistent sizing across shape types

5. **Token Registry:**
   - Map tokenName -> GamePiece for lookup
   - Collision detection (multiple tokens per hex)

This plan maintains the existing coordinate system and rendering architecture while adding the animation features specified in the README.