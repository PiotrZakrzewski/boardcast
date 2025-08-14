# Boardcast - Showcase a Tabletop Rule Visually

Create animations explaining rules of a tabletop RPG game.

## Configuration

Configure the grid size when creating a new board:

```javascript
// Default configuration (8 hex radius)
const board = new BoardcastHexBoard();

// Custom configuration
const board = new BoardcastHexBoard({
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