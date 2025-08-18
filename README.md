# Boardcast

**Animation library for creating educational hex-based game tutorials and demos.**

[![npm version](https://badge.fury.io/js/boardcast.svg)](https://www.npmjs.com/package/boardcast)
[![Demo](https://img.shields.io/badge/demo-live-blue)](https://piotrzakrzewski.github.io/boardcast/)

Create smooth, professional animations for tabletop games, strategy games, and educational content on hexagonal grids.

## Installation

```bash
npm install boardcast
```

For creating and recording video tutorials, also install the CLI:

```bash
npm install -g boardcast-cli
```

## Quick Start

```javascript
import { BoardcastHexBoard } from 'boardcast';

// Create board in your HTML
const board = new BoardcastHexBoard('#my-svg', {
  gridRadius: 6,
  hexRadius: 30
});

// Add animations
board.highlight(0, 0, '#4fc3f7');
board.token(1, 1, 'player', 'circle', '#00ff00', 'Player');
await board.move('player', 2, 2);
board.caption('Player moves forward', 2000);
```

## Core API

### Visual Effects
```javascript
board.highlight(q, r, color);           // Static highlight
board.blink(q, r, color);              // Blinking highlight  
board.pulse(q, r, color);              // Pulsing highlight
board.point(q, r, label?);             // Arrow pointing at hex
board.caption(text, duration?);        // Large text overlay
```

### Game Pieces
```javascript
// Place tokens with different shapes
board.token(q, r, name, shape, color, label?);
// Shapes: 'circle', 'rect', 'triangle', 'star'

// Animate movement
await board.move(tokenName, newQ, newR);
```

### Board Management
```javascript
board.clear();                         // Clear everything
board.clear('HIGHLIGHT');              // Clear specific type
// Types: 'HIGHLIGHT', 'BLINK', 'PULSE', 'POINT', 'TOKEN', 'CAPTION'
```

### Configuration
```javascript
const board = new BoardcastHexBoard('#svg', {
  gridRadius: 8,      // Number of hex rings
  hexRadius: 25,      // Size of individual hexes
  width: 800,         // SVG width
  height: 600         // SVG height
});

// Runtime changes
board.setGridSize(5);                    // Change grid size
board.setGridSizeWithScaling(5);         // Auto-scale hex size
board.configure({ gridRadius: 8, hexRadius: 20 });
```

## Coordinate System

Uses axial coordinates where each hex has (q, r) coordinates:
- Center hex is (0, 0)  
- Adjacent hexes differ by ±1 in one coordinate
- Positive q extends right, positive r extends down-right

## Game System Extensions

Import specialized game mechanics:

```javascript
import { Lancer } from 'boardcast/contrib';

// Access game-specific tutorials and mechanics
const movement = new Lancer.LancerMovement(board);
```

## Creating Video Tutorials

For recording animations as videos, use the CLI:

```bash
npm install -g boardcast-cli

# Create tutorial template  
boardcast create my-tutorial.js

# Record to video
boardcast record my-tutorial.js
```

See [boardcast-cli](https://www.npmjs.com/package/boardcast-cli) for full CLI documentation.

## Examples

### Basic Game Demo
```javascript
import { BoardcastHexBoard } from 'boardcast';

const board = new BoardcastHexBoard('#game-board', { gridRadius: 6 });

// Set up terrain
board.highlight(2, -1, '#8d6e63'); // Difficult terrain
board.highlight(-2, 3, '#f44336'); // Dangerous terrain

// Place units
board.token(-3, 2, 'player', 'circle', '#4fc3f7', 'Hero');
board.token(4, -2, 'enemy', 'triangle', '#f44336', 'Enemy');

// Show movement
board.point(-3, 2, 'Start');
board.pulse(-2, 1, '#4fc3f7'); // Show range
await board.move('player', -1, 1);
board.caption('Hero advances tactically', 2000);
```

### Interactive Demo
```javascript
// Respond to user clicks
document.addEventListener('click', async (event) => {
  const hex = getHexFromClick(event); // Your click handler
  board.highlight(hex.q, hex.r, '#ffeb3b');
  await board.move('player', hex.q, hex.r);
});
```

## Browser Support

- Modern browsers with SVG support
- ES6 modules
- Tested in Chrome, Firefox, Safari, Edge

## Live Demo

See working examples at: https://piotrzakrzewski.github.io/boardcast/

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions welcome! See the [GitHub repository](https://github.com/PiotrZakrzewski/boardcast) for issues and development setup.

Perfect for:
- 🎲 Game designers explaining rules
- 📚 Educational content creators  
- 💻 Developers building game interfaces
- 🎬 Content creators making tutorials