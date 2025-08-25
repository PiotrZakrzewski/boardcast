/**
 * Lancer movement mechanics for Boardcast
 */

import { BoardcastHexBoard } from 'boardcast';
import { Colors } from 'boardcast';
import type { MovementRange } from './types.js';

export class LancerMovement {
  constructor(private board: BoardcastHexBoard) {}

  /**
   * Calculate movement range for a mech based on its speed
   * @param centerQ - Starting q coordinate
   * @param centerR - Starting r coordinate
   * @param speed - Mech's speed value
   * @returns Movement range with normal move and boost options
   */
  calculateMovementRange(centerQ: number, centerR: number, speed: number): MovementRange {
    const normalMove: Array<{q: number, r: number}> = [];
    const boost: Array<{q: number, r: number}> = [];

    // Calculate hexes within speed distance (normal move)
    for (let q = -speed; q <= speed; q++) {
      for (let r = Math.max(-speed, -q - speed); r <= Math.min(speed, -q + speed); r++) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
        if (distance <= speed && (q !== 0 || r !== 0)) {
          normalMove.push({ q: centerQ + q, r: centerR + r });
        }
      }
    }

    // Calculate boost range (speed * 2)
    const boostRange = speed * 2;
    for (let q = -boostRange; q <= boostRange; q++) {
      for (let r = Math.max(-boostRange, -q - boostRange); r <= Math.min(boostRange, -q + boostRange); r++) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
        if (distance <= boostRange && distance > speed && (q !== 0 || r !== 0)) {
          boost.push({ q: centerQ + q, r: centerR + r });
        }
      }
    }

    return { normalMove, boost };
  }

  /**
   * Show movement range with different colors for normal move vs boost
   * @param centerQ - Starting q coordinate
   * @param centerR - Starting r coordinate
   * @param speed - Mech's speed value
   */
  showMovementRange(centerQ: number, centerR: number, speed: number): void {
    const range = this.calculateMovementRange(centerQ, centerR, speed);
    
    // Show normal movement range
    range.normalMove.forEach(hex => {
      this.board.pulse(hex.q, hex.r, Colors.HIGHLIGHT_BLUE);
    });

    // Show boost range
    range.boost.forEach(hex => {
      this.board.pulse(hex.q, hex.r, Colors.YELLOW);
    });
  }

  /**
   * Apply difficult terrain movement penalties
   * @param hexes - Array of hex coordinates that are difficult terrain
   * @param color - Color to highlight difficult terrain (default brown)
   */
  showDifficultTerrain(hexes: Array<{q: number, r: number}>, color: string = '#8B4513'): void {
    hexes.forEach(hex => {
      this.board.highlight(hex.q, hex.r, color);
    });
  }

  /**
   * Apply dangerous terrain effects
   * @param hexes - Array of hex coordinates that are dangerous terrain
   * @param color - Color to highlight dangerous terrain (default red)
   */
  showDangerousTerrain(hexes: Array<{q: number, r: number}>, color: string = Colors.RED): void {
    hexes.forEach(hex => {
      this.board.highlight(hex.q, hex.r, color);
    });
  }
}