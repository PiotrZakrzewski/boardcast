import { BoardcastHexBoard, ClearType } from 'boardcast';
import * as Lancer from 'boardcast-contrib/lancer';

// Initialize the boardcast demo when the DOM is loaded
let board: BoardcastHexBoard;
let tutorialShouldStop = false;

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
  const demoDiceBtn = document.getElementById('demo-dice');
  const demoClearBtn = document.getElementById('demo-clear');
  const demoTokensBtn = document.getElementById('demo-tokens');
  const demoMovementBtn = document.getElementById('demo-movement');
  const tutorialLancerMovementBtn = document.getElementById('tutorial-lancer-movement');
  const tutorialLancerContribBtn = document.getElementById('tutorial-lancer-contrib');
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

  demoDiceBtn?.addEventListener('click', async () => {
    board.resetBoard();
    await board.caption('Rolling dice...', 1000);
    
    // Show different d6 rolls
    board.dice('d6', 1);
    await sleep(1500);
    board.dice('d6', 3);
    await sleep(1500);
    board.dice('d6', 6);
    await sleep(1500);
    
    // Clear and show d20 rolls
    board.clear();
    await board.caption('Now rolling d20...', 1000);
    board.dice('d20', 1);
    await sleep(1500);
    board.dice('d20', 10);
    await sleep(1500);
    board.dice('d20', 20);
    await sleep(1500);
    
    board.clear();
    await board.caption('Notice the visual difference between d6 and d20!', 2000);
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

  resetBtn?.addEventListener('click', () => {
    tutorialShouldStop = true;
    board.resetBoard();
  });

  // Lancer Movement Tutorial
  tutorialLancerMovementBtn?.addEventListener('click', async () => {
    tutorialShouldStop = false;
    await lancerMovementTutorial();
  });

  // Lancer Contrib Demo
  tutorialLancerContribBtn?.addEventListener('click', async () => {
    tutorialShouldStop = false;
    await lancerContribDemo();
  });
}

// Lancer Movement Tutorial - Based on script
async function lancerMovementTutorial(): Promise<void> {
  board.resetBoard();
  
  // CAPTION "In Lancer SPEED determines how far you can go" 3s
  if (tutorialShouldStop) return;
  await board.caption('In Lancer SPEED determines how far you can go', 3000);
  
  // show a circle token with label "mech" on the origin
  board.token(0, 0, 'mech', 'circle', '#4444FF', 'mech');
  
  // CAPTION "This mech has speed 2"
  if (tutorialShouldStop) return;
  await board.caption('This mech has speed 2', 2000);
  
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
  if (tutorialShouldStop) return;
  await board.caption('The mech will now move by 2', 2000);
  
  // now move the mech token two hexes away
  if (tutorialShouldStop) return;
  await board.move('mech', 2, 0);
  
  // clear the highlights
  board.clear(ClearType.PULSE);
  
  // CAPTION "It is out of move now..."
  if (tutorialShouldStop) return;
  await board.caption('It is out of move now...', 2000);
  
  // CAPTION "...but it can spend a quick action to move again"
  if (tutorialShouldStop) return;
  await board.caption('...but it can spend a quick action to move again', 2000);
  
  // move again two fields somewhere else
  if (tutorialShouldStop) return;
  await board.move('mech', 0, 2);
  
  // CAPTION "this is called a boost"
  if (tutorialShouldStop) return;
  await board.caption('this is called a boost', 2000);
  
  // CAPTION "Terrain can make it harder to move"
  if (tutorialShouldStop) return;
  await board.caption('Terrain can make it harder to move', 2000);
  
  // highlight some hexes next to the mech in yellow, point arrow at them with label "difficult terrain"
  board.highlight(1, 1, '#FFFF44');
  board.highlight(0, 2, '#FFFF44');
  board.highlight(-1, 2, '#FFFF44');
  board.point(1, 1, 'difficult terrain');
  
  // CAPTION "Moving through difficult terrain costs 2x speed"
  if (tutorialShouldStop) return;
  await board.caption('Moving through difficult terrain costs 2x speed', 2000);
  
  // clear the arrows
  board.clear(ClearType.POINT);
  
  // make the mech move into one of the difficult terrain hexes
  if (tutorialShouldStop) return;
  await board.move('mech', 1, 1);
  
  // CAPTION "With Speed 2 this mech can move through only 1 difficult terrain"
  if (tutorialShouldStop) return;
  await board.caption('With Speed 2 this mech can move through only 1 difficult terrain', 2000);
  
  // clear the highlights
  board.clear(ClearType.HIGHLIGHT);
  
  // CAPTION "Dangerous terrain does not slow you down ..."
  if (tutorialShouldStop) return;
  await board.caption('Dangerous terrain does not slow you down ...', 2000);
  
  // CAPTION "But may cause damage"
  if (tutorialShouldStop) return;
  await board.caption('But may cause damage', 2000);
  
  // highlight some hexes near the mech in red, point at them with label dangerous terrain
  board.highlight(2, 1, '#FF4444');
  board.highlight(1, 2, '#FF4444');
  board.highlight(0, 3, '#FF4444');
  board.point(2, 1, 'dangerous terrain');
  
  // Wait a moment to show the dangerous terrain
  if (tutorialShouldStop) return;
  await sleep(2000);
  
  // clear the arrows
  board.clear(ClearType.POINT);
  
  // move the mech into one of the dangerous hexes
  if (tutorialShouldStop) return;
  await board.move('mech', 2, 1);
  
  // CAPTION "When you move into dangerous terrain for the first time"
  if (tutorialShouldStop) return;
  await board.caption('When you move into dangerous terrain for the first time', 2000);
  
  // CAPTION "You must roll ENGINEERING, you get 5 damage if you fail"
  if (tutorialShouldStop) return;
  await board.caption('You must roll ENGINEERING, you get 5 damage if you fail', 2000);
  
  // CAPTION "The damage type depends on the terrain itself (up to GM)"
  if (tutorialShouldStop) return;
  await board.caption('The damage type depends on the terrain itself (up to GM)', 2000);
}

// Lancer Contrib Demo - Showcasing specialized Lancer methods
async function lancerContribDemo(): Promise<void> {
  board.resetBoard();
  
  // Initialize Lancer contrib classes
  const movement = new Lancer.LancerMovement(board);
  const combat = new Lancer.LancerCombat(board);
  
  if (tutorialShouldStop) return;
  await board.caption('Lancer Contrib Library Demo', 3000);
  if (tutorialShouldStop) return;
  await board.caption('Specialized methods for Lancer RPG mechanics', 3000);
  
  // Place a mech at the center
  board.token(0, 0, 'mech', 'circle', Lancer.Colors.BLUE, 'Atlas');
  
  // Demo 1: Movement Range Calculation
  if (tutorialShouldStop) return;
  await board.caption('Movement Range: Speed 4 Mech', 3000);
  movement.showMovementRange(0, 0, 4);
  await sleep(4000);
  
  board.clear(ClearType.PULSE);
  
  // Demo 2: Terrain Effects
  if (tutorialShouldStop) return;
  await board.caption('Terrain Types in Lancer', 3000);
  
  // Show difficult terrain
  const difficultTerrain = [
    { q: 2, r: 0 }, { q: 3, r: 0 }, { q: 1, r: 2 },
    { q: -2, r: 1 }, { q: -3, r: 2 }
  ];
  movement.showDifficultTerrain(difficultTerrain, '#8B4513');
  board.point(2, 0, 'Difficult Terrain');
  await sleep(3000);
  
  board.clear(ClearType.POINT);
  
  // Show dangerous terrain
  const dangerousTerrain = [
    { q: -1, r: -2 }, { q: 0, r: -3 }, { q: 2, r: -2 },
    { q: 3, r: -1 }, { q: 1, r: 3 }
  ];
  movement.showDangerousTerrain(dangerousTerrain);
  board.point(-1, -2, 'Dangerous Terrain');
  await sleep(3000);
  
  board.clear(ClearType.POINT);
  await board.caption('Difficult terrain costs 2x movement', 2500);
  await board.caption('Dangerous terrain causes damage', 2500);
  
  // Demo 3: Combat Mechanics
  if (tutorialShouldStop) return;
  await board.caption('Combat: Engagement Zone', 3000);
  board.clear(ClearType.HIGHLIGHT);
  
  // Show engagement zone
  combat.showEngagementZone(0, 0);
  await sleep(3000);
  
  // Add an enemy mech
  board.token(3, 1, 'enemy', 'triangle', Lancer.Colors.RED, 'Minotaur');
  await board.caption('Enemy mech enters the battlefield', 2500);
  
  // Demo 4: Weapon Range
  if (tutorialShouldStop) return;
  await board.caption('Weapon Range: Assault Rifle (Range 10)', 3000);
  board.clear(ClearType.BLINK);
  
  const weapon: Lancer.LancerWeapon = {
    name: 'Assault Rifle',
    type: 'main',
    range: 5,
    damage: '1d6+2',
    tags: ['Reliable 3']
  };
  
  combat.showWeaponRange(0, 0, weapon, 3, 1);
  await sleep(4000);
  
  // Demo 5: Line of Sight and Cover
  if (tutorialShouldStop) return;
  await board.caption('Cover Mechanics', 3000);
  board.clear(ClearType.PULSE);
  board.clear(ClearType.POINT);
  
  combat.showCoverPositions(0, 0, 3, 1);
  await sleep(4000);
  
  // Demo 6: Area of Effect Attack
  if (tutorialShouldStop) return;
  await board.caption('Blast Template: Burst 2 Explosion', 3000);
  board.clear(ClearType.HIGHLIGHT);
  board.clear(ClearType.POINT);
  
  combat.showBlastTemplate(2, 0, 2, Lancer.Colors.ORANGE);
  await sleep(4000);
  
  // Final demonstration - Complex scenario
  if (tutorialShouldStop) return;
  await board.caption('Complex Scenario: Multiple Mechs', 3000);
  board.clear(ClearType.BLINK);
  
  // Add more mechs
  board.token(-2, 2, 'ally1', 'circle', Lancer.Colors.GREEN, 'Blackbeard');
  board.token(1, -3, 'ally2', 'circle', Lancer.Colors.GREEN, 'Everest');
  
  // Show multiple engagement zones
  combat.showEngagementZone(-2, 2, Lancer.Colors.ENGAGEMENT_YELLOW);
  combat.showEngagementZone(1, -3, Lancer.Colors.ENGAGEMENT_YELLOW);
  
  await board.caption('Multiple engagement zones create tactical complexity', 3000);
  await sleep(3000);
  
  // Show combined movement and combat
  await board.caption('Movement + Combat: Positioning is key!', 3000);
  movement.showMovementRange(-2, 2, 3);
  await sleep(4000);
  
  await board.caption('Lancer Contrib Demo Complete!', 3000);
  await board.caption('Use these methods to create your own Lancer tutorials', 3000);
}

// Utility function for async delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

