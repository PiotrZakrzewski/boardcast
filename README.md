# Boardcast - Create Animated Game Tutorial Videos

Transform your tabletop game rules into professional animated videos with just two commands. Boardcast makes it simple to create educational content for any hex-based strategy game or RPG.

## 🎬 Quick Start - From Idea to Video in Minutes

```bash
# Create a new tutorial
node cli/index.js create my-game-tutorial.js

# Edit the tutorial (it's just JavaScript!)
# ... customize your game rules and animations ...

# Generate a professional video
node cli/index.js record my-game-tutorial.js
# ✅ Outputs: my-game-tutorial-20250818T123456.webm
```

## ⚡ Tutorial Creation Workflow

### 1. Create Tutorial Boilerplate
```bash
node cli/index.js create lancer-movement.js
```

### 2. Edit Your Tutorial (JavaScript)
```javascript
// Tutorial Configuration
export const config = {
  gridRadius: 8,        // Board size in hex rings
  title: "Lancer Movement"
};

// Main tutorial function
export async function runTutorial(board) {
  // Set up terrain
  board.highlight(2, -1, '#8d6e63', 'Difficult');
  board.highlight(-2, 3, '#f44336', 'Dangerous');
  
  // Place units
  board.token(-3, 2, 'pilot', 'circle', '#4fc3f7', 'Pilot');
  board.token(4, -2, 'enemy', 'triangle', '#f44336', 'Enemy');
  
  // Show tutorial content
  board.caption('Movement Tutorial\nTactical positioning', 3000);
  await sleep(3500);
  
  // Demonstrate movement
  board.point(-3, 2, 'Start');
  board.pulse(-2, 1, '#4fc3f7'); // Show range
  await board.move('pilot', -1, 1);
  
  board.caption('Pilot moves to cover', 2000);
  await sleep(2500);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 3. Record Professional Video
```bash
node cli/index.js record lancer-movement.js
```

**Result:** High-quality 1920x1080 WebM video with:
- ✅ Smooth hex-based animations
- ✅ Perfect timing and transitions
- ✅ Professional visual effects
- ✅ Ready for YouTube, tutorials, or documentation

## 🎯 Why Boardcast?

**For Game Designers:**
- Quickly prototype and visualize rule interactions
- Create marketing videos for your games
- Generate tutorial content for Kickstarter campaigns

**For Content Creators:**
- Professional-quality animations without video editing skills
- Consistent, reusable format for game rule explanations
- Fast iteration on tutorial content

**For Developers:**
- Pure JavaScript - no complex video tools
- Version-controlled tutorial scripts
- Automated video generation for documentation

## 🎨 Rich Animation API

### Visual Effects
```javascript
board.highlight(q, r, color);           // Static highlighting
board.blink(q, r, color);              // Attention-grabbing blinks
board.pulse(q, r, color);              // Smooth color transitions
board.point(q, r, label?);             // Arrows with labels
board.caption(text, duration?);        // Large text overlays
```

### Game Pieces & Movement
```javascript
board.token(q, r, name, shape, color, label?);
// Shapes: 'circle', 'rect', 'triangle', 'star'

await board.move(tokenName, newQ, newR);  // Smooth animated movement
```

### Board Management
```javascript
board.clear();                         // Clear everything
board.clear('HIGHLIGHT');              // Clear specific elements
// Types: 'HIGHLIGHT', 'BLINK', 'PULSE', 'POINT', 'TOKEN', 'CAPTION'
```

## 📐 Flexible Board Configuration

```javascript
export const config = {
  gridRadius: 3,    // Small focused demos
  gridRadius: 6,    // Medium complexity
  gridRadius: 8,    // Default - good for most games
  gridRadius: 10,   // Large battle scenarios
  title: "My Tutorial"
};
```

**Auto-scaling:** Hex size automatically adjusts to fill the 1920x1080 video frame perfectly.

## 🎮 Example Games & Use Cases

**Strategy Games:**
- Hex-based wargames (movement, combat, terrain)
- Board game prototypes and rule explanations  
- Turn-based tactical RPGs

**Educational Content:**
- Game design courses and tutorials
- Rule explanation videos for complex games
- Interactive learning materials

**Marketing & Promotion:**
- Kickstarter campaign videos
- Social media game previews
- Convention demonstration materials

## 🧑‍💻 Advanced Usage - Direct Library Access

For developers who want to integrate Boardcast into existing applications:

```bash
npm install boardcast
```

```javascript
import { BoardcastHexBoard } from 'boardcast';

// Create board in your own HTML
const board = new BoardcastHexBoard('#my-svg-element', {
  gridRadius: 8,
  hexRadius: 25,
  width: 1000,
  height: 700
});

// Full programmatic control
board.highlight(1, 0, '#ff6b6b');
board.token(0, 0, 'player', 'circle', '#4444ff');
await board.move('player', 2, 1);
```

### Runtime Configuration
```javascript
board.setGridSize(5);                    // Change grid size
board.setGridSizeWithScaling(5);         // Auto-scale hex size
board.configure({ gridRadius: 8, hexRadius: 20 });
```

## 🎯 Coordinate System

Boardcast uses axial coordinates for hexagonal grids:
- Center hex is `(0, 0)`
- Adjacent hexes differ by ±1 in one coordinate  
- Positive q extends to the right, positive r extends down-right

```javascript
// Common coordinate patterns
board.token(0, 0, 'center', 'circle', '#fff');     // Center
board.token(1, 0, 'right', 'circle', '#fff');      // Right neighbor
board.token(0, 1, 'down-right', 'circle', '#fff'); // Down-right neighbor
```

## 🚀 Game-Specific Extensions (Coming Soon)

Advanced game system modules for specialized mechanics:

**Lancer RPG:** Movement ranges, engagement zones, blast templates  
**D&D 5E:** Spell areas, movement rules, tactical combat  
**Warhammer 40K:** Unit formations, weapon ranges, terrain effects

```javascript
// Future contrib library usage
import { Lancer } from 'boardcast/contrib';
const movement = new Lancer.LancerMovement(board);
movement.showMovementRange(0, 0, 4); // Speed 4 mech
```

## 🛠️ Development & Contributing

### Project Structure
```
boardcast/
├── cli/                     # CLI commands (create, record)
├── runtime/                 # HTML template for video generation
├── lib/                     # Core animation library
├── contrib/                 # Game-specific extensions
└── dist/                    # Built files
```

### Setup for Development
```bash
git clone https://github.com/yourusername/boardcast.git
cd boardcast
npm install
npm run build              # Build the library first
```

### CLI Development
```bash
# Test CLI commands locally
node cli/index.js create test-tutorial.js
node cli/index.js record test-tutorial.js

# Development server (for library development)
npm run dev               # localhost:3000
```

### Library Development
```bash
npm run typecheck         # TypeScript validation
npm run test              # Run test suite
npm run build             # Build everything
npm run build:lib         # Build core library only
```

## 📋 Requirements

**Runtime:**
- Node.js 18+ (for CLI and recording)
- Modern browser (Chrome/Firefox/Edge for recording)

**Development:**
- TypeScript knowledge for library contributions
- Basic JavaScript for tutorial creation

## 🎯 Technology Stack

- **CLI**: Node.js ES modules with Playwright automation
- **Core Library**: TypeScript + D3.js for animations  
- **Video Generation**: Chromium browser automation
- **Build System**: Vite for fast development and bundling

## 📄 License

ISC License - see LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Areas where help is needed:

**Tutorial Templates:** More game system examples  
**CLI Features:** Better error handling, progress indicators  
**Library Features:** New animation types, game mechanics  
**Documentation:** More examples and use cases

---

**🎮 Transform your game rules into stunning animated videos with Boardcast!**

Perfect for game designers, content creators, educators, and anyone who wants to explain complex game mechanics through engaging visual demonstrations.