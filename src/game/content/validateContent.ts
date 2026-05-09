import type {
  ContentValidationIssue,
  EntityDefinition,
  LevelDefinition,
  SpriteAtlasDefinition
} from "./contentTypes";
import { ContentValidationError } from "./contentTypes";

const knownEntities = new Set(["PlayerSpawn", "Door", "EnemySpawn", "Pickup", "TriggerZone"]);
const knownEnemyTypes = new Set(["slime", "bat", "skeleton"]);
const knownPickupTypes = new Set(["coin", "heart", "key"]);
const knownEvents = new Set(["show_message", "start_encounter", "open_secret", "level_complete"]);
const requiredAnimationTags = ["idle_down", "walk_down"];

export function validateLevelDefinition(level: LevelDefinition): void {
  const issues: ContentValidationIssue[] = [];

  if (!level.id) issues.push(issue("Level is missing an identifier.", "level.id"));
  if (level.width <= 0 || level.height <= 0) issues.push(issue(`Level "${level.id}" has invalid dimensions.`));
  if (level.tileSize <= 0) issues.push(issue(`Level "${level.id}" has invalid tile size.`));
  if (level.collision.solids.length === 0) {
    issues.push(
      issue(
        `Level "${level.id}" is missing collision. Open LDtk, add the Collision layer, and mark walls/blockers.`
      )
    );
  }

  const playerSpawns = level.entities.filter((entity) => entity.kind === "PlayerSpawn");
  if (playerSpawns.length !== 1) {
    issues.push(
      issue(
        `Level "${level.id}" must contain exactly one PlayerSpawn; found ${playerSpawns.length}.`
      )
    );
  }

  const ids = new Map<string, EntityDefinition>();
  for (const entity of level.entities) {
    validateEntity(level, entity, issues);
    if (ids.has(entity.id)) {
      issues.push(issue(`Level "${level.id}" has duplicate entity id "${entity.id}".`, entity.id));
    }
    ids.set(entity.id, entity);
  }

  throwIfIssues("Content validation failed.", issues);
}

function validateEntity(level: LevelDefinition, entity: EntityDefinition, issues: ContentValidationIssue[]): void {
  if (!knownEntities.has(entity.kind)) {
    issues.push(issue(`Level "${level.id}" contains unknown entity type "${entity.kind}".`, entity.id));
  }
  if (!entity.id) issues.push(issue(`Entity "${entity.kind}" at x=${entity.x} y=${entity.y} is missing id.`));
  if (entity.width <= 0 || entity.height <= 0) {
    issues.push(issue(`Entity "${entity.id}" (${entity.kind}) must have rectangular bounds.`));
  }

  switch (entity.kind) {
    case "Door":
      if (!entity.targetLevel) {
        issues.push(
          issue(
            `Level "${level.id}" entity "Door" at x=${entity.x} y=${entity.y} is missing required field "targetLevel". Open LDtk, select the Door entity, and set targetLevel.`
          )
        );
      }
      if (!entity.targetDoor) {
        issues.push(issue(`Door "${entity.id}" is missing required field "targetDoor".`));
      }
      if (entity.locked && !entity.requiresKey) {
        issues.push(issue(`Door "${entity.id}" is locked but does not set "requiresKey".`));
      }
      break;
    case "EnemySpawn":
      if (!knownEnemyTypes.has(entity.enemyType)) {
        issues.push(issue(`Unknown enemyType: ${entity.enemyType}. Approved values: slime, bat, skeleton.`));
      }
      if (entity.patrolRadius < 0) issues.push(issue(`EnemySpawn "${entity.id}" patrolRadius must be >= 0.`));
      if (entity.count < 1 || entity.count > 10) {
        issues.push(issue(`EnemySpawn "${entity.id}" count must be between 1 and 10.`));
      }
      break;
    case "Pickup":
      if (!knownPickupTypes.has(entity.pickupType)) {
        issues.push(issue(`Unknown pickupType: ${entity.pickupType}. Approved values: coin, heart, key.`));
      }
      if (entity.amount <= 0) issues.push(issue(`Pickup "${entity.id}" amount must be positive.`));
      if (entity.pickupType === "key" && !entity.keyId) {
        issues.push(issue(`Pickup "${entity.id}" uses pickupType "key" and must set keyId.`));
      }
      break;
    case "TriggerZone":
      if (!knownEvents.has(entity.eventName)) {
        issues.push(
          issue(`TriggerZone "${entity.id}" eventName "${entity.eventName}" is not in the event allowlist.`)
        );
      }
      break;
    case "PlayerSpawn":
      break;
  }
}

export function validateSpriteAtlasDefinition(atlas: SpriteAtlasDefinition): void {
  const issues: ContentValidationIssue[] = [];
  if (!atlas.imagePath) issues.push(issue(`Sprite atlas "${atlas.id}" is missing an image path.`));
  if (atlas.frames.length === 0) issues.push(issue(`Sprite atlas "${atlas.id}" has no frames.`));

  for (const tagName of requiredAnimationTags) {
    if (!atlas.tags[tagName]) {
      issues.push(
        issue(`Sprite atlas "${atlas.id}" is missing animation tag "${tagName}". Add it in Aseprite and export again.`)
      );
    }
  }

  for (const tag of Object.values(atlas.tags)) {
    if (tag.from < 0 || tag.to < tag.from || tag.to >= atlas.frames.length) {
      issues.push(issue(`Sprite atlas "${atlas.id}" tag "${tag.name}" points outside the frame range.`));
    }
  }

  throwIfIssues("Sprite atlas validation failed.", issues);
}

function issue(message: string, path?: string): ContentValidationIssue {
  return { message, path };
}

function throwIfIssues(message: string, issues: ContentValidationIssue[]): void {
  if (issues.length > 0) {
    throw new ContentValidationError(message, issues);
  }
}
