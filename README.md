# Boardcast

**Complete toolkit for creating animated tutorials for tabletop games.**

[![Demo](https://img.shields.io/badge/demo-live-blue)](https://piotrzakrzewski.github.io/boardcast/)

<video src="https://piotrzakrzewski.github.io/boardcast/lancer-engagement.webm" controls style="max-width: 100%; margin-top: 1em; border-radius: 8px; box-shadow: 0 2px 8px #0002;"></video>

## 🚀 Quick Start with Boardcast DSL

Create animated tutorials using simple `.board` files:

```bash
# 1. Install Boardcast
npm install -g boardcast

# 2. Create a tutorial file
echo 'setGridSizeWithScaling(5)
showCoordinates()
token(0, 0, "mech", "circle", "#4444FF", "Mech")
highlight(1, 0, "#4fc3f7")
caption("Hello Boardcast!", 3000)
move("mech", 1, 0)' > my-tutorial.board

# 3. Live development server (optional - for real-time preview)
boardcast serve my-tutorial.board
# Opens http://localhost:3001 with live reload on file changes

# 4. Validate and compile
boardcast build my-tutorial.board

# 5. Record video (requires playwright)
npm install playwright
boardcast record my-tutorial.board
```

That's it! Your tutorial is now a video in the `videos/` folder.

## 📁 Architecture Overview

Boardcast provides multiple ways to create animated tutorials:

### 🔥 **NEW: Boardcast DSL Toolchain** (Recommended)
**Simple text files → Animated videos**

```
.board files → Chevrotain Parser → JavaScript → Boardcast CLI → Videos
```

### 🎮 **JavaScript API** (Advanced)
**Direct JavaScript programming**

### 🌐 **Simple Interpreter** (Live Preview)
**Real-time preview in browser**

## 🛠️ Complete Usage Guide

Follow these steps to use Boardcast for creating animated tutorials:

### Installation

```bash
# Install Boardcast globally
npm install -g boardcast

# Or install in your project
npm install boardcast

# Optional: Install Playwright for video recording
npm install -g playwright
```

### Step 1: Create Your First Tutorial

```bash
# Create a simple tutorial file
echo 'setGridSizeWithScaling(4)
showCoordinates()
token(0, 0, "player", "circle", "#4444FF", "Player")
highlight(1, 0, "#4fc3f7")
highlight(-1, 0, "#4fc3f7")
caption("Welcome to Boardcast!", 2000)
move("player", 1, 0)
caption("Tutorial complete!", 1000)' > my-first-tutorial.board

# Validate the tutorial
boardcast validate my-first-tutorial.board
# Should output: ✅ Board file is valid!

# Test error handling
echo 'invalid_method(1, 2, 3)' > test-invalid.board
boardcast validate test-invalid.board
# Should output: ❌ Unknown method: "invalid_method". Did you mean: move, token, point?

# Clean up
rm test-invalid.board
```

### Step 2: Compile to JavaScript

```bash
# Compile your tutorial to JavaScript
boardcast compile my-first-tutorial.board

# Check the generated JavaScript
cat my-first-tutorial.js
# Should see properly formatted JavaScript with:
# - export const config = { gridRadius: 4, title: "my-first-tutorial" };
# - export async function runTutorial(board) { ... }
# - Proper board method calls with timing
```

### Step 3: Build Complete Tutorial

```bash
# Build (validate + compile) in one command
rm my-first-tutorial.js  # Remove previous file
boardcast build my-first-tutorial.board

# Verify build output
ls -la my-first-tutorial.js
# Should show the generated JavaScript file
```

### Step 4: Live Development Server

```bash
# Start the development server with live reload
boardcast serve my-first-tutorial.board

# This will:
# - Start a local server at http://localhost:3001
# - Watch for changes to the .board file
# - Automatically validate and compile on changes
# - Reload the browser in real-time
# - Display errors in the browser if validation fails

# In another terminal, try modifying the board file:
echo '# Modified tutorial
setGridSizeWithScaling(5)
showCoordinates()
token(0, 0, "hero", "star", "#ff0000", "Hero")
caption("Live reload test!", 2000)' > my-first-tutorial.board

# The browser should automatically reload with your changes!
```

### Step 5: Create Advanced Tutorial

```bash
# Create a more complex tutorial
cat > advanced-tutorial.board << 'EOF'
# Advanced Tutorial - Combat Demo
setGridSizeWithScaling(6)
showCoordinates()

# Place terrain
highlight(-2, 2, "#8d6e63")  # Difficult terrain
highlight(2, -1, "#f44336")  # Dangerous terrain

# Place units
token(-3, 1, "player", "circle", "#4fc3f7", "Hero")
token(-2, 0, "ally", "rect", "#4caf50", "Tank")
token(2, 1, "enemy1", "triangle", "#f44336", "Orc")
token(3, 0, "enemy2", "star", "#ff9800", "Boss")

# Combat sequence
caption("Battle Setup Complete", 2000)
pulse(0, 0, "#ffeb3b")
point(-3, 1, "Start")
move("player", -1, 0)
move("ally", 0, 1)
caption("Heroes Advance!", 2000)
clear("POINT")
caption("Victory!", 2000)
EOF

# Build the advanced tutorial
boardcast build advanced-tutorial.board

# Check the output
cat advanced-tutorial.js
```

### Step 6: Record Video (Optional)

**Note**: This requires Playwright and may take a few minutes

```bash
# Make sure Playwright is installed
npm install -g playwright

# Record your tutorial to video
boardcast record my-first-tutorial.board

# Check for video output
ls videos/
# Should show: my-first-tutorial-YYYYMMDDTHHMMSS.webm

# Record the advanced tutorial
boardcast record advanced-tutorial.board
```

### Step 7: Test Error Handling

```bash
# Test various error conditions
echo 'highlight(25, 0, "#ff0000")' > test-errors.board  # Coordinate out of range
boardcast validate test-errors.board

echo 'token(0, 0, "test")' > test-errors.board  # Missing arguments
boardcast validate test-errors.board

echo 'highlight(0, 0, "notacolor")' > test-errors.board  # Invalid color
boardcast validate test-errors.board

echo 'token(0, 0, "test", "invalidshape", "#ff0000")' > test-errors.board  # Invalid shape
boardcast validate test-errors.board

# Clean up
rm test-errors.board
```

### Step 8: Test CLI Help System

```bash
# Test help commands
boardcast help
boardcast help validate
boardcast help compile
boardcast help build
boardcast help serve
boardcast help record
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
boardcast build complex-tutorial.board

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
rm -f my-first-tutorial.board my-first-tutorial.js
rm -f advanced-tutorial.board advanced-tutorial.js
rm -f complex-tutorial.board complex-tutorial.js
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
# Install globally and use anywhere
npm install -g boardcast
boardcast --help
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
boardcast validate tutorial.board

# Compile to JavaScript
boardcast compile tutorial.board [output.js]

# Validate and compile
boardcast build tutorial.board

# Live development server with auto-reload
boardcast serve tutorial.board [port]

# Full pipeline: validate, compile, and record
boardcast record tutorial.board

# Help
boardcast help [command]
```

## 🚀 Development Workflow

### For Content Creators
1. Write `.board` file with simple commands
2. **Develop**: `boardcast serve tutorial.board` (live preview with auto-reload)
3. Validate: `boardcast validate tutorial.board`
4. Build: `boardcast build tutorial.board`
5. Record: `boardcast record tutorial.board`

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

## 🔗 Local Development Testing

When developing boardcast locally, use `npm link` to test your changes without publishing:

### Link for Global Testing

```bash
# Build and link the package globally
npm run build
npm link

# Now you can use your local development version globally
boardcast validate test.board
boardcast serve test.board
```

### Test in Another Project

```bash
# In your test project directory
npm link boardcast

# Use the locally linked version
import { BoardcastHexBoard } from 'boardcast';
```

### Unlink When Done

```bash
# Remove global link
npm unlink -g boardcast

# Remove from test project
cd /path/to/test/project
npm unlink boardcast
```

### Alternative: Direct Path Testing

```bash
# Test CLI commands directly from source
node ./toolchain/bin/boardcast validate test.board
node ./cli/bin/boardcast-record test.js

# Test with npm scripts
npm run build && node ./toolchain/bin/boardcast serve test.board
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