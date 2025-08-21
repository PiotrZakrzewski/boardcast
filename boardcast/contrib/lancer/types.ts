/**
 * Lancer-specific types for contrib module
 */

export interface LancerMech {
  id: string;
  name: string;
  speed: number;
  size: number;
  hull: number;
  agility: number;
  systems: number;
  engineering: number;
}

export interface LancerWeapon {
  name: string;
  type: 'main' | 'heavy' | 'aux' | 'superheavy';
  range: number;
  damage: string;
  tags: string[];
}

export interface LancerTerrain {
  type: 'difficult' | 'dangerous' | 'impassable' | 'cover';
  color: string;
  description: string;
}

export interface MovementRange {
  normalMove: Array<{q: number, r: number}>;
  boost: Array<{q: number, r: number}>;
}

export interface EngagementZone {
  center: {q: number, r: number};
  threatened: Array<{q: number, r: number}>;
}