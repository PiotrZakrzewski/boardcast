# Boardcast - Showcase a Tabletop Rule Visually

Create animations explaining rules of a tabletop RPG game.

## Installation

```bash
npm install boardcast
```

## Usage

```javascript
import { BoardcastHexBoard } from 'boardcast';

// Create a new board
const board = new BoardcastHexBoard('#my-svg-element');

// Start using the API
board.highlight(1, 0, '#ff6b6b');
board.token(0, 0, 'player', 'circle', '#4444ff', 'Hero');
```

## Configuration

Configure the grid size when creating a new board:

```javascript
// Default configuration (8 hex radius)
const board = new BoardcastHexBoard('#my-svg');

// Custom configuration
const board = new BoardcastHexBoard('#my-svg', {
  gridRadius: 5,     // Number of hexes from center (5 = small, 8 = default, 12 = large)
  hexRadius: 20,     // Size of individual hexes in pixels
  width: 800,        // Canvas width
  height: 600        // Canvas height
});

// Change grid size at runtime
board.setGridSize(3);             // Small grid (fixed hex size)
board.setGridSizeWithScaling(3);  // Small grid with auto-scaled hex size
board.setHexSize(30);             // Change hex size only
board.configure({                 // Multiple properties
  gridRadius: 10,
  hexRadius: 15
});
```

## Supported Calls

Common parameters used in many of the calls
- `q` and `r` are coordinates on the hex grid, they take integer values, can be negative.
- `colour` is a string encoding the colour to transition the hex to, by default `#4fc3f7`
- `shape` can be one of: `rect`, `circle`, `triangle`, `star`

### Highlight a hex

```javascript
highlight(q, r, colour)
```

### Blink a hex (animated)

Make specific hex slowly pulse transitioning between a highlight colour and its normal fill colour

```javascript
blink(q, r, colour)
```

### Pulse a hex (animated)

Make specific hex slowly pulse with gradual color transitions between the normal fill colour and highlight colour

```javascript
pulse(q, r, colour)
```

### Place Token

Will place a token on the board using predefined shapes and colours

```javascript
token(q, r, tokenName, shape, colour, label?)
```

Optional `label` parameter displays text below the token for identification.

### Move Token

Will transition the token to move smoothly from its current position to another

```javascript
move(tokenName, q, r)
```

### Point at hex

Display a red arrow pointing at a specific hex coordinate with an optional label

```javascript
point(q, r, label?)
```

Optional `label` parameter displays text near the arrow for identification.

### Caption

Display large text overlay for instructions and commentary

```javascript
caption(text, duration?)
```

Shows text in large font over the board. Duration defaults to 2000ms (2 seconds).

### Clear artifacts

Selectively clear different types of visual artifacts from the board

```javascript
clear(type?)
```

Types: `ALL` (default), `HIGHLIGHT`, `BLINK`, `PULSE`, `POINT`, `TOKEN`, `CAPTION`

## Game Tutorials

The demo includes complete game rule tutorials that combine multiple methods:

### Lancer Movement
Comprehensive tutorial covering Lancer RPG mech movement mechanics:
- Basic movement (SPEED-based)
- BOOST for extra movement
- Terrain types (Normal, Difficult, Dangerous)
- Engagement rules and penalties
- DISENGAGE to avoid reactions

## Development

### Project Structure

```
boardcast/
├── lib/                    # Library source code
│   ├── BoardcastHexBoard.ts   # Main library class
│   ├── types.ts              # TypeScript interfaces
│   └── index.ts              # Library exports
├── demo/                   # Demo application
│   ├── index.html             # Demo HTML
│   └── demo.ts               # Demo JavaScript
├── dist/                   # Built files
│   ├── lib/                  # Built library
│   └── demo/                 # Built demo
└── docs/                   # Documentation
```

### Scripts

```bash
# Development
npm run dev          # Start demo development server
npm run typecheck    # Run TypeScript type checking

# Building
npm run build        # Build library for distribution
npm run build:demo   # Build demo for deployment
npm run preview      # Preview built demo
```

### Using in Development

To work on the library while testing in a project:

```bash
# In the boardcast directory
npm run build
npm link

# In your project directory
npm link boardcast
```