/**
 * Boardcast Contrib Library
 * 
 * Game-specific extensions and utilities for the Boardcast hex board library.
 * Each game system is organized into its own module with specialized methods
 * for visualization and animation of game mechanics.
 */

// Game system modules
export * as Lancer from './lancer/index.js';

// Future game systems would be exported here:
// export * as DnD5e from './dnd5e/index.js';
// export * as Warhammer40k from './warhammer40k/index.js';
// export * as Battletech from './battletech/index.js';

// Common utilities and types used across game systems
export interface GameContribModule {
  name: string;
  version: string;
  description: string;
  author?: string;
  gameSystem: string;
}

export const AVAILABLE_GAMES = [
  'lancer'
  // Add future games here
] as const;

export type GameSystem = typeof AVAILABLE_GAMES[number];