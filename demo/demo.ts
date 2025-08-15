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
  await board.caption('In Lancer SPEED determines how far you can go', 3000);
  
  // show a circle token with label "mech" on the origin
  board.token(0, 0, 'mech', 'circle', '#4444FF', 'mech');
  
  // CAPTION "This mech has speed 2"
  await board.caption('This mech has speed 2');
  
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
  await board.caption('The mech will now move by 2');
  
  // now move the mech token two hexes away
  await board.move('mech', 2, 0);
  
  // clear the highlights
  board.clear(ClearType.PULSE);
  
  // CAPTION "It is out of move now..."
  await board.caption('It is out of move now...');
  
  // CAPTION "...but it can spend a quick action to move again"
  await board.caption('...but it can spend a quick action to move again');
  
  // move again two fields somewhere else
  await board.move('mech', 0, 2);
  
  // CAPTION "this is called a boost"
  await board.caption('this is called a boost');
  
  // CAPTION "Terrain can make it harder to move"
  await board.caption('Terrain can make it harder to move');
  
  // highlight some hexes next to the mech in red, point arrow at them with label "difficult terrain"
  board.highlight(1, 2, '#FF4444');
  board.highlight(0, 3, '#FF4444');
  board.highlight(-1, 3, '#FF4444');
  board.point(1, 2, 'difficult terrain');
  
  // CAPTION "Moving through difficult terrain costs 2x speed"
  await board.caption('Moving through difficult terrain costs 2x speed');
  
  // clear the arrows
  board.clear(ClearType.POINT);
  
  // make the mech move into one of the difficult terrain hexes
  await board.move('mech', 1, 2);
  
  // CAPTION "With Speed 2 this mech can move through only 1 difficult terrain"
  await board.caption('With Speed 2 this mech can move through only 1 difficult terrain');
}

// Utility function for async delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}