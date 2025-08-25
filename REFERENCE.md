# Boardcast DSL Reference

This document provides a complete reference for the Boardcast Domain-Specific Language (DSL) used with the `simple-interpreter.js` tool. The DSL allows content creators to write hex-board tutorials and animations using simple commands in `.board` files.

## Overview

The Boardcast DSL is a line-based scripting language where each line contains a single command. The interpreter executes commands sequentially and renders the results in real-time on a hex grid visualization.

## File Format

- File extension: `.board`
- Encoding: UTF-8
- Comments: Lines starting with `#` are ignored
- Empty lines are ignored

## Command Syntax

Commands follow the pattern:
```
methodName(argument1, argument2, ...)
```

### Argument Types

- **Numbers**: `42`, `-3`, `1.5`
- **Strings**: `"hello"` or `'hello'`
- **Booleans**: `true`, `false`
- **Colors**: Hex colors like `"#FF0000"` or `"#4fc3f7"`
- **Enums**: `ClearType.ALL`, `ClearType.HIGHLIGHT`, etc.

### Coordinate System

Boardcast uses axial coordinates (q, r) for the hexagonal grid:
- `q`: horizontal axis (positive = right)
- `r`: diagonal axis (positive = down-right)
- Center of the grid is at (0, 0)
- Valid range: -20 to +20 for both axes

## Core Commands

### Grid Configuration

#### `setGridSize(radius)`
Sets the viewport radius (number of hex rings displayed).
```
setGridSize(5)
```

#### `setGridSizeWithScaling(radius)`
Sets viewport radius and automatically scales hex size to fit.
```
setGridSizeWithScaling(3)
```

#### `showCoordinates()`
Displays coordinate labels on each hex.
```
showCoordinates()
```

#### `hideCoordinates()`
Hides coordinate labels.
```
hideCoordinates()
```

#### `resetBoard()`
Clears all effects, tokens, and animations.
```
resetBoard()
```

### Hex Effects

#### `highlight(q, r, color)`
Applies static colored highlighting to a hex.
```
highlight(0, 1, "#4fc3f7")
highlight(-1, 0, "#ff6b6b")
```

#### `blink(q, r, color)`
Makes a hex blink rapidly with sharp on/off transitions.
```
blink(2, -1, "#ffff00")
```

#### `pulse(q, r, color)`
Makes a hex pulse gradually between its normal color and the specified color.
```
pulse(-2, 2, "#ff44ff")
```

### Game Pieces (Tokens)

#### `token(q, r, name, shape, color, label)`
Places a game piece on the board.

**Shapes**: `"circle"`, `"rect"`, `"triangle"`, `"star"`
```
token(0, 0, "player", "circle", "#0066ff", "Hero")
token(1, 1, "enemy", "triangle", "#ff0000", "Orc")
token(-1, 0, "treasure", "star", "#ffd700")
```

#### `move(tokenName, q, r)`
Animates a token moving to a new position.
```
move("player", 2, -1)
```

### Visual Indicators

#### `point(q, r, label)`
Draws an arrow pointing to a specific hex with optional label.
```
point(3, 0, "Target")
point(-2, 1)
```

#### `caption(text, duration, position)`
Displays text overlay for specified duration (milliseconds).

**Positions**: `"center"`, `"bottom"` (default: `"bottom"`)
```
caption("Welcome to the tutorial!", 3000)
caption("Important message", 2000, "center")
```

#### `dice(dieType, displayedNumber, color)`
Displays dice with specified type, number, and color. Multiple calls add dice horizontally.

**Die Types**: `"d6"`, `"d20"`
**Numbers**: 1-6 for d6, 1-20 for d20
**Colors**: Hex color (optional, default: `"#f0f0f0"`)
```
dice("d6", 4)                           # Gray d6 showing 4
dice("d20", 15, "#ff6b6b")             # Red d20 showing 15
dice("d6", 2, "#4fc3f7")               # Blue d6 showing 2
# Multiple dice appear side by side
```

#### `sleep(milliseconds)`
Pauses execution for the specified duration before continuing with the next command.
```
sleep(1000)                            # Wait 1 second
sleep(500)                             # Wait half a second
```

### Clearing Effects

#### `clear(type)`
Removes specific types of effects or all effects.

**Clear Types**:
- `ClearType.ALL` or `"ALL"` - Everything
- `ClearType.HIGHLIGHT` or `"HIGHLIGHT"` - Static highlights only
- `ClearType.BLINK` or `"BLINK"` - Blinking effects only
- `ClearType.PULSE` or `"PULSE"` - Pulsing effects only
- `ClearType.POINT` or `"POINT"` - Arrows/pointers only
- `ClearType.TOKEN` or `"TOKEN"` - Game pieces only
- `ClearType.CAPTION` or `"CAPTION"` - Text overlays only
- `ClearType.DICE` or `"DICE"` - Dice displays only

```
clear("ALL")
clear("HIGHLIGHT")
clear("DICE")
clear(ClearType.TOKEN)
```

## Color Reference

### Predefined Colors
You can use hex color codes or these predefined constants:

```
Colors.RED          #FF4444
Colors.DARK_RED     #CC3333
Colors.GREEN        #44FF44
Colors.DARK_GREEN   #33CC33
Colors.BLUE         #4444FF
Colors.DARK_BLUE    #3333CC
Colors.YELLOW       #FFFF44
Colors.DARK_YELLOW  #CCCC33
Colors.ORANGE       #FFA500
Colors.DARK_ORANGE  #CC8400
Colors.PURPLE       #FF44FF
Colors.DARK_PURPLE  #CC33CC
Colors.CYAN         #44FFFF
Colors.DARK_CYAN    #33CCCC
Colors.WHITE        #FFFFFF
Colors.LIGHT_GRAY   #CCCCCC
Colors.GRAY         #888888
Colors.DARK_GRAY    #666666
Colors.BLACK        #000000
Colors.HIGHLIGHT_BLUE  #4FC3F7
```

## Common Coordinate Patterns

### Adjacent Hexes (Ring 1)
```
# Six hexes around center (0,0)
highlight(0, -1, "#4fc3f7")  # North
highlight(1, -1, "#4fc3f7")  # Northeast
highlight(1, 0, "#4fc3f7")   # Southeast
highlight(0, 1, "#4fc3f7")   # South
highlight(-1, 1, "#4fc3f7")  # Southwest
highlight(-1, 0, "#4fc3f7")  # Northwest
```

### Extended Range (Ring 2)
```
# Hexes at distance 2 from center
highlight(0, -2, "#ff6b6b")   # North 2
highlight(1, -2, "#ff6b6b")   # Northeast 2
highlight(2, -1, "#ff6b6b")   # East 2
highlight(2, 0, "#ff6b6b")    # Southeast 2
highlight(0, 2, "#ff6b6b")    # South 2
highlight(-1, 2, "#ff6b6b")   # Southwest 2
highlight(-2, 1, "#ff6b6b")   # West 2
highlight(-2, 0, "#ff6b6b")   # Northwest 2
```

## Example Tutorial Script

```
# Lancer Movement Tutorial
# Demonstrates basic movement mechanics

# Setup
setGridSizeWithScaling(4)
showCoordinates()
caption("Lancer Movement Tutorial", 2000)

# Place mech in center
token(0, 0, "mech", "circle", "#0066ff", "Everest")

# Show movement range (speed 4)
highlight(1, 0, "#4fc3f7")
highlight(-1, 0, "#4fc3f7")
highlight(0, 1, "#4fc3f7")
highlight(0, -1, "#4fc3f7")
highlight(1, -1, "#4fc3f7")
highlight(-1, 1, "#4fc3f7")
highlight(2, 0, "#4fc3f7")
highlight(-2, 0, "#4fc3f7")

caption("Blue hexes show movement range", 3000)

# Demonstrate movement
point(2, -1, "Move here")
move("mech", 2, -1)
clear("POINT")
clear("HIGHLIGHT")

# Show engagement zone
pulse(1, -1, "#ffff00")
pulse(2, 0, "#ffff00")
pulse(3, -1, "#ffff00")
pulse(1, 0, "#ffff00")
pulse(2, -2, "#ffff00")

caption("Yellow shows engagement zone", 2000)

# Show dice rolls
dice("d20", 18, "#4fc3f7")
caption("Initiative roll: 18!", 2000)
sleep(1000)
dice("d6", 3, "#ff6b6b")
caption("Damage roll: 3", 1500)

# Cleanup
clear("DICE")
clear("ALL")
caption("Tutorial complete!", 1500)
```

## Best Practices

### Script Organization
1. Start with grid setup and coordinate display
2. Place initial tokens and pieces
3. Show effects and animations in logical sequence
4. Use captions to explain what's happening
5. Clear effects between major sections
6. End with cleanup and final message

### Timing Considerations
- Commands execute sequentially without automatic delays
- Use `caption()` with appropriate durations to pace tutorials
- Move animations take ~1 second to complete
- Consider viewer reading speed for caption durations

### Visual Clarity
- Use contrasting colors for different concepts
- Don't overlay too many effects simultaneously
- Clear previous effects before showing new ones
- Use consistent color schemes throughout tutorials

### Performance
- Keep grid size reasonable (radius ≤ 8 for most cases)
- Avoid excessive simultaneous animations
- Clear unused effects to maintain performance

## Running Your Scripts

Use the simple interpreter to run your `.board` files:

```bash
node simple-interpreter.js your-tutorial.board
# Or specify a custom port:
node simple-interpreter.js your-tutorial.board 8080
```

The interpreter provides:
- Live reloading when you save changes
- Real-time visualization at `http://localhost:3001`
- Error logging for invalid commands
- File watching for rapid iteration

## Error Handling

Common issues and solutions:

- **Invalid coordinate**: Ensure coordinates are within -20 to +20 range
- **Missing token**: Verify token name matches exactly (case-sensitive)
- **Syntax error**: Check parentheses, quotes, and comma placement
- **Color format**: Use proper hex format `"#RRGGBB"` or predefined colors
- **Unknown method**: Verify method name spelling and availability

The interpreter will log warnings and errors to the console while continuing to execute valid commands.