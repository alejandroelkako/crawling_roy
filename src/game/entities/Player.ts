import type { PlayerSpawnDefinition } from "../content/contentTypes";

export interface GameEntity {
  id: string;
  label: string;
  x: number;
  y: number;
}

export function createPlayerSpawn(definition: PlayerSpawnDefinition): GameEntity {
  return {
    id: definition.id,
    label: `Player ${definition.facing}`,
    x: definition.x,
    y: definition.y
  };
}
