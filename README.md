# Boardcast - Animated Tabletop Game Rule Visualizations

A TypeScript library for creating smooth, animated demonstrations of tabletop game rules on hexagonal boards. Built with D3.js for professional-quality animations and designed for educational content creators, game designers, and developers.

## Features

- **Hex-based Grid System**: Perfect for strategy games, RPGs, and board games
- **Smooth Animations**: Professional easing and transitions for all visual elements
- **Game-Specific Extensions**: Contrib library with specialized methods for different game systems
- **Flexible Configuration**: Adjustable grid sizes and hex dimensions
- **Rich Visual Effects**: Highlighting, pulsing, blinking, arrows, and text overlays
- **TypeScript Support**: Full type safety and IntelliSense support

## Installation

```bash
npm install boardcast
```

## Quick Start

```javascript
import { BoardcastHexBoard } from 'boardcast';

// Create a new board
const board = new BoardcastHexBoard('#my-svg-element');

// Basic usage
board.highlight(1, 0, '#ff6b6b');                    // Static highlight
board.pulse(0, 1, '#4fc3f7');                        // Animated pulse
board.token(0, 0, 'player', 'circle', '#4444ff');    // Place token
await board.move('player', 2, 1);                    // Animate movement
await board.caption('Welcome to the game!');         // Show text overlay
```

## Configuration

```javascript
// Default configuration
const board = new BoardcastHexBoard('#my-svg');

// Custom configuration
const board = new BoardcastHexBoard('#my-svg', {
  gridRadius: 6,     // Number of hexes from center (3=small, 6=medium, 8=default, 10=large)
  hexRadius: 25,     // Size of individual hexes in pixels
  width: 800,        // Canvas width
  height: 600        // Canvas height
});

// Runtime configuration changes
board.setGridSize(5);                 // Change grid size (fixed hex size)
board.setGridSizeWithScaling(5);      // Change grid size with auto-scaling
board.setHexSize(30);                 // Change hex size only
board.configure({ gridRadius: 8, hexRadius: 20 });
```

## Core API

### Visual Effects

```javascript
// Static highlighting
board.highlight(q, r, color);

// Animated effects
board.blink(q, r, color);           // Sharp on/off animation
board.pulse(q, r, color);           // Smooth color transitions

// Arrows and pointers
board.point(q, r, label?);          // Red arrow pointing at hex

// Text overlays
board.caption(text, duration?, position?);  // Large text overlay
// position: 'center' (default) or 'bottom'
```

### Game Pieces

```javascript
// Place tokens
board.token(q, r, tokenName, shape, color, label?);
// shape: 'circle', 'rect', 'triangle', 'star'

// Animate movement
await board.move(tokenName, newQ, newR);  // Returns Promise for chaining
```

### Board Management

```javascript
// Clear artifacts selectively
board.clear();                      // Clear everything
board.clear('HIGHLIGHT');           // Clear only highlights
board.clear('TOKEN');               // Clear only tokens
// Types: 'ALL', 'HIGHLIGHT', 'BLINK', 'PULSE', 'POINT', 'TOKEN', 'CAPTION'

// Reset everything
board.resetBoard();
```

## Game-Specific Extensions

Boardcast includes a contrib library with specialized methods for different game systems:

### Lancer RPG

```javascript
import { BoardcastHexBoard } from 'boardcast';
import { Lancer } from 'boardcast/contrib';

const board = new BoardcastHexBoard('#svg');
const movement = new Lancer.LancerMovement(board);
const combat = new Lancer.LancerCombat(board);

// Show movement ranges
movement.showMovementRange(0, 0, 4);  // Speed 4 mech at origin

// Combat mechanics
combat.showEngagementZone(2, 1);      // Adjacent threatened hexes
combat.showWeaponRange(0, 0, weapon, targetQ, targetR);
combat.showBlastTemplate(1, 1, 2);    // Burst 2 area effect
```

### Contributing New Game Systems

The contrib library uses a modular structure for easy expansion:

```
contrib/
├── lancer/          # Lancer RPG mechanics
├── dnd5e/           # D&D 5th Edition (future)
├── warhammer40k/    # Warhammer 40K (future)
└── [yourgame]/      # Your contribution!
```

See [contrib/README.md](contrib/README.md) for detailed contribution guidelines.

## Examples and Tutorials

The library includes complete game rule tutorials demonstrating real-world usage:

### Lancer Movement Tutorial
- Basic movement mechanics (SPEED-based)
- BOOST actions for extended movement
- Terrain effects (Normal, Difficult, Dangerous)
- Engagement zones and opportunity attacks

### Creating Educational Content

```javascript
async function explainMovement() {
  // Set up the scenario
  board.token(0, 0, 'mech', 'circle', '#4444ff', 'Mech');
  
  // Show available movement
  await board.caption('This mech has speed 4', 2000, 'bottom');
  movement.showMovementRange(0, 0, 4);
  
  // Demonstrate movement
  await board.caption('Watch it move!', 2000, 'bottom');
  await board.move('mech', 2, 1);
  
  // Clean up
  board.clear('PULSE');
}
```

## Project Structure

```
boardcast/
├── lib/                      # Core library
│   ├── BoardcastHexBoard.ts    # Main board class
│   ├── types.ts                # Core interfaces
│   └── index.ts                # Library exports
├── contrib/                  # Game-specific extensions
│   ├── lancer/                 # Lancer RPG module
│   ├── README.md               # Contribution guide
│   └── index.ts                # Contrib exports
├── demo/                     # Interactive demo
│   ├── index.html              # Demo interface
│   └── demo.ts                 # Demo implementation
└── dist/                     # Built files
    ├── lib/                    # Core library build
    └── contrib/                # Contrib library build
```

## Development

### Setup

```bash
git clone https://github.com/yourusername/boardcast.git
cd boardcast
npm install
```

### Scripts

```bash
# Development
npm run dev          # Start demo development server (localhost:3000)
npm run typecheck    # TypeScript type checking

# Building
npm run build        # Build everything (lib + contrib)
npm run build:lib    # Build core library only
npm run build:contrib # Build contrib library only
npm run build:demo   # Build demo for deployment

# Testing
npm run test         # Run test suite
npm run test:ui      # Run tests with UI
npm run preview      # Preview built demo
```

### Using in Development

```bash
# Link for local development
npm run build
npm link

# In your project
npm link boardcast
```

## Technology Stack

- **TypeScript**: Full type safety and modern JavaScript features
- **D3.js**: Professional data visualization and animation library
- **Vite**: Fast build tool and development server
- **ES Modules**: Modern module system for tree-shaking and performance
- **Vitest**: Fast testing framework with TypeScript support

## Coordinate System

Boardcast uses axial coordinates for hexagonal grids:
- Center hex is `(0, 0)`
- Adjacent hexes differ by ±1 in one coordinate
- Positive q extends to the right, positive r extends down-right

## Browser Support

- Modern browsers with ES2020+ support
- Chrome 80+, Firefox 72+, Safari 13.1+, Edge 80+

## License

ISC License - see LICENSE file for details.

## Contributing

Contributions welcome! Please see:
- [Main contribution guidelines](CONTRIBUTING.md) (coming soon)
- [Game system contributions](contrib/README.md)

---

**Perfect for:**
- Game rule tutorials and educational content
- Interactive game design prototypes  
- Board game development and testing
- RPG mechanic demonstrations
- Strategy game visualizations