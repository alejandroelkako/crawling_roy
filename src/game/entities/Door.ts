import type { DoorDefinition } from "../content/contentTypes";
import type { GameEntity } from "./Player";

export function createDoor(definition: DoorDefinition): GameEntity {
  return {
    id: definition.id,
    label: `Door -> ${definition.targetLevel}:${definition.targetDoor}`,
    x: definition.x,
    y: definition.y
  };
}
