export type SpawnDirection = "left" | "right";
export type EnemyType = "slime" | "bat" | "skeleton";
export type PickupType = "coin" | "heart" | "key";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PhysicsBody extends Rect {
  velocityX: number;
  velocityY: number;
  grounded: boolean;
}

export interface TileInstance {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  tileId: number;
}

export interface TileLayerDefinition {
  id: string;
  tilesetPath: string;
  tiles: TileInstance[];
}

export interface CollisionDefinition {
  solids: Rect[];
  hazards: Rect[];
}

export interface LevelDefinition {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  tileLayers: TileLayerDefinition[];
  collision: CollisionDefinition;
  entities: EntityDefinition[];
}

export interface BaseEntityDefinition {
  id: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlayerSpawnDefinition extends BaseEntityDefinition {
  kind: "PlayerSpawn";
  spawnDirection: SpawnDirection;
}

export interface DoorDefinition extends BaseEntityDefinition {
  kind: "Door";
  targetLevel: string;
  targetDoor: string;
  locked: boolean;
  requiresKey: string | null;
}

export interface EnemySpawnDefinition extends BaseEntityDefinition {
  kind: "EnemySpawn";
  enemyType: EnemyType;
  patrolRadius: number;
  count: number;
  respawn: boolean;
}

export interface PickupDefinition extends BaseEntityDefinition {
  kind: "Pickup";
  pickupType: PickupType;
  amount: number;
  keyId: string | null;
}

export interface TriggerZoneDefinition extends BaseEntityDefinition {
  kind: "TriggerZone";
  eventName: string;
  once: boolean;
  payload: unknown;
}

export type EntityDefinition =
  | PlayerSpawnDefinition
  | DoorDefinition
  | EnemySpawnDefinition
  | PickupDefinition
  | TriggerZoneDefinition;

export interface SpriteFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  durationMs: number;
}

export interface AnimationTag {
  name: string;
  from: number;
  to: number;
  direction: "forward" | "reverse" | "pingpong";
}

export interface SpriteAtlasDefinition {
  id: string;
  imagePath: string;
  frames: SpriteFrame[];
  tags: Record<string, AnimationTag>;
}

export interface ContentValidationIssue {
  message: string;
  path?: string;
}

export class ContentValidationError extends Error {
  readonly issues: ContentValidationIssue[];

  constructor(message: string, issues: ContentValidationIssue[]) {
    super(message);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}
