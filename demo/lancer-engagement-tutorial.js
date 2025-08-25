import { LancerCombat } from 'boardcast-contrib/lancer/combat.js';

// Tutorial Configuration
export const config = {
  gridRadius: 3,
  title: "Lancer Engagement Rules"
};


export async function runTutorial(board) {
  board.clear();
  await board.caption("Basics of Engagement", 3000, "center");
  board.token(0, 0, "mech", "circle", "#4fc3f7", "mech");
  const combat = new LancerCombat(board);
  const yellow = "#f3f743";
  const red = "#ff0000";
  const blue = "#4fc3f7";
  combat.showEngagementZone(0, 0, yellow);
  board.point(0, -1, "Adjacent tiles");
  await board.caption("Entering an adjacent tile of a hostile mech triggers an engagement", 3000, "center");
  await board.token(3, 0, "enemy mech", "circle", "#ff0000", "enemy mech");
  await board.move("enemy mech", 1, 0);
  await board.clear("BLINK");
  await board.clear("POINT");
  await board.highlight(1, 0, red);
  await sleep(1000);
  await board.highlight(0, 0, red);
  await board.caption("The two mech are now engaged", 3000, "center");
  await board.caption("Move is interrupted by engagement", 3000, "center");
  await board.clear("ALL");
  await board.caption("What if the other mech is bigger?", 3000, "center");
  // place a mech1 token and highlight two more fields in blue directly next to it
  await board.token(0, 0, "mech1", "circle", yellow, "Size 2 mech");
  await board.highlight(0,0, yellow);
  await board.highlight(1,0, yellow);
  await board.highlight(0,1, yellow);
  await board.point(0,0, "This mech occupies 3 tiles");
  await sleep(1000);
  await board.token(-2, 0, "mech2", "circle", red, "Size 1 mech");
  await board.move("mech2", -1, 0);
  await board.highlight(0, 0, red);
  await board.highlight(-1, 0, red);
  await board.caption("Both mechs are engaged but only the smaller one's move is broken", 3000, "center");
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