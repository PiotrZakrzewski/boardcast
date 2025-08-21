# Boardcast

**Toolkit for creating animated tutorials for tabletop games.**

[![Demo](https://img.shields.io/badge/demo-live-blue)](https://piotrzakrzewski.github.io/boardcast/)

<video src="https://piotrzakrzewski.github.io/boardcast/lancer-engagement.webm" controls style="max-width: 100%; margin-top: 1em; border-radius: 8px; box-shadow: 0 2px 8px #0002;"></video>


## Packages

### 📦 [boardcast](./boardcast/) - Core Library
The main animation library for hex-based visualizations.

```bash
npm install boardcast
```

### 🎮 [boardcast-contrib](./boardcast-contrib/) - Game System Extensions  
Specialized mechanics for specific tabletop games (Lancer RPG, etc.).

```bash
npm install boardcast-contrib
```

### 🛠️ [boardcast-cli](./boardcast-cli/) - CLI Tools
Command-line tools for creating and recording video tutorials.

```bash
npm install -g boardcast-cli
```

### 📄 Boardcast Interpreter
Simple interpreter for executing Boardcast commands from `.board` files via HTTP server.

```bash
# Create a .board file with commands
echo 'token(0, 0, "player", "circle", "#4444FF", "Player")' > demo.board
echo 'highlight(1, 0, "#4fc3f7")' >> demo.board
echo 'caption("Hello Boardcast!", 3000)' >> demo.board

# Run the interpreter
node simple-interpreter.js demo.board
# Open http://localhost:3001 to see the visualization
```

## Quick Start

```javascript
import { BoardcastHexBoard } from 'boardcast';
import { Lancer } from 'boardcast-contrib/lancer';

// Create board
const board = new BoardcastHexBoard('#my-svg', {
  gridRadius: 6,
  hexRadius: 30
});

// Use core animations
board.highlight(0, 0, '#4fc3f7');
board.token(1, 1, 'player', 'circle', '#00ff00', 'Player');
await board.move('player', 2, 2);

// Use game-specific mechanics
const movement = new Lancer.LancerMovement(board);
movement.showMovementRange(0, 0, 4); // Show speed 4 movement
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

## Development

This is a monorepo managed with npm workspaces. From the root directory:

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Start demo development server
npm run dev

# Type check all packages
npm run typecheck
```

### Package Development

```bash
# Work on specific packages
npm run build --workspace=boardcast
npm run build --workspace=boardcast-contrib
npm run test --workspace=boardcast
```

## Boardcast Interpreter

The Boardcast Interpreter allows you to execute Boardcast commands from simple text files and view them in a web browser. Perfect for creating shareable demos or scripted tutorials.

### `.board` File Format

Create text files with `.board` extension containing one Boardcast method call per line:

```board
# Comments start with #
setGridSizeWithScaling(5)
showCoordinates()

# Place tokens
token(0, 0, "mech", "circle", "#4444FF", "Mech")
token(2, 1, "enemy", "triangle", "#FF4444", "Enemy")

# Add effects
highlight(1, 0, "#4fc3f7")
pulse(-1, 1, "#ff6b6b")
point(2, 1, "Target")

# Animate
caption("Battle begins!", 3000)
move("mech", 1, 0)
clear("HIGHLIGHT")
```

### Supported Methods

All public Boardcast methods are supported:
- `showCoordinates()` / `hideCoordinates()`
- `highlight(q, r, color)`, `blink(q, r, color)`, `pulse(q, r, color)`
- `point(q, r, label)`, `caption(text, duration)`
- `token(q, r, name, shape, color, label)`, `move(tokenName, q, r)`
- `clear(type)`, `resetBoard()`, `setGridSizeWithScaling(radius)`

### Parameter Types

- **Numbers**: `42`, `-1`, `3.14`
- **Strings**: `"text"`, `'text'`
- **Booleans**: `true`, `false`
- **ClearType**: `"HIGHLIGHT"`, `"PULSE"`, `"ALL"`, etc.

### Running the Interpreter

```bash
# Run with default port (3001)
node simple-interpreter.js your-script.board

# Run with custom port
node simple-interpreter.js your-script.board 8080

# Then open http://localhost:3001 (or your custom port) in browser
```

The interpreter will:
1. Parse your `.board` file
2. Start an HTTP server
3. Serve an interactive web page
4. Automatically execute all commands in sequence
5. Properly await async methods like `caption()` and `move()`

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