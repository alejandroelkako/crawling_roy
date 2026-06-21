import type { Rect, EnemySpawnDefinition } from "../content/contentTypes";
import type { GameEntity } from "./Player";

export interface SlimeState extends Rect {
    id: string;
    type: "slime";
    homeX: number;
    homeY: number;
    velocityX: number;
    velocityY: number;
    grounded: boolean;
    direction: -1 | 1;
    patrolRadius: number;
}

export function createSlimes(spawn: EnemySpawnDefinition): SlimeState[] {
    let slimes: SlimeState[] = [];
    for (let i = 0; i < spawn.count; i++) {
        slimes.push({
            x: spawn.x,
            y: spawn.y,
            width: spawn.width,
            height: spawn.height,
            id: `${spawn.id}-${i}`,
            type: "slime",
            homeX: spawn.x,
            homeY: spawn.y,
            velocityX: 0,
            velocityY: 0,
            grounded: false,
            direction: Math.round(Math.random()) === 1 ? 1 : -1,
            patrolRadius: spawn.patrolRadius
        });
    }
    return slimes;
}


export function createEnemySpawn(definition: EnemySpawnDefinition): GameEntity {
  return {
    id: definition.id,
    label: `${definition.count} ${definition.enemyType}`,
    x: definition.x,
    y: definition.y
  };
}
