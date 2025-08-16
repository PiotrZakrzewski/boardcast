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

  demoCaptionBtn?.addEventListener('click', async () => {
    board.resetBoard();
    await board.caption('Welcome to Boardcast!', 3000);
    await board.caption('This demonstrates caption overlays', 2500);
    await board.caption('Perfect for explaining game rules!', 2000);
  });

  demoClearBtn?.addEventListener('click', async () => {
    // Create various artifacts to demonstrate clearing
    board.resetBoard();
    board.highlight(0, 0, '#ff6b6b');
    board.highlight(1, 0, '#4ecdc4');
    board.blink(-1, 0, '#feca57');
    board.pulse(0, 1, '#ff6b6b');
    board.point(1, 1, 'Target');
    board.token(0, -1, 'demo', 'star', '#4444ff', 'Token');
    await board.caption('All artifacts created - watch selective clearing', 3000);
    
    // Demonstrate selective clearing
    board.clear(ClearType.POINT);
    await board.caption('Points cleared! Watch highlights clear next', 3000);
    
    board.clear(ClearType.HIGHLIGHT);
    await board.caption('Highlights cleared! Other artifacts remain', 2000);
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

// Lancer Movement Tutorial - Based on script
async function lancerMovementTutorial(): Promise<void> {
  board.resetBoard();
  
  // CAPTION "In Lancer SPEED determines how far you can go" 3s
  await board.caption('In Lancer SPEED determines how far you can go', 3000, 'bottom');
  
  // show a circle token with label "mech" on the origin
  board.token(0, 0, 'mech', 'circle', '#4444FF', 'mech');
  
  // CAPTION "This mech has speed 2"
  await board.caption('This mech has speed 2', 2000, 'bottom');
  
  // show pulse on all coordinates in distance 2 from the origin
  // Distance 1 hexes
  board.pulse(1, 0, '#4fc3f7');
  board.pulse(-1, 0, '#4fc3f7');
  board.pulse(0, 1, '#4fc3f7');
  board.pulse(0, -1, '#4fc3f7');
  board.pulse(1, -1, '#4fc3f7');
  board.pulse(-1, 1, '#4fc3f7');
  
  // Distance 2 hexes
  board.pulse(2, 0, '#4fc3f7');
  board.pulse(-2, 0, '#4fc3f7');
  board.pulse(0, 2, '#4fc3f7');
  board.pulse(0, -2, '#4fc3f7');
  board.pulse(2, -1, '#4fc3f7');
  board.pulse(1, -2, '#4fc3f7');
  board.pulse(-1, -1, '#4fc3f7');
  board.pulse(-2, 1, '#4fc3f7');
  board.pulse(-1, 2, '#4fc3f7');
  board.pulse(1, 1, '#4fc3f7');
  board.pulse(2, -2, '#4fc3f7');
  board.pulse(-2, 2, '#4fc3f7');
  
  // CAPTION "The mech will now move by 2"
  await board.caption('The mech will now move by 2', 2000, 'bottom');
  
  // now move the mech token two hexes away
  await board.move('mech', 2, 0);
  
  // clear the highlights
  board.clear(ClearType.PULSE);
  
  // CAPTION "It is out of move now..."
  await board.caption('It is out of move now...', 2000, 'bottom');
  
  // CAPTION "...but it can spend a quick action to move again"
  await board.caption('...but it can spend a quick action to move again', 2000, 'bottom');
  
  // move again two fields somewhere else
  await board.move('mech', 0, 2);
  
  // CAPTION "this is called a boost"
  await board.caption('this is called a boost', 2000, 'bottom');
  
  // CAPTION "Terrain can make it harder to move"
  await board.caption('Terrain can make it harder to move', 2000, 'bottom');
  
  // highlight some hexes next to the mech in yellow, point arrow at them with label "difficult terrain"
  board.highlight(1, 1, '#FFFF44');
  board.highlight(0, 2, '#FFFF44');
  board.highlight(-1, 2, '#FFFF44');
  board.point(1, 1, 'difficult terrain');
  
  // CAPTION "Moving through difficult terrain costs 2x speed"
  await board.caption('Moving through difficult terrain costs 2x speed', 2000, 'bottom');
  
  // clear the arrows
  board.clear(ClearType.POINT);
  
  // make the mech move into one of the difficult terrain hexes
  await board.move('mech', 1, 1);
  
  // CAPTION "With Speed 2 this mech can move through only 1 difficult terrain"
  await board.caption('With Speed 2 this mech can move through only 1 difficult terrain', 2000, 'bottom');
  
  // clear the highlights
  board.clear(ClearType.HIGHLIGHT);
  
  // CAPTION "Dangerous terrain does not slow you down ..."
  await board.caption('Dangerous terrain does not slow you down ...', 2000, 'bottom');
  
  // CAPTION "But may cause damage"
  await board.caption('But may cause damage', 2000, 'bottom');
  
  // highlight some hexes near the mech in red, point at them with label dangerous terrain
  board.highlight(2, 1, '#FF4444');
  board.highlight(1, 2, '#FF4444');
  board.highlight(0, 3, '#FF4444');
  board.point(2, 1, 'dangerous terrain');
  
  // Wait a moment to show the dangerous terrain
  await sleep(2000);
  
  // clear the arrows
  board.clear(ClearType.POINT);
  
  // move the mech into one of the dangerous hexes
  await board.move('mech', 2, 1);
  
  // CAPTION "When you move into dangerous terrain for the first time"
  await board.caption('When you move into dangerous terrain for the first time', 2000, 'bottom');
  
  // CAPTION "You must roll ENGINEERING, you get 5 damage if you fail"
  await board.caption('You must roll ENGINEERING, you get 5 damage if you fail', 2000, 'bottom');
  
  // CAPTION "The damage type depends on the terrain itself (up to GM)"
  await board.caption('The damage type depends on the terrain itself (up to GM)', 2000, 'bottom');
}

// Utility function for async delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}