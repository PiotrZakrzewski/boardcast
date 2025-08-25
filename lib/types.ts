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

export interface GameDice {
  id: string;
  dieType: 'd6' | 'd20';
  displayedNumber: number;
  visible: boolean;
  color?: string;
}

export enum ClearType {
  ALL = 'ALL',
  HIGHLIGHT = 'HIGHLIGHT',
  BLINK = 'BLINK',
  PULSE = 'PULSE',
  POINT = 'POINT',
  TOKEN = 'TOKEN',
  CAPTION = 'CAPTION',
  DICE = 'DICE'
}

export const Colors = {
  // Primary palette - optimized for dark backgrounds
  BLUE: '#4FC3F7',           // Bright cyan-blue (primary highlight)
  RED: '#FF6B6B',            // Soft red (danger/enemy)
  GREEN: '#4CAF50',          // Material green (ally/success)
  YELLOW: '#FFD54F',         // Warm yellow (attention/movement)
  PURPLE: '#BA68C8',         // Light purple (special effects)
  ORANGE: '#FF9800',         // Bright orange (warning/boss)
  CYAN: '#4DD0E1',           // Light cyan (water/ice)
  PINK: '#F48FB1',           // Light pink (charm/healing)
  
  // Secondary palette - darker variants
  DARK_BLUE: '#1976D2',      // Darker blue
  DARK_RED: '#D32F2F',       // Darker red
  DARK_GREEN: '#388E3C',     // Darker green
  DARK_YELLOW: '#F57C00',    // Darker yellow/amber
  DARK_PURPLE: '#7B1FA2',    // Darker purple
  DARK_ORANGE: '#E65100',    // Darker orange
  DARK_CYAN: '#00838F',      // Darker cyan
  DARK_PINK: '#C2185B',      // Darker pink
  
  // Grays - neutral colors
  WHITE: '#FFFFFF',          // Pure white (contrast text)
  LIGHT_GRAY: '#BDBDBD',     // Light gray (disabled/secondary)
  GRAY: '#757575',           // Medium gray (borders/lines)
  DARK_GRAY: '#424242',      // Dark gray (backgrounds)
  BLACK: '#000000',          // Pure black
  
  // Special game colors - semantic meanings
  ALLY: '#4CAF50',           // Green for allies/friendly
  ENEMY: '#FF6B6B',          // Red for enemies/hostile
  NEUTRAL: '#FFD54F',        // Yellow for neutral/movement
  HIGHLIGHT: '#4FC3F7',      // Blue for highlights/selection
  DANGER: '#FF5722',         // Orange-red for dangerous terrain
  DIFFICULT: '#8D6E63',      // Brown for difficult terrain
  ENGAGEMENT: '#FFEB3B',     // Bright yellow for engagement zones
  
  // Legacy colors (maintained for compatibility)
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