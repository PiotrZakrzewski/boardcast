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

Boardcast provides a comprehensive color palette optimized for dark backgrounds and accessible visualization.

### Using Color Constants

You can specify colors in three ways:

```board
# Direct color constants (recommended)
highlight(0, 0, BLUE)
token(1, 0, "hero", "circle", ALLY)

# Colors namespace syntax
highlight(0, 0, Colors.BLUE) 
token(1, 0, "hero", "circle", Colors.ALLY)

# Traditional hex colors
highlight(0, 0, "#4FC3F7")
token(1, 0, "hero", "circle", "#4CAF50")
```

### Complete Color Palette

#### Primary Colors (Bright & Vibrant)
```
BLUE       #4FC3F7    Bright cyan-blue (primary highlight)
RED        #FF6B6B    Soft red (danger/enemy)
GREEN      #4CAF50    Material green (ally/success)
YELLOW     #FFD54F    Warm yellow (attention/movement)
PURPLE     #BA68C8    Light purple (special effects)
ORANGE     #FF9800    Bright orange (warning/boss)
CYAN       #4DD0E1    Light cyan (water/ice)
PINK       #F48FB1    Light pink (charm/healing)
```

#### Secondary Colors (Darker Variants)
```
DARK_BLUE    #1976D2    Darker blue for subtle elements
DARK_RED     #D32F2F    Darker red for muted danger
DARK_GREEN   #388E3C    Darker green for backgrounds
DARK_YELLOW  #F57C00    Amber/darker yellow
DARK_PURPLE  #7B1FA2    Darker purple for contrast
DARK_ORANGE  #E65100    Darker orange for accents
DARK_CYAN    #00838F    Darker cyan for depth
DARK_PINK    #C2185B    Darker pink for contrast
```

#### Neutral Colors
```
WHITE        #FFFFFF    Pure white (high contrast text)
LIGHT_GRAY   #BDBDBD    Light gray (disabled/secondary)
GRAY         #757575    Medium gray (borders/lines)
DARK_GRAY    #424242    Dark gray (backgrounds)
BLACK        #000000    Pure black (void/hidden)
```

#### Semantic Game Colors
```
ALLY         #4CAF50    Green for friendly units
ENEMY        #FF6B6B    Red for hostile units  
NEUTRAL      #FFD54F    Yellow for neutral/movement
HIGHLIGHT    #4FC3F7    Blue for selection/focus
DANGER       #FF5722    Orange-red for hazardous terrain
DIFFICULT    #8D6E63    Brown for difficult terrain
ENGAGEMENT   #FFEB3B    Bright yellow for threat zones
```

### Color Usage Patterns

#### Terrain Types
```board
# Different terrain effects
highlight(0, 0, DIFFICULT)    # Brown for difficult terrain
highlight(1, 0, DANGER)       # Orange-red for hazards
highlight(2, 0, NEUTRAL)      # Yellow for open ground
highlight(3, 0, ALLY)         # Green for safe zones
```

#### Unit Classifications  
```board
# Clear visual distinction between unit types
token(0, 0, "hero", "circle", ALLY)      # Green allies
token(1, 0, "enemy", "triangle", ENEMY)  # Red enemies
token(2, 0, "npc", "rect", NEUTRAL)      # Yellow neutrals
token(3, 0, "boss", "star", ORANGE)      # Orange bosses
```

#### Visual Effects by Purpose
```board
# Use colors that match the effect's meaning
blink(0, 0, RED)           # Red for urgent attention
pulse(1, 0, ENGAGEMENT)    # Yellow for threat zones  
highlight(2, 0, HIGHLIGHT) # Blue for selections
point(3, 0, "Target")      # Uses default RED for arrows
```

## Common Coordinate Patterns

### Adjacent Hexes (Ring 1)
```
# Six hexes around center (0,0)
highlight(0, -1, BLUE)      # North
highlight(1, -1, BLUE)      # Northeast
highlight(1, 0, BLUE)       # Southeast
highlight(0, 1, BLUE)       # South
highlight(-1, 1, BLUE)      # Southwest
highlight(-1, 0, BLUE)      # Northwest
```

### Extended Range (Ring 2)
```
# Hexes at distance 2 from center
highlight(0, -2, RED)       # North 2
highlight(1, -2, RED)       # Northeast 2
highlight(2, -1, RED)       # East 2
highlight(2, 0, RED)        # Southeast 2
highlight(0, 2, RED)        # South 2
highlight(-1, 2, RED)       # Southwest 2
highlight(-2, 1, RED)       # West 2
highlight(-2, 0, RED)       # Northwest 2
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
token(0, 0, "mech", "circle", BLUE, "Everest")

# Show movement range (speed 4)
highlight(1, 0, HIGHLIGHT)
highlight(-1, 0, HIGHLIGHT)
highlight(0, 1, HIGHLIGHT)
highlight(0, -1, HIGHLIGHT)
highlight(1, -1, HIGHLIGHT)
highlight(-1, 1, HIGHLIGHT)
highlight(2, 0, HIGHLIGHT)
highlight(-2, 0, HIGHLIGHT)

caption("Blue hexes show movement range", 3000)

# Demonstrate movement
point(2, -1, "Move here")
move("mech", 2, -1)
clear("POINT")
clear("HIGHLIGHT")

# Show engagement zone
pulse(1, -1, ENGAGEMENT)
pulse(2, 0, ENGAGEMENT)
pulse(3, -1, ENGAGEMENT)
pulse(1, 0, ENGAGEMENT)
pulse(2, -2, ENGAGEMENT)

caption("Yellow shows engagement zone", 2000)

# Show dice rolls
dice("d20", 18, CYAN)
caption("Initiative roll: 18!", 2000)
sleep(1000)
dice("d6", 3, RED)
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