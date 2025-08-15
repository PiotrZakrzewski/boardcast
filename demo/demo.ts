import { BoardcastHexBoard, ClearType } from '../lib/index';

// Initialize the boardcast demo when the DOM is loaded
let board: BoardcastHexBoard;

document.addEventListener('DOMContentLoaded', () => {
  board = new BoardcastHexBoard('#chart');
  console.log('Boardcast hex board demo initialized!');
  
  // Make board available globally for console access
  (window as any).boardcast = board;
  
  setupDemoEventListeners();
});

function setupDemoEventListeners(): void {
  const showCoordBtn = document.getElementById('show-coordinates');
  const hideCoordBtn = document.getElementById('hide-coordinates');
  const gridSmallBtn = document.getElementById('grid-small');
  const gridMediumBtn = document.getElementById('grid-medium');
  const gridLargeBtn = document.getElementById('grid-large');
  const demoHighlightBtn = document.getElementById('demo-highlight');
  const demoBlinkBtn = document.getElementById('demo-blink');
  const demoPulseBtn = document.getElementById('demo-pulse');
  const demoPointBtn = document.getElementById('demo-point');
  const demoCaptionBtn = document.getElementById('demo-caption');
  const demoClearBtn = document.getElementById('demo-clear');
  const demoTokensBtn = document.getElementById('demo-tokens');
  const demoMovementBtn = document.getElementById('demo-movement');
  const tutorialLancerMovementBtn = document.getElementById('tutorial-lancer-movement');
  const resetBtn = document.getElementById('reset-board');

  showCoordBtn?.addEventListener('click', () => board.showCoordinates());
  hideCoordBtn?.addEventListener('click', () => board.hideCoordinates());
  
  gridSmallBtn?.addEventListener('click', () => board.setGridSizeWithScaling(3));
  gridMediumBtn?.addEventListener('click', () => board.setGridSizeWithScaling(6));
  gridLargeBtn?.addEventListener('click', () => board.setGridSizeWithScaling(10));
  
  demoHighlightBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.highlight(1, 0, '#ff6b6b');
    board.highlight(-1, 1, '#4ecdc4');
    board.highlight(0, -1, '#feca57');
  });

  demoBlinkBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.blink(2, -1, '#ff6b6b');
    board.blink(-2, 1, '#4ecdc4');
    board.blink(1, 1, '#feca57');
  });

  demoPulseBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.pulse(1, -1, '#ff6b6b');
    board.pulse(-1, 0, '#4ecdc4');
    board.pulse(0, 1, '#feca57');
  });

  demoPointBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.point(2, -1, 'Target A');
    board.point(-1, 2, 'Target B');
    board.point(0, 0, 'Center');
    board.point(-2, 0, 'Left');
  });

  demoCaptionBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.caption('Welcome to Boardcast!', 3000);
    setTimeout(() => {
      board.caption('This demonstrates caption overlays', 2500);
    }, 3200);
    setTimeout(() => {
      board.caption('Perfect for explaining game rules!', 2000);
    }, 6000);
  });

  demoClearBtn?.addEventListener('click', () => {
    // Create various artifacts to demonstrate clearing
    board.resetBoard();
    board.highlight(0, 0, '#ff6b6b');
    board.highlight(1, 0, '#4ecdc4');
    board.blink(-1, 0, '#feca57');
    board.pulse(0, 1, '#ff6b6b');
    board.point(1, 1, 'Target');
    board.token(0, -1, 'demo', 'star', '#4444ff', 'Token');
    board.caption('All artifacts created - click again to clear points only', 3000);
    
    // Demonstrate selective clearing after a delay
    setTimeout(() => {
      board.clear(ClearType.POINT);
      board.caption('Points cleared! Click Clear again to clear all highlights', 3000);
    }, 4000);
    
    setTimeout(() => {
      board.clear(ClearType.HIGHLIGHT);
      board.caption('Highlights cleared! Other artifacts remain', 2000);
    }, 8000);
  });

  demoTokensBtn?.addEventListener('click', () => {
    board.resetBoard();
    board.token(0, 0, 'center', 'circle', '#ff4444', 'Player');
    board.token(1, 0, 'right', 'rect', '#44ff44', 'Guard');
    board.token(-1, 1, 'left', 'triangle', '#4444ff', 'Enemy');
    board.token(0, -1, 'top', 'star', '#ffff44', 'Treasure');
  });

  demoMovementBtn?.addEventListener('click', async () => {
    board.resetBoard();
    board.token(0, 0, 'player', 'circle', '#ff4444', 'Hero');
    
    // Demo movement sequence
    await board.move('player', 2, -1);
    await board.move('player', -1, 2);
    await board.move('player', 0, 0);
  });

  resetBtn?.addEventListener('click', () => board.resetBoard());

  // Lancer Movement Tutorial
  tutorialLancerMovementBtn?.addEventListener('click', async () => {
    await lancerMovementTutorial();
  });
}

