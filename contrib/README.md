# Boardcast Contrib Library

Game-specific extensions and utilities for the Boardcast hex board animation library.

## Overview

The contrib library provides specialized methods for visualizing and animating game mechanics specific to different tabletop game systems. Each game system is organized into its own module with methods that extend the core Boardcast functionality.

## Available Game Systems

### Lancer
RPG mech combat system with movement, engagement, and terrain mechanics.

- **Movement**: Speed-based movement ranges, boost actions, terrain effects
- **Combat**: Engagement zones, weapon ranges, line of sight, blast templates

## Usage

```javascript
import { BoardcastHexBoard } from 'boardcast';
import { Lancer } from 'boardcast/contrib';

const board = new BoardcastHexBoard();
const movement = new Lancer.LancerMovement(board);
const combat = new Lancer.LancerCombat(board);

// Show movement range for a speed 4 mech at (0,0)
movement.showMovementRange(0, 0, 4);

// Show engagement zone around mech
combat.showEngagementZone(0, 0);
```

## Contributing a New Game System

To contribute a new game system (e.g., "MyGame"):

### 1. Create Module Structure
```
contrib/
└── mygame/
    ├── index.ts       # Main exports
    ├── types.ts       # Game-specific types
    ├── movement.ts    # Movement mechanics (if applicable)
    ├── combat.ts      # Combat mechanics (if applicable)
    └── [feature].ts   # Other game features
```

### 2. Define Game-Specific Types
```typescript
// contrib/mygame/types.ts
export interface MyGameUnit {
  id: string;
  name: string;
  // Game-specific properties
}
```

### 3. Create Feature Classes
```typescript
// contrib/mygame/movement.ts
import { BoardcastHexBoard } from '../../lib/BoardcastHexBoard.js';

export class MyGameMovement {
  constructor(private board: BoardcastHexBoard) {}

  showMovementPattern(q: number, r: number): void {
    // Use board.highlight(), board.pulse(), etc.
  }
}
```

### 4. Export from Module Index
```typescript
// contrib/mygame/index.ts
export { MyGameMovement } from './movement.js';
export type { MyGameUnit } from './types.js';
```

### 5. Add to Main Contrib Index
```typescript
// contrib/index.ts
export * as MyGame from './mygame/index.js';
```

## Guidelines

### Method Design
- **Descriptive Names**: Use clear, game-specific method names
- **Flexible Parameters**: Support customization (colors, ranges, etc.)
- **Return Values**: Return useful data when appropriate
- **Documentation**: Include JSDoc comments with examples

### Visual Consistency
- Use `Colors` constants from core library when possible
- Follow existing animation patterns (pulse for ranges, blink for threats)
- Provide sensible color defaults but allow customization

### Example Method Template
```typescript
/**
 * Show special game mechanic visualization
 * @param centerQ - Center hex q coordinate
 * @param centerR - Center hex r coordinate
 * @param options - Customization options
 */
showSpecialMechanic(
  centerQ: number, 
  centerR: number, 
  options: { color?: string; size?: number } = {}
): GameMechanicResult {
  const { color = Colors.BLUE, size = 1 } = options;
  
  // Implementation using board methods
  this.board.highlight(centerQ, centerR, color);
  
  return { /* useful data */ };
}
```

### File Organization
- **One class per file** for complex features
- **Related utilities** can share files
- **Export everything** from module index
- **Import paths** should use `.js` extension for ES modules

## Building and Testing

```bash
# Build contrib library
npm run build:contrib

# Build everything (lib + contrib + demo)
npm run build

# Type checking
npm run typecheck

# Run tests
npm run test
```

## Module Import Structure

Core library methods are available on the board instance:
```javascript
board.highlight(q, r, color);     // Core method
board.pulse(q, r, color);         // Core method
board.token(q, r, name, ...);     // Core method
```

Contrib methods are organized by game system:
```javascript
const movement = new Lancer.LancerMovement(board);
movement.showMovementRange(q, r, speed);  // Contrib method
```

This separation keeps the core library lightweight while allowing rich game-specific functionality in contrib modules.