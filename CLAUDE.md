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