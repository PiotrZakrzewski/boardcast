/**
 * Lancer game system contrib module for Boardcast
 * 
 * This module provides Lancer-specific visualization and animation methods
 * that extend the core Boardcast functionality.
 */

export { LancerMovement } from './movement.js';
export { LancerCombat } from './combat.js';
export type {
  LancerMech,
  LancerWeapon,
  LancerTerrain,
  MovementRange,
  EngagementZone
} from './types.js';

// Re-export commonly used types from core library for convenience
export { Colors, ClearType } from 'boardcast';
export { BoardcastHexBoard } from 'boardcast';