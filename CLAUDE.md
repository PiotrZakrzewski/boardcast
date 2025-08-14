# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Boardcast is a TypeScript project that uses D3.js to create complex web animations. The project is built with Vite for fast development and optimized builds.

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

- **Class-based Animation**: Main animations are implemented as TypeScript classes
- **D3 Data Binding**: Uses D3's enter/update/exit pattern for efficient DOM manipulation
- **RequestAnimationFrame**: Smooth 60fps animations using browser animation frames
- **Event-driven Interactions**: Mouse interactions and button controls trigger animation state changes

## Animation Framework

The `ParticleAnimation` class in `src/main.ts` demonstrates the core animation pattern:
- Particle physics simulation with gravity and collision detection
- D3 selection and data binding for efficient rendering
- Interactive mouse effects that influence particle movement
- Start/stop/reset controls for animation lifecycle management