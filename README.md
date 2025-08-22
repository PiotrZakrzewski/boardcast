# Boardcast

**Complete toolkit for creating animated tutorials for tabletop games.**

[![Demo](https://img.shields.io/badge/demo-live-blue)](https://piotrzakrzewski.github.io/boardcast/)

<video src="https://piotrzakrzewski.github.io/boardcast/lancer-engagement.webm" controls style="max-width: 100%; margin-top: 1em; border-radius: 8px; box-shadow: 0 2px 8px #0002;"></video>

## 🚀 Quick Start with Boardcast DSL

Create animated tutorials using simple `.board` files:

```bash
# 1. Create a tutorial file
echo 'setGridSizeWithScaling(5)
showCoordinates()
token(0, 0, "mech", "circle", "#4444FF", "Mech")
highlight(1, 0, "#4fc3f7")
caption("Hello Boardcast!", 3000)
move("mech", 1, 0)' > my-tutorial.board

# 2. Live development server (optional - for real-time preview)
node boardcast-toolchain.js serve my-tutorial.board
# Opens http://localhost:3001 with live reload on file changes

# 3. Validate and compile
node boardcast-toolchain.js build my-tutorial.board

# 4. Record video (requires playwright)
npm install playwright
node boardcast-toolchain.js record my-tutorial.board
```

That's it! Your tutorial is now a video in the `videos/` folder.

## 📁 Architecture Overview

Boardcast provides multiple ways to create animated tutorials:

### 🔥 **NEW: Boardcast DSL Toolchain** (Recommended)
**Simple text files → Animated videos**

```
.board files → Chevrotain Parser → JavaScript → boardcast-cli → Videos
```

### 🎮 **JavaScript API** (Advanced)
**Direct JavaScript programming**

### 🌐 **Simple Interpreter** (Live Preview)
**Real-time preview in browser**

## 🛠️ Complete Testing Guide

Follow these steps to test the new Boardcast toolchain:

### Prerequisites

```bash
# Clone and setup
git clone <repository>
cd boardcast
npm install

# Install Chevrotain (if not already installed)
npm install chevrotain

# Install Playwright for video recording
npm install playwright
```

### Step 1: Test DSL Validation

```bash
# Test with the included example
node boardcast-toolchain.js validate example.board
# Should output: ✅ Board file is valid!

# Test error handling
echo 'invalid_method(1, 2, 3)' > test-invalid.board
node boardcast-toolchain.js validate test-invalid.board
# Should output: ❌ Unknown method: "invalid_method". Did you mean: move, token, point?

# Clean up
rm test-invalid.board
```

### Step 2: Test Compilation

```bash
# Compile the example board file
node boardcast-toolchain.js compile example.board

# Check the generated JavaScript
cat example.js
# Should see properly formatted JavaScript with:
# - export const config = { gridRadius: 5, title: "example" };
# - export async function runTutorial(board) { ... }
# - Proper board method calls with timing
```

### Step 3: Test Complete Build Pipeline

```bash
# Build (validate + compile) in one command
rm example.js  # Remove previous file
node boardcast-toolchain.js build example.board

# Verify build output
ls -la example.js
# Should show the generated JavaScript file
```

### Step 4: Test Development Server (Live Preview)

```bash
# Start the development server with live reload
node boardcast-toolchain.js serve example.board

# This will:
# - Start a local server at http://localhost:3001
# - Watch for changes to the .board file
# - Automatically validate and compile on changes
# - Reload the browser in real-time
# - Display errors in the browser if validation fails

# In another terminal, try modifying the board file:
echo '# Modified example
setGridSizeWithScaling(4)
showCoordinates()
token(0, 0, "mech", "circle", "#ff0000", "Updated Mech")
caption("Live reload test!", 2000)' > example.board

# The browser should automatically reload with your changes!
```

### Step 5: Test with Custom Board File

```bash
# Create a simple test tutorial
cat > test-tutorial.board << 'EOF'
# Test Tutorial
setGridSizeWithScaling(4)
showCoordinates()

# Place some pieces
token(-1, 0, "player", "circle", "#00ff00", "Player")
token(1, 1, "enemy", "triangle", "#ff0000", "Enemy")

# Add effects
highlight(0, 0, "#4fc3f7")
pulse(1, 0, "#ffff00")
point(-1, 0, "Start Here")

# Animate
caption("Tutorial Starting!", 2000)
move("player", 0, 0)
clear("HIGHLIGHT")
caption("Tutorial Complete!", 1500)
EOF

# Build the tutorial
node boardcast-toolchain.js build test-tutorial.board

# Check the output
cat test-tutorial.js
```

### Step 6: Test Video Recording (Optional)

**Note**: This requires Playwright and may take a few minutes

```bash
# Record the example tutorial
node boardcast-toolchain.js record example.board

# Check for video output
ls videos/
# Should show: example-YYYYMMDDTHHMMSS.webm

# Or test with boardcast-cli directly
cd boardcast/cli
node bin/boardcast record ../../example.js
```

### Step 7: Test Error Handling

```bash
# Test various error conditions
echo 'highlight(25, 0, "#ff0000")' > test-errors.board  # Coordinate out of range
node boardcast-toolchain.js validate test-errors.board

echo 'token(0, 0, "test")' > test-errors.board  # Missing arguments
node boardcast-toolchain.js validate test-errors.board

echo 'highlight(0, 0, "notacolor")' > test-errors.board  # Invalid color
node boardcast-toolchain.js validate test-errors.board

echo 'token(0, 0, "test", "invalidshape", "#ff0000")' > test-errors.board  # Invalid shape
node boardcast-toolchain.js validate test-errors.board

# Clean up
rm test-errors.board
```

### Step 8: Test CLI Help System

```bash
# Test help commands
node boardcast-toolchain.js help
node boardcast-toolchain.js help validate
node boardcast-toolchain.js help compile
node boardcast-toolchain.js help build
node boardcast-toolchain.js help serve
node boardcast-toolchain.js help record
```

### Step 9: Test with Larger File

```bash
# Create a comprehensive test
cat > complex-tutorial.board << 'EOF'
# Complex Tutorial Test
setGridSizeWithScaling(6)
showCoordinates()

# Setup terrain
highlight(-2, 2, "#8d6e63")
highlight(-1, 2, "#8d6e63")
highlight(2, -1, "#f44336")
highlight(3, -1, "#f44336")

# Place multiple units
token(-3, 1, "player1", "circle", "#4fc3f7", "Hero")
token(-2, 0, "player2", "rect", "#4caf50", "Tank")
token(2, 1, "enemy1", "triangle", "#f44336", "Orc")
token(3, 0, "enemy2", "star", "#ff9800", "Boss")

# Add visual effects
point(-3, 1, "Start")
pulse(0, 0, "#ffeb3b")
blink(1, 1, "#e91e63")

# Captions and movement
caption("Battle Setup Complete", 2000)
move("player1", -1, 0)
move("player2", 0, 1)
caption("Players Advance", 2000)

# Clear and finale
clear("POINT")
clear("PULSE")
caption("Tutorial Complete!", 2000)
EOF

# Build and validate
node boardcast-toolchain.js build complex-tutorial.board

# Check line count and complexity
wc -l complex-tutorial.js
grep "board\." complex-tutorial.js | wc -l
```

### Step 10: Verify Package Integration

```bash
# Test that generated files work with existing CLI
cd boardcast && npm run build  # Ensure library is built

# Test the generated file directly with CLI
cd cli
node bin/boardcast record ../../complex-tutorial.js
# This may take a few minutes and opens a browser window
```

### Step 11: Clean Up Test Files

```bash
# Remove test files
rm -f test-tutorial.board test-tutorial.js
rm -f complex-tutorial.board complex-tutorial.js
rm -f example.js  # Keep example.board for future testing
```

## Expected Test Results

If everything works correctly, you should see:

✅ **Validation**: Syntax and semantic errors caught with helpful messages  
✅ **Compilation**: Clean JavaScript files generated with proper structure  
✅ **Build Pipeline**: Seamless validate → compile workflow  
✅ **Error Handling**: Clear error messages with suggestions  
✅ **CLI Integration**: Generated files work with existing boardcast-cli  
✅ **Video Recording**: Optional video generation (requires Playwright)  

## 📦 Packages

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

### 🆕 **Boardcast DSL Toolchain** - Complete Workflow
Simple text files to animated videos with validation and compilation.

```bash
# All tools included in this repository
node boardcast-toolchain.js --help
```

## 🎯 Boardcast DSL Reference

### File Format
Create `.board` files with one command per line:

```board
# Comments start with #
setGridSizeWithScaling(5)
showCoordinates()

# Place tokens
token(0, 0, "player", "circle", "#4444FF", "Player")
token(1, 1, "enemy", "triangle", "#FF4444", "Enemy")

# Visual effects
highlight(q, r, color)    # Static highlight
blink(q, r, color)       # Blinking effect
pulse(q, r, color)       # Pulsing effect
point(q, r, label)       # Arrow pointer
caption(text, duration)  # Text overlay

# Animation
move(tokenName, newQ, newR)  # Animate movement

# Cleanup
clear(type)              # Clear effects: "ALL", "HIGHLIGHT", "PULSE", etc.
resetBoard()             # Clear everything
```

### Coordinate System
- **Axial coordinates**: (q, r) where center is (0, 0)
- **Range**: -20 to +20 for both q and r
- **Adjacent hexes**: Differ by ±1 in one coordinate

### Data Types
- **Numbers**: `42`, `-1`, `3.14`
- **Strings**: `"text"` or `'text'`
- **Colors**: `"#FF0000"`, `"#4fc3f7"`, or `Colors.RED`
- **Shapes**: `"circle"`, `"rect"`, `"triangle"`, `"star"`
- **Clear Types**: `"ALL"`, `"HIGHLIGHT"`, `"BLINK"`, `"PULSE"`, `"POINT"`, `"TOKEN"`, `"CAPTION"`

### Toolchain Commands

```bash
# Validate syntax and semantics
node boardcast-toolchain.js validate tutorial.board

# Compile to JavaScript
node boardcast-toolchain.js compile tutorial.board [output.js]

# Validate and compile
node boardcast-toolchain.js build tutorial.board

# Live development server with auto-reload
node boardcast-toolchain.js serve tutorial.board [port]

# Full pipeline: validate, compile, and record
node boardcast-toolchain.js record tutorial.board

# Help
node boardcast-toolchain.js help [command]
```

## 🚀 Development Workflow

### For Content Creators
1. Write `.board` file with simple commands
2. **Develop**: `node boardcast-toolchain.js serve tutorial.board` (live preview with auto-reload)
3. Validate: `node boardcast-toolchain.js validate tutorial.board`
4. Build: `node boardcast-toolchain.js build tutorial.board`
5. Record: `node boardcast-toolchain.js record tutorial.board`

### For Developers
1. Use JavaScript API directly
2. Import boardcast libraries
3. Build custom animations programmatically

## 🔧 JavaScript API (Advanced)

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

### Core API

#### Visual Effects
```javascript
board.highlight(q, r, color);           // Static highlight
board.blink(q, r, color);              // Blinking highlight  
board.pulse(q, r, color);              // Pulsing highlight
board.point(q, r, label?);             // Arrow pointing at hex
board.caption(text, duration?);        // Large text overlay
```

#### Game Pieces
```javascript
// Place tokens with different shapes
board.token(q, r, name, shape, color, label?);
// Shapes: 'circle', 'rect', 'triangle', 'star'

// Animate movement
await board.move(tokenName, newQ, newR);
```

#### Board Management
```javascript
board.clear();                         // Clear everything
board.clear('HIGHLIGHT');              // Clear specific type
// Types: 'HIGHLIGHT', 'BLINK', 'PULSE', 'POINT', 'TOKEN', 'CAPTION'
```

## 🏗️ Development Setup

This is a monorepo managed with npm workspaces:

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

## 📚 Examples

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

## 🌍 Browser Support

- Modern browsers with SVG support
- ES6 modules
- Tested in Chrome, Firefox, Safari, Edge

## 🎬 Live Demo

See working examples at: https://piotrzakrzewski.github.io/boardcast/

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! See the [GitHub repository](https://github.com/PiotrZakrzewski/boardcast) for issues and development setup.

Perfect for:
- 🎲 Game designers explaining rules
- 📚 Educational content creators  
- 💻 Developers building game interfaces
- 🎬 Content creators making tutorials

---

## 🔍 Troubleshooting

### Common Issues

**Module warnings**: Add `"type": "module"` to package.json to eliminate ES module warnings.

**Missing Playwright**: Install with `npm install playwright` for video recording.

**Build errors**: Ensure `npm run build` completes successfully in the boardcast package.

**Permission errors**: Make toolchain executable with `chmod +x boardcast-toolchain.js`.

### Getting Help

1. Check the generated JavaScript file structure
2. Validate `.board` file syntax with the validator
3. Test individual commands in the simple interpreter
4. Review error messages for specific guidance