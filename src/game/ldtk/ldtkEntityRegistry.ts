import type { EntityDefinition } from "../content/contentTypes";
import { createDoor } from "../entities/Door";
import { createEnemySpawn } from "../entities/EnemySpawn";
import { createPlayerSpawn, type GameEntity } from "../entities/Player";
import { createPickup, createTriggerZone } from "../entities/TriggerZone";

export type EntityFactory<T extends EntityDefinition = EntityDefinition> = (definition: T) => GameEntity;

export const ldtkEntityRegistry = {
  PlayerSpawn: createPlayerSpawn,
  Door: createDoor,
  EnemySpawn: createEnemySpawn,
  Pickup: createPickup,
  TriggerZone: createTriggerZone
} satisfies {
  [Kind in EntityDefinition["kind"]]: EntityFactory<Extract<EntityDefinition, { kind: Kind }>>;
};

export function createRuntimeEntity(definition: EntityDefinition): GameEntity {
  return ldtkEntityRegistry[definition.kind](definition as never);
}
