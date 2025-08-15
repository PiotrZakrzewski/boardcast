import { BoardcastHexBoard } from '../lib/BoardcastHexBoard';

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
  const demoTokensBtn = document.getElementById('demo-tokens');
  const demoMovementBtn = document.getElementById('demo-movement');
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
}