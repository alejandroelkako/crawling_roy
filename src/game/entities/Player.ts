import type { PlayerSpawnDefinition, Rect } from "../content/contentTypes";

export interface GameEntity {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface PlayerState extends Rect {
    velocityX: number;
    velocityY: number;
    grounded: boolean;
}

export function createPlayerSpawn(definition: PlayerSpawnDefinition): GameEntity {
  return {
    id: definition.id,
    label: `Player ${definition.spawnDirection}`,
    x: definition.x,
    y: definition.y
  };
}

export function createPlayer(definition: PlayerSpawnDefinition): PlayerState {
    return {
        x: definition.x,
        y: definition.y,
        width: definition.width,
        height: definition.height,
        velocityX: 0,
        velocityY: 0,
        grounded: false
    };
}
