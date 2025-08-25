// Template based on the Lancer Movement demo
const tutorialTemplate = `// Tutorial Configuration
export const config = {
  gridRadius: 8,        // Number of hex rings (3=small, 6=medium, 8=default, 10=large)
  title: "My Tutorial"  // Used for video filename
};

// Main tutorial function - this is where you implement your tutorial
export async function runTutorial(board) {
  console.log('Starting tutorial...');
  
  // Clear any existing state
  board.clear();
  
  // Example: Set up terrain
  board.highlight(2, -1, '#8d6e63'); // Difficult terrain (brown)
  board.highlight(3, -1, '#8d6e63');
  board.highlight(2, 0, '#8d6e63');
  board.highlight(3, 0, '#8d6e63');
  
  board.highlight(-2, 3, '#f44336'); // Dangerous terrain (red)
  board.highlight(-1, 2, '#f44336');
  board.highlight(-1, 3, '#f44336');
  
  await sleep(2000);

  console.log('Placing units...');
  
  // Example: Place initial units
  board.token(-3, 2, 'pilot', 'circle', '#4fc3f7', 'Pilot');
  board.token(4, -2, 'enemy1', 'triangle', '#f44336', 'Enemy');
  board.token(1, 3, 'cover', 'rect', '#795548', 'Cover');
  
  await sleep(2000);

  // Example: Introduction caption
  board.caption('Tutorial Title\\nSubtitle or description', 3000);
  await sleep(3500);

  console.log('Demonstrating movement...');
  
  // Example: Show movement range
  board.point(-3, 2, 'Start');
  board.pulse(-2, 1, '#4fc3f7');
  board.pulse(-1, 1, '#4fc3f7');
  board.pulse(-2, 2, '#4fc3f7');
  board.pulse(-1, 2, '#4fc3f7');
  board.pulse(0, 1, '#4fc3f7');
  
  board.caption('Movement Range\\nShowing possible moves', 2500);
  await sleep(3000);

  // Clear movement indicators
  board.clear('PULSE');
  board.clear('POINT');
  
  console.log('Moving unit...');
  
  // Example: Move the pilot
  board.move('pilot', -1, 1);
  await sleep(1500);
  board.move('pilot', 0, 1);
  await sleep(1500);
  
  board.caption('Movement Complete\\nUnit has reached destination', 2000);
  await sleep(2500);

  console.log('Tutorial complete!');
  
  // Final cleanup (optional)
  board.clear('POINT');
  await sleep(1000);
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* 
Tutorial API Reference:

BOARD SETUP:
- board.clear()                           // Clear all elements
- board.clear('HIGHLIGHT'|'BLINK'|...)   // Clear specific type

HIGHLIGHTING:
- board.highlight(q, r, color)           // Static highlight
- board.blink(q, r, color)              // Blinking highlight  
- board.pulse(q, r, color)              // Pulsing highlight

TOKENS:
- board.token(q, r, name, shape, color, label?)
  shapes: 'circle', 'rect', 'triangle', 'star'
- board.move(tokenName, q, r)           // Animate movement

ANNOTATIONS:
- board.point(q, r, label?)             // Arrow pointing at hex
- board.caption(text, duration?)        // Large text overlay

COORDINATES:
- Use axial coordinates (q, r)
- Center is (0, 0)
- Adjacent hexes differ by ±1 in one coordinate

COLORS:
- Use hex colors: '#ff0000', '#00ff00', etc.
- Common: '#4fc3f7' (blue), '#f44336' (red), '#8d6e63' (brown)
*/`;

export { tutorialTemplate };