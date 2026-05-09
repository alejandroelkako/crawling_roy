import type { PickupDefinition, TriggerZoneDefinition } from "../content/contentTypes";
import type { GameEntity } from "./Player";

export function createPickup(definition: PickupDefinition): GameEntity {
  return {
    id: definition.id,
    label: `${definition.pickupType} x${definition.amount}`,
    x: definition.x,
    y: definition.y
  };
}

export function createTriggerZone(definition: TriggerZoneDefinition): GameEntity {
  return {
    id: definition.id,
    label: `Trigger ${definition.eventName}`,
    x: definition.x,
    y: definition.y
  };
}
