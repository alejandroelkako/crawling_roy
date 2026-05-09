import type { EnemySpawnDefinition } from "../content/contentTypes";
import type { GameEntity } from "./Player";

export function createEnemySpawn(definition: EnemySpawnDefinition): GameEntity {
  return {
    id: definition.id,
    label: `${definition.count} ${definition.enemyType}`,
    x: definition.x,
    y: definition.y
  };
}
