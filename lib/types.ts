export interface HexCell {
  q: number; // axial coordinate
  r: number; // axial coordinate
  x: number; // screen x position
  y: number; // screen y position
  id: string;
  highlighted: boolean;
  highlightColor?: string;
  isBlinking: boolean;
  blinkColor?: string;
  blinkPhase: number;
  isPulsing: boolean;
  pulseColor?: string;
  pulsePhase: number;
  originalColor: string;
}

export interface GamePiece {
  id: string;
  tokenName?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  shape: 'circle' | 'rect' | 'triangle' | 'star';
  currentHex: { q: number; r: number };
  label?: string;
}

export interface GamePointer {
  id: string;
  targetQ: number;
  targetR: number;
  x: number; // arrow tip position
  y: number; // arrow tip position
  startX: number; // arrow start position
  startY: number; // arrow start position
  label?: string;
  color: string;
}

export interface GridConfig {
  gridRadius?: number;
  hexRadius?: number;
  width?: number;
  height?: number;
}