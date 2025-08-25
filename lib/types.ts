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

export interface GameCaption {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  visible: boolean;
  position: 'center' | 'bottom';
}

export enum ClearType {
  ALL = 'ALL',
  HIGHLIGHT = 'HIGHLIGHT',
  BLINK = 'BLINK',
  PULSE = 'PULSE',
  POINT = 'POINT',
  TOKEN = 'TOKEN',
  CAPTION = 'CAPTION'
}

export const Colors = {
  // Basic colors
  RED: '#FF4444',
  DARK_RED: '#CC3333',
  GREEN: '#44FF44',
  DARK_GREEN: '#33CC33',
  BLUE: '#4444FF',
  DARK_BLUE: '#3333CC',
  YELLOW: '#FFFF44',
  DARK_YELLOW: '#CCCC33',
  ORANGE: '#FFA500',
  DARK_ORANGE: '#CC8400',
  PURPLE: '#FF44FF',
  DARK_PURPLE: '#CC33CC',
  CYAN: '#44FFFF',
  DARK_CYAN: '#33CCCC',
  
  // Grays
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#CCCCCC',
  GRAY: '#888888',
  DARK_GRAY: '#666666',
  BLACK: '#000000',
  
  // Special colors
  DEFAULT_HEX: '#2a2a2a',
  HIGHLIGHT_BLUE: '#4FC3F7',
  ENGAGEMENT_YELLOW: '#FFFF00'
} as const;

export const Coords = {
  // Common hex positions
  CENTER: [0, 0] as const,
  NORTH: [0, -1] as const,
  NORTHEAST: [1, -1] as const,
  SOUTHEAST: [1, 0] as const,
  SOUTH: [0, 1] as const,
  SOUTHWEST: [-1, 1] as const,
  NORTHWEST: [-1, 0] as const,
  
  // Ring 2 positions
  NORTH_2: [0, -2] as const,
  NORTHEAST_2: [1, -2] as const,
  EAST_2: [2, -1] as const,
  SOUTHEAST_2: [2, 0] as const,
  SOUTH_2: [0, 2] as const,
  SOUTHWEST_2: [-1, 2] as const,
  WEST_2: [-2, 1] as const,
  NORTHWEST_2: [-2, 0] as const
} as const;

export interface GridConfig {
  gridRadius?: number;
  hexRadius?: number;
  width?: number;
  height?: number;
  onGridExpansion?: (oldRadius: number, newRadius: number, coordinates: Array<{q: number, r: number}>) => void;
}