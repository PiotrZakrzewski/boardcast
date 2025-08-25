# Boardcast CLI

CLI tools for creating and recording animated hex board tutorials with Boardcast.

## Installation

```bash
npm install -g boardcast-cli
```

Or use locally in a project:

```bash
npm install boardcast-cli
npx boardcast --help
```

## Requirements

- Node.js 18+
- The `boardcast` library must be available as a peer dependency or built locally

## Commands

### Main CLI

```bash
boardcast create <filename.js>    # Create new tutorial boilerplate
boardcast record <filename.js>    # Record tutorial to WebM video
boardcast help                    # Show help
```

### Standalone Commands

```bash
boardcast-create <filename.js>    # Direct create command
boardcast-record <filename.js>    # Direct record command
```

## Quick Start

1. Create a new tutorial:
```bash
boardcast create my-tutorial.js
```

2. Edit the generated file to customize your tutorial

3. Record it to video:
```bash
boardcast record my-tutorial.js
```

The video will be saved to the `videos/` directory with a timestamp.

## Tutorial Structure

Generated tutorials have this structure:

```javascript
// Configuration
export const config = {
  gridRadius: 8,        // Grid size (3-12)
  title: "My Tutorial"  // Used for video filename
};

// Main tutorial function
export async function runTutorial(board) {
  // Your tutorial code here
  board.highlight(0, 0, '#4fc3f7');
  board.token(1, 1, 'player', 'circle', '#00ff00');
  await sleep(1000);
  board.move('player', 2, 2);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## API Reference

The `board` parameter provides the full Boardcast API:

### Highlighting
- `board.highlight(q, r, color)` - Static highlight
- `board.blink(q, r, color)` - Blinking highlight
- `board.pulse(q, r, color)` - Pulsing highlight

### Tokens
- `board.token(q, r, name, shape, color, label?)` - Place token
- `board.move(tokenName, q, r)` - Animate movement

### Annotations
- `board.point(q, r, label?)` - Arrow pointing at hex
- `board.caption(text, duration?)` - Large text overlay

### Clear
- `board.clear()` - Clear all elements
- `board.clear('HIGHLIGHT'|'BLINK'|'PULSE'|'POINT'|'TOKEN'|'CAPTION')` - Clear specific type

## Examples

See the generated tutorial template for a complete example with terrain, units, and movement.

## Troubleshooting

### "Boardcast library not found"
Make sure you have the `boardcast` package installed:
```bash
npm install boardcast
```

### Recording fails
- Ensure Playwright browsers are installed: `npx playwright install`
- Check that port 3001 is available
- Verify your tutorial file exports `runTutorial` and `config`

## Development

To work on this package:

```bash
# Install dependencies
npm install

# Test commands
npm test
```

## License

ISC