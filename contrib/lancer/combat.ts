/**
 * Lancer combat mechanics for Boardcast
 */

import { BoardcastHexBoard } from '../../lib/BoardcastHexBoard.js';
import { Colors } from '../../lib/types.js';
import type { EngagementZone, LancerWeapon } from './types.js';

export class LancerCombat {
  constructor(private board: BoardcastHexBoard) {}

  /**
   * Show engagement zone around a mech (adjacent hexes)
   * @param centerQ - Mech's q coordinate
   * @param centerR - Mech's r coordinate
   * @param color - Color for engagement zone (default yellow)
   */
  showEngagementZone(centerQ: number, centerR: number, color: string = Colors.ENGAGEMENT_YELLOW): EngagementZone {
    const threatened: Array<{q: number, r: number}> = [
      { q: centerQ + 1, r: centerR },     // East
      { q: centerQ - 1, r: centerR },     // West
      { q: centerQ, r: centerR + 1 },     // Southeast
      { q: centerQ, r: centerR - 1 },     // Northwest
      { q: centerQ + 1, r: centerR - 1 }, // Northeast
      { q: centerQ - 1, r: centerR + 1 }  // Southwest
    ];

    threatened.forEach(hex => {
      this.board.blink(hex.q, hex.r, color);
    });

    return {
      center: { q: centerQ, r: centerR },
      threatened
    };
  }

  /**
   * Show weapon range and line of sight
   * @param originQ - Firing position q coordinate
   * @param originR - Firing position r coordinate
   * @param weapon - Weapon details
   * @param targetQ - Optional target q coordinate
   * @param targetR - Optional target r coordinate
   */
  showWeaponRange(
    originQ: number, 
    originR: number, 
    weapon: LancerWeapon,
    targetQ?: number,
    targetR?: number
  ): void {
    // Show weapon range
    const range = weapon.range;
    for (let q = -range; q <= range; q++) {
      for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
        if (distance <= range && (q !== 0 || r !== 0)) {
          this.board.pulse(originQ + q, originR + r, Colors.DARK_RED);
        }
      }
    }

    // Show line of sight to specific target
    if (targetQ !== undefined && targetR !== undefined) {
      this.board.point(targetQ, targetR, `${weapon.name} Target`);
    }
  }

  /**
   * Show cover positions relative to an attacker and target
   * @param attackerQ - Attacker's q coordinate
   * @param attackerR - Attacker's r coordinate
   * @param targetQ - Target's q coordinate
   * @param targetR - Target's r coordinate
   */
  showCoverPositions(attackerQ: number, attackerR: number, targetQ: number, targetR: number): void {
    // Simple cover calculation - hexes adjacent to target that break line of sight
    const coverHexes = [
      { q: targetQ + 1, r: targetR },
      { q: targetQ - 1, r: targetR },
      { q: targetQ, r: targetR + 1 },
      { q: targetQ, r: targetR - 1 },
      { q: targetQ + 1, r: targetR - 1 },
      { q: targetQ - 1, r: targetR + 1 }
    ];

    coverHexes.forEach(hex => {
      this.board.highlight(hex.q, hex.r, Colors.GRAY);
    });

    this.board.point(targetQ, targetR, 'Target');
    this.board.point(attackerQ, attackerR, 'Attacker');
  }

  /**
   * Show blast template (area of effect)
   * @param centerQ - Blast center q coordinate
   * @param centerR - Blast center r coordinate
   * @param size - Blast size (1 = burst 1, 2 = burst 2, etc.)
   * @param color - Blast color (default orange)
   */
  showBlastTemplate(centerQ: number, centerR: number, size: number, color: string = Colors.ORANGE): void {
    // Show center hex
    this.board.blink(centerQ, centerR, color);

    // Show surrounding hexes based on blast size
    for (let q = -size; q <= size; q++) {
      for (let r = Math.max(-size, -q - size); r <= Math.min(size, -q + size); r++) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
        if (distance <= size && (q !== 0 || r !== 0)) {
          this.board.blink(centerQ + q, centerR + r, color);
        }
      }
    }
  }
}