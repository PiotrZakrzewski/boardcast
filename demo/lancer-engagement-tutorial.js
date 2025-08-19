import { LancerCombat } from 'boardcast-contrib/lancer/combat.js';

// Tutorial Configuration
export const config = {
  gridRadius: 3,
  title: "Lancer Engagement Rules"
};


export async function runTutorial(board) {
  board.clear();
  board.token(0, 0, "mech", "circle", "#4fc3f7", "mech");
  const combat = new LancerCombat(board);
  combat.showEngagementZone(0, 0, "#ff0000");
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
*/