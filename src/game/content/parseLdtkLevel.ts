import type {
  CollisionDefinition,
  EnemyType,
  EntityDefinition,
  LevelDefinition,
  PickupType,
  Rect,
  SpawnDirection,
  TileLayerDefinition
} from "./contentTypes";
import { readBoolean, readNullableString, readNumber, readString } from "../ldtk/ldtkFieldReaders";
import type { LdtkEntityInstance, LdtkLayerInstance, LdtkLevel, LdtkWorld } from "../ldtk/ldtkTypes";
import { validateLevelDefinition } from "./validateContent";

const ENTITY_LAYER = "Entities";
const TRIGGER_LAYER = "Triggers";
const TILE_LAYER = "Tiles";
const COLLISION_LAYER = "Collision";

export function parseLdtkLevel(world: LdtkWorld, levelId: string): LevelDefinition {
  const level = world.levels.find((entry) => entry.identifier === levelId);
  if (!level) {
    throw new Error(`LDtk level "${levelId}" was not found in exported world JSON.`);
  }

  const layerInstances = level.layerInstances ?? [];
  const tileSize = findTileSize(world, layerInstances);
  const tileLayers = parseTileLayers(layerInstances);
  const collision = parseCollision(layerInstances, level, tileSize);
  const entities = parseEntities(layerInstances);
  const definition: LevelDefinition = {
    id: level.identifier,
    width: level.pxWid,
    height: level.pxHei,
    tileSize,
    tileLayers,
    collision,
    entities
  };

  validateLevelDefinition(definition);
  return definition;
}

function findTileSize(world: LdtkWorld, layers: LdtkLayerInstance[]): number {
  return layers[0]?.__gridSize ?? world.defaultGridSize ?? 16;
}

function parseTileLayers(layers: LdtkLayerInstance[]): TileLayerDefinition[] {
  return layers
    .filter((layer) => layer.__identifier === TILE_LAYER || layer.__type === "Tiles" || layer.__type === "AutoLayer")
    .map((layer) => {
      const sourceTiles = [...(layer.gridTiles ?? []), ...(layer.autoLayerTiles ?? [])];
      return {
        id: layer.__identifier,
        tilesetPath: layer.__tilesetRelPath ?? "",
        tiles: sourceTiles.map((tile) => ({
          x: tile.px[0],
          y: tile.px[1],
          tileX: tile.src[0],
          tileY: tile.src[1],
          tileId: tile.t
        }))
      };
    });
}

function parseCollision(layers: LdtkLayerInstance[], level: LdtkLevel, tileSize: number): CollisionDefinition {
  const layer = layers.find((entry) => entry.__identifier === COLLISION_LAYER);
  if (!layer) {
    return { solids: [], hazards: [] };
  }

  if (layer.__type === "IntGrid" && layer.intGridCsv) {
    const widthInCells = Math.ceil(level.pxWid / layer.__gridSize);
    return layer.intGridCsv.reduce<CollisionDefinition>(
      (collision, value, index) => {
        if (value === 0) return collision;
        const rect = {
          x: (index % widthInCells) * layer.__gridSize,
          y: Math.floor(index / widthInCells) * layer.__gridSize,
          width: layer.__gridSize,
          height: layer.__gridSize
        };
        if (value === 1) collision.solids.push(rect);
        if (value === 2 || value === 3) collision.hazards.push(rect);
        return collision;
      },
      { solids: [], hazards: [] }
    );
  }

  const collisionTiles = [...(layer.gridTiles ?? []), ...(layer.autoLayerTiles ?? [])];
  return {
    solids: collisionTiles.map((tile) => ({
      x: tile.px[0],
      y: tile.px[1],
      width: tileSize,
      height: tileSize
    })),
    hazards: []
  };
}

function parseEntities(layers: LdtkLayerInstance[]): EntityDefinition[] {
  const entityLayers = layers.filter(
    (layer) => layer.__identifier === ENTITY_LAYER || layer.__identifier === TRIGGER_LAYER
  );
  return entityLayers.flatMap((layer) => (layer.entityInstances ?? []).map(parseEntity));
}

function parseEntity(entity: LdtkEntityInstance): EntityDefinition {
  const base = {
    id: readString(entity, "id", entity.__identifier === "PlayerSpawn" ? "player-start" : entity.iid),
    x: entity.px[0],
    y: entity.px[1],
    width: entity.width,
    height: entity.height
  };

  switch (entity.__identifier) {
    case "PlayerSpawn":
      return {
        ...base,
        kind: "PlayerSpawn",
        spawnDirection: readEnum<SpawnDirection>(entity, "spawnDirection", ["left", "right"], "right")
      };
    case "Door":
      return {
        ...base,
        kind: "Door",
        targetLevel: readString(entity, "targetLevel"),
        targetDoor: readString(entity, "targetDoor"),
        locked: readBoolean(entity, "locked"),
        requiresKey: readNullableString(entity, "requiresKey")
      };
    case "EnemySpawn":
      return {
        ...base,
        kind: "EnemySpawn",
        enemyType: readEnum<EnemyType>(entity, "enemyType", ["slime", "bat", "skeleton"]),
        patrolRadius: readNumber(entity, "patrolRadius", 0),
        count: readNumber(entity, "count", 1),
        respawn: readBoolean(entity, "respawn")
      };
    case "Pickup":
      return {
        ...base,
        kind: "Pickup",
        pickupType: readEnum<PickupType>(entity, "pickupType", ["coin", "heart", "key"]),
        amount: readNumber(entity, "amount", 1),
        keyId: readNullableString(entity, "keyId")
      };
    case "TriggerZone":
      return {
        ...base,
        kind: "TriggerZone",
        eventName: readString(entity, "eventName"),
        once: readBoolean(entity, "once", true),
        payload: parsePayload(entity, readString(entity, "payload", ""))
      };
    default:
      throw new Error(
        `Unknown LDtk entity type "${entity.__identifier}" at x=${entity.px[0]} y=${entity.px[1]}. Add it to the entity contract and registry before using it.`
      );
  }
}

function readEnum<T extends string>(
  entity: LdtkEntityInstance,
  fieldName: string,
  allowed: readonly T[],
  fallback?: T
): T {
  const value = readString(entity, fieldName, fallback);
  if (!allowed.includes(value as T)) {
    throw new Error(
      `Level entity "${entity.__identifier}" at x=${entity.px[0]} y=${entity.px[1]} has invalid "${fieldName}" value "${value}". Allowed values: ${allowed.join(", ")}.`
    );
  }
  return value as T;
}

function parsePayload(entity: LdtkEntityInstance, payload: string): unknown {
  if (payload.trim() === "") return {};
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error(
      `Level entity "TriggerZone" at x=${entity.px[0]} y=${entity.px[1]} has invalid JSON in field "payload".`
    );
  }
}