// Comprehensive Lancer Movement Tutorial
async function lancerMovementTutorial(): Promise<void> {
  board.resetBoard();
  
  // Set up terrain using highlight colors
  // Normal terrain (default)
  // Difficult terrain (orange/yellow)
  board.highlight(-1, -1, '#FFA500'); // Orange for difficult terrain
  board.highlight(0, -1, '#FFA500');
  board.highlight(1, -1, '#FFA500');
  
  // Dangerous terrain (red)
  board.highlight(-2, 1, '#FF4444'); // Red for dangerous terrain
  board.highlight(-1, 1, '#FF4444');
  
  // Cover/obstacles (dark gray)
  board.highlight(2, -1, '#666666'); // Hard cover
  board.highlight(1, 0, '#666666');
  
  // Phase 1: Introduction and terrain setup
  board.caption('Lancer Movement Tutorial', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  // Introduce difficult terrain with arrows
  board.point(0, -1, 'Orange');
  board.caption('Orange = Difficult Terrain (2x movement cost)', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear difficult terrain arrow
  
  // Introduce dangerous terrain with arrows
  board.point(-1, 1, 'Red');
  board.caption('Red = Dangerous Terrain (Engineering check or 5 damage)', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear dangerous terrain arrow
  
  // Introduce cover/obstacles with arrows
  board.point(1, 0, 'Gray');
  board.caption('Gray = Hard Cover/Obstacles', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear cover arrows
  
  // Phase 2: Setup mechs
  board.token(0, 0, 'player-mech', 'circle', '#4444FF', 'Blue Mech');
  board.token(2, 1, 'enemy-mech', 'triangle', '#FF4444', 'Enemy');
  
  board.caption('Blue Mech (SPEED 4) vs Enemy (engaged when adjacent)', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  // Phase 3: Basic movement demonstration
  board.caption('Standard Move: Up to SPEED (4 spaces)', 2500);
  board.point(0, 0, 'Start');
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear the start arrow
  
  // Show movement range
  board.highlight(-2, 0, '#4FC3F7'); // Possible moves (4 spaces)
  board.highlight(-1, 0, '#4FC3F7');
  board.highlight(1, 1, '#4FC3F7');
  board.highlight(0, 1, '#4FC3F7');
  board.highlight(-1, 2, '#4FC3F7');
  board.highlight(0, 2, '#4FC3F7');
  
  board.caption('Blue shows normal 4-space movement range', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  // Clear range highlights, restore terrain
  board.highlight(-2, 0, '#2a2a2a');
  board.highlight(-1, 0, '#2a2a2a');
  board.highlight(1, 1, '#2a2a2a');
  board.highlight(0, 1, '#2a2a2a');
  board.highlight(-1, 2, '#2a2a2a');
  board.highlight(0, 2, '#2a2a2a');
  
  // Restore terrain colors
  board.highlight(-1, -1, '#FFA500');
  board.highlight(0, -1, '#FFA500');
  board.highlight(1, -1, '#FFA500');
  board.highlight(-2, 1, '#FF4444');
  board.highlight(-1, 1, '#FF4444');
  board.highlight(2, -1, '#666666');
  board.highlight(1, 0, '#666666');
  
  // Phase 4: Difficult terrain movement
  board.caption('Moving through difficult terrain (orange)', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.point(-1, -1, '2 Move');
  board.caption('Difficult terrain costs 2 movement per space', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  await board.move('player-mech', -1, -1);
  board.clear(ClearType.POINT); // Clear the movement arrow
  board.caption('Moved 1 space, cost 2 movement (2/4 used)', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  // Phase 5: Continue through difficult terrain
  board.point(0, -1, '2 More');
  await board.move('player-mech', 0, -1);
  board.clear(ClearType.POINT); // Clear the movement arrow
  board.caption('Another difficult space (4/4 movement used)', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  // Phase 6: BOOST demonstration
  board.caption('BOOST: Quick Action for extra movement!', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.caption('BOOST gives additional SPEED (4) movement', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.point(1, 0, 'BOOST');
  board.caption('Using BOOST to move 1 more space', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  await board.move('player-mech', 1, 0);
  board.clear(ClearType.POINT); // Clear the BOOST arrow
  
  // Phase 7: Engagement rules
  board.caption('ENGAGEMENT: Adjacent mechs become ENGAGED', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  board.point(2, 1, 'Enemy');
  board.caption('Moving adjacent to enemy = ENGAGEMENT', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear enemy pointer
  board.point(2, 0, 'Engage');
  await board.move('player-mech', 2, 0);
  board.clear(ClearType.POINT); // Clear engage arrow
  
  // Visual indication of engagement
  board.blink(2, 0, '#FFFF00'); // Yellow blink for engaged mech
  board.blink(2, 1, '#FFFF00'); // Yellow blink for engaged enemy
  
  board.caption('ENGAGED! Both mechs affected:', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.caption('• Ranged attacks +1 Difficulty', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• Moving away may trigger reactions', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  // Phase 8: DISENGAGE demonstration
  board.caption('DISENGAGE: Full Action to avoid reactions', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.caption('DISENGAGE ignores engagement for rest of turn', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.point(1, 1, 'Safe');
  board.caption('Moving away safely with DISENGAGE', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  await board.move('player-mech', 1, 1);
  board.clear(ClearType.POINT); // Clear safe movement arrow
  
  // Stop blinking to show disengagement
  board.highlight(2, 0, '#2a2a2a');
  board.highlight(2, 1, '#2a2a2a');
  board.highlight(1, 1, '#4FC3F7'); // Highlight new position
  
  // Phase 9: Dangerous terrain warning
  board.caption('Dangerous Terrain ahead!', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.point(-1, 1, 'Danger');
  board.caption('Red terrain: Engineering check or 5 damage', 3000);
  await sleep(5000); // 3s caption + 2s pause
  
  board.clear(ClearType.POINT); // Clear danger arrow
  
  // Phase 10: Summary
  board.caption('Lancer Movement Summary:', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• Standard Move: Up to SPEED', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• BOOST: Extra SPEED as Quick Action', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• Difficult Terrain: 2x movement cost', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• Dangerous Terrain: Damage risk', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• ENGAGEMENT: Adjacent = penalties', 2000);
  await sleep(4000); // 2s caption + 2s pause
  
  board.caption('• DISENGAGE: Full Action to avoid reactions', 2500);
  await sleep(4500); // 2.5s caption + 2s pause
  
  board.caption('Tutorial Complete! Try the controls yourself.', 3000);
  await sleep(3000); // Just the caption duration, no extra pause needed at the end
}

// Utility function for async delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}