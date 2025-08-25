// Generated from example.board
// Tutorial Configuration
export const config = {
  gridRadius: 3,
  title: "example"
};

// Main tutorial function - automatically generated from .board file
export async function runTutorial(board) {
  console.log('Starting generated tutorial...');
  
  // Clear any existing state
  board.resetBoard();
  
  board.setGridSizeWithScaling(3);
  board.showCoordinates();
  board.dice("d6", 2);
  await sleep(1100);
  board.clear("DICE");
  await sleep(1000);
  board.token(0, 0, "mech", "circle", "#4444FF", "Mech6");
  board.highlight(1, 0, "#4fc3f7");
  board.highlight(-1, 0, "#4fc3f7");
  board.highlight(0, 1, "#4fc3f7");
  board.highlight(0, -1, "#4fc3f7");
  board.highlight(1, -1, "#4fc3f7");
  board.highlight(-1, 1, "#4fc3f7");
  await sleep(1000);
  await board.caption("Welcome to Boardcast Interpreter!", 3000);
  await board.move("mech", 2, 0);
  board.clear("HIGHLIGHT");
  await sleep(1000);
  board.pulse(2, 1, "#ff6b6b");
  board.pulse(1, 2, "#4ecdc4");
  board.pulse(-1, 1, "#feca57");
  board.point(2, 1, "Target A");
  board.point(-2, -1, "Target B");
  await board.caption("Demo complete! Script executed successfully.", 2000);
  
  console.log('Tutorial complete!');
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
Generated Tutorial Notes:
- This file was automatically generated from a .board file
- You can modify this file manually if needed
- The tutorial can be recorded using: boardcast record example.js
- Commands are executed sequentially with automatic timing
*/