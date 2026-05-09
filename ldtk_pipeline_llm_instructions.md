# LLM Implementation Instructions: Browser 2D Dungeon Crawler Content Pipeline with LDtk

You are an implementation LLM working inside an existing or new browser-based 2D dungeon crawler project.

Your job is to create the initial plumbing, code, configuration, validation, and documentation needed so that:

- Programmers can load LDtk levels and Aseprite-exported sprites in the browser.
- A level designer can create and edit levels in LDtk without touching source code.
- An artist can create and export sprites from Aseprite without touching source code.
- The project has clear docs explaining how humans should work with the content pipeline.

Use **LDtk** for level design. Do **not** use Tiled.

The output of your work should be actual code, config files, sample assets/placeholders, and documentation. This document is not asking you to design the game itself. It is asking you to set up the pipeline and initial conventions.

---

## 1. Assumptions

Assume the project is a browser game using:

- TypeScript
- Vite
- A simple canvas renderer, Phaser, PixiJS, or another browser-friendly 2D runtime

If the project already has a chosen renderer or engine, integrate with it.

If no renderer exists yet, create a minimal TypeScript + Vite scaffold with a canvas-based placeholder renderer. Keep the architecture engine-agnostic where reasonable.

Do not overbuild gameplay systems. Create enough plumbing to prove that LDtk levels, entities, collisions, and sprite metadata can be loaded and validated.

---

## 2. High-Level Goal

Create a clean content pipeline where:

```txt
LDtk project files       -> exported LDtk JSON     -> validated level data     -> game runtime
Aseprite source files    -> PNG + JSON exports     -> validated sprite data    -> animation system
Human-authored docs      -> clear workflow         -> designer/artist/programmer collaboration
```

The level designer should own LDtk files.

The artist should own Aseprite source files and exported sprite sheets.

The programmer should own schemas, runtime loaders, validation, and gameplay behavior.

---

## 3. Required Deliverables

Create or update the project with the following categories of deliverables.

### 3.1 Code

Add TypeScript code for:

- LDtk JSON loading
- LDtk world/level parsing
- LDtk entity parsing
- LDtk tile layer parsing
- LDtk collision layer parsing
- Entity field validation
- Sprite atlas JSON loading
- Animation tag parsing
- A small runtime registry that maps LDtk entity identifiers to game constructors or handlers
- A minimal demo that loads one sample LDtk level and renders/debug-displays:
  - Tile layers
  - Collision rectangles or collision tiles
  - Entity spawn points
  - Player spawn
  - Door/transition markers
  - Trigger zones

### 3.2 Config

Add or update config for:

- Vite static asset loading
- TypeScript path aliases if useful
- Asset folders
- Git LFS patterns for binary or large art assets
- Scripts for validation and development

### 3.3 Validation

Add validation for content files.

Use one of:

- Zod
- Valibot
- JSON Schema with Ajv
- A lightweight custom validator if the project avoids dependencies

Validation must catch:

- Missing required LDtk entity fields
- Unknown entity types
- Invalid enum values
- Invalid numeric ranges
- Missing sprite animation tags
- Missing asset paths
- Duplicate entity IDs where uniqueness is expected
- Missing player spawn
- Doors without destination metadata
- Collision layers missing from playable levels

Validation should run both:

- At development/runtime load time
- Through an npm script such as `npm run validate:content`

### 3.4 Documentation

Create human-facing documentation:

- `README.md`
- `docs/content-pipeline.md`
- `docs/level-design.md`
- `docs/art-pipeline.md`
- `docs/entity-contract.md`
- `docs/troubleshooting.md`

These docs should be practical, not theoretical.

They should explain what designers and artists actually do day to day.

---

## 4. Recommended Project Structure

Create or adapt the project toward this structure:

```txt
project-root/
  README.md
  package.json
  tsconfig.json
  vite.config.ts

  public/
    assets/
      exported/
        levels/
          dungeon.ldtk.json
        sprites/
          hero.png
          hero.json
          enemies.png
          enemies.json

  assets/
    source/
      levels/
        dungeon.ldtk
      sprites/
        hero.aseprite
        enemies.aseprite

  src/
    main.ts
    game/
      Game.ts
      renderer/
        CanvasRenderer.ts
      content/
        loadLdtkWorld.ts
        parseLdtkLevel.ts
        loadSpriteAtlas.ts
        validateContent.ts
        contentTypes.ts
      ldtk/
        ldtkTypes.ts
        ldtkEntityRegistry.ts
        ldtkFieldReaders.ts
      animation/
        AnimationAtlas.ts
        AnimationPlayer.ts
      debug/
        DebugDraw.ts
      entities/
        Player.ts
        Door.ts
        EnemySpawn.ts
        TriggerZone.ts

  scripts/
    validate-content.ts
    export-aseprite.ts

  docs/
    content-pipeline.md
    level-design.md
    art-pipeline.md
    entity-contract.md
    troubleshooting.md
```

If the existing project has a different structure, preserve it where reasonable, but still create equivalent separation between:

- Source assets
- Exported runtime assets
- Runtime code
- Validation code
- Human docs

---

## 5. LDtk Setup Requirements

Create a sample LDtk project or a documented expected LDtk setup.

The LDtk project should include:

### 5.1 Layers

Require these LDtk layers:

```txt
Tiles
Collision
Entities
Triggers
```

Recommended meaning:

- `Tiles`: visual tile layers
- `Collision`: int grid, tile layer, or entity rectangles used for blocking movement
- `Entities`: gameplay entities such as player spawn, enemy spawns, doors, pickups
- `Triggers`: non-solid rectangular zones that cause events

If using LDtk IntGrid for collision, document the integer values clearly.

Example:

```txt
0 = empty
1 = solid wall
2 = pit
3 = water
```

### 5.2 Required Entity Definitions

Create or document these initial LDtk entity definitions:

#### `PlayerSpawn`

Fields:

```txt
id: string
facing: enum("up", "down", "left", "right")
```

Rules:

- Every playable level must have exactly one `PlayerSpawn`.
- `id` defaults to `"player-start"` if not supplied.

#### `Door`

Fields:

```txt
id: string
targetLevel: string
targetDoor: string
locked: boolean
requiresKey: string | null
```

Rules:

- `id`, `targetLevel`, and `targetDoor` are required.
- `requiresKey` is only meaningful when `locked` is true.
- Doors must have rectangular bounds.

#### `EnemySpawn`

Fields:

```txt
id: string
enemyType: enum("slime", "bat", "skeleton")
patrolRadius: number
count: number
respawn: boolean
```

Rules:

- `enemyType` must map to a known enemy type in code.
- `patrolRadius` must be >= 0.
- `count` must be between 1 and 10.

#### `Pickup`

Fields:

```txt
id: string
pickupType: enum("coin", "heart", "key")
amount: number
keyId: string | null
```

Rules:

- `amount` must be positive.
- `keyId` is required when `pickupType` is `"key"`.

#### `TriggerZone`

Fields:

```txt
id: string
eventName: string
once: boolean
payload: string
```

Rules:

- `eventName` must be a known event name or pass a configurable allowlist.
- `payload` should be valid JSON if not empty.

---

## 6. TypeScript Types

Create clear runtime-facing types.

Example shape:

```ts
export type Direction = "up" | "down" | "left" | "right";

export interface LevelDefinition {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  tileLayers: TileLayerDefinition[];
  collision: CollisionDefinition;
  entities: EntityDefinition[];
}

export interface TileLayerDefinition {
  id: string;
  tilesetPath: string;
  tiles: TileInstance[];
}

export interface TileInstance {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  tileId: number;
}

export interface CollisionDefinition {
  solids: Rect[];
  hazards: Rect[];
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type EntityDefinition =
  | PlayerSpawnDefinition
  | DoorDefinition
  | EnemySpawnDefinition
  | PickupDefinition
  | TriggerZoneDefinition;

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
  facing: Direction;
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
  enemyType: "slime" | "bat" | "skeleton";
  patrolRadius: number;
  count: number;
  respawn: boolean;
}

export interface PickupDefinition extends BaseEntityDefinition {
  kind: "Pickup";
  pickupType: "coin" | "heart" | "key";
  amount: number;
  keyId: string | null;
}

export interface TriggerZoneDefinition extends BaseEntityDefinition {
  kind: "TriggerZone";
  eventName: string;
  once: boolean;
  payload: unknown;
}
```

Adjust these to match the project style, but keep the same core contract.

---

## 7. LDtk Loader Requirements

Implement an LDtk loader that:

1. Fetches exported LDtk JSON from `public/assets/exported/levels`.
2. Parses the world and levels.
3. Finds the requested level by identifier.
4. Extracts:
   - Level dimensions
   - Grid size / tile size
   - Tile layers
   - Collision layer
   - Entity layer
   - Trigger layer
5. Converts LDtk coordinates into game-world coordinates.
6. Converts LDtk fields into strongly typed game data.
7. Validates the resulting level definition.
8. Returns a clean `LevelDefinition`, not raw LDtk JSON.

Do not let gameplay code depend directly on raw LDtk JSON structures.

Raw LDtk parsing should be isolated to the content layer.

---

## 8. Entity Registry Requirements

Create an entity registry so the runtime can map level data to behavior.

Example:

```ts
type EntityFactory = (definition: EntityDefinition, context: GameContext) => GameEntity;

export const ldtkEntityRegistry = {
  PlayerSpawn: createPlayerSpawn,
  Door: createDoor,
  EnemySpawn: createEnemySpawn,
  Pickup: createPickup,
  TriggerZone: createTriggerZone,
} satisfies Record<EntityDefinition["kind"], EntityFactory>;
```

Rules:

- Unknown entity kinds should fail validation.
- Designers may place only approved entity kinds.
- New entity types require both:
  - An LDtk entity definition update
  - A TypeScript registry update
  - An entity contract doc update

---

## 9. Aseprite Pipeline Requirements

Set up an artist-friendly Aseprite pipeline.

### 9.1 Source and Exported Assets

Use this convention:

```txt
assets/source/sprites/*.aseprite
public/assets/exported/sprites/*.png
public/assets/exported/sprites/*.json
```

The game must load only the exported PNG and JSON files.

Do not load `.aseprite` source files in the browser.

### 9.2 Animation Tags

Require artists to use Aseprite tags for animations.

Suggested tags:

```txt
idle_down
idle_up
idle_left
idle_right
walk_down
walk_up
walk_left
walk_right
attack_down
attack_up
attack_left
attack_right
hurt
death
```

The sprite loader should read animation tags from Aseprite-exported JSON and expose them by name.

### 9.3 Sprite Rules

Document these rules:

- Use a consistent canvas size per character family.
- Keep character feet aligned to the same baseline.
- Use consistent origin/pivot expectations.
- Avoid changing frame dimensions after animations are implemented.
- Use transparent backgrounds.
- Name tags consistently.
- Do not rename animation tags without updating code references.

### 9.4 Optional Export Script

If the environment has Aseprite CLI available, create a script such as:

```bash
npm run export:art
```

The script should export `.aseprite` files into PNG and JSON.

If Aseprite CLI is not available, create the script as a documented placeholder and explain manual export steps.

---

## 10. NPM Scripts

Add or update scripts similar to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "validate:content": "tsx scripts/validate-content.ts",
    "export:art": "tsx scripts/export-aseprite.ts",
    "check": "npm run validate:content && npm run build"
  }
}
```

Use the project’s actual package manager and conventions.

If the project uses pnpm, yarn, or bun, adapt commands accordingly.

---

## 11. Git LFS Requirements

Add `.gitattributes` entries for binary art files and large asset formats.

Suggested:

```gitattributes
*.aseprite filter=lfs diff=lfs merge=lfs -text
*.ase filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.kra filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text
```

Do not automatically put every JSON file in LFS. LDtk JSON and sprite JSON should usually remain normal text files unless they become huge.

---

## 12. README Requirements

Create or update `README.md` with:

1. Project overview
2. Prerequisites
3. Setup instructions
4. Development commands
5. Content pipeline summary
6. Folder structure
7. How to load the sample level
8. Links to docs:
   - `docs/content-pipeline.md`
   - `docs/level-design.md`
   - `docs/art-pipeline.md`
   - `docs/entity-contract.md`
   - `docs/troubleshooting.md`

Keep the README concise. Put detailed workflow instructions in `docs/`.

---

## 13. `docs/content-pipeline.md` Requirements

Explain the full pipeline:

```txt
Designer edits LDtk -> exports JSON -> programmer loader validates -> game uses clean LevelDefinition
Artist edits Aseprite -> exports PNG/JSON -> sprite loader validates -> game uses AnimationAtlas
```

Include:

- Who owns which files
- What files are source assets
- What files are runtime exports
- What the game actually loads
- How validation works
- What to do when validation fails
- How to add a new level
- How to add a new sprite sheet
- How to add a new entity type

---

## 14. `docs/level-design.md` Requirements

Write this for the level designer.

Include:

- How to open the LDtk project
- Required layers
- Naming conventions
- Grid size and tile size expectations
- How to place a player spawn
- How to place doors
- How to place enemy spawns
- How to place pickups
- How to place trigger zones
- How to define collision
- How to export levels
- Common mistakes
- Checklist before handing a level to the programmer

Include a checklist like:

```md
## Level Designer Checklist

- [ ] The level has exactly one `PlayerSpawn`.
- [ ] All doors have `targetLevel` and `targetDoor`.
- [ ] Collision exists on all walls and blockers.
- [ ] Enemy spawns use approved `enemyType` values.
- [ ] Trigger payloads are valid JSON or empty.
- [ ] The level passes `npm run validate:content`.
```

---

## 15. `docs/art-pipeline.md` Requirements

Write this for the artist.

Include:

- How to organize `.aseprite` files
- How to export PNG/JSON
- Required animation tag naming
- Sprite size conventions
- Origin/pivot/baseline conventions
- How to add a new character or enemy
- How to update an existing sprite safely
- How to avoid breaking animation code
- Manual export steps
- CLI export steps if supported
- Checklist before handing art to the programmer

Include a checklist like:

```md
## Artist Checklist

- [ ] Source `.aseprite` file is saved in `assets/source/sprites`.
- [ ] PNG export is saved in `public/assets/exported/sprites`.
- [ ] JSON export is saved next to the PNG.
- [ ] Animation tags use approved names.
- [ ] Frame dimensions are consistent.
- [ ] Character feet align to the expected baseline.
- [ ] Transparent background is used.
- [ ] The game loads the sprite without validation errors.
```

---

## 16. `docs/entity-contract.md` Requirements

This is the most important collaboration doc.

Write this as a contract between LDtk and code.

For each entity, document:

- Entity name in LDtk
- Purpose
- Required fields
- Optional fields
- Valid values
- Defaults
- Example usage
- Runtime behavior
- Validation rules

Include entities:

- `PlayerSpawn`
- `Door`
- `EnemySpawn`
- `Pickup`
- `TriggerZone`

Also include a section:

```md
## How to Add a New Entity Type

1. Add the entity definition in LDtk.
2. Add TypeScript type.
3. Add validator.
4. Add entity factory or handler.
5. Add docs to this file.
6. Add a sample to the test level.
7. Run `npm run validate:content`.
```

---

## 17. `docs/troubleshooting.md` Requirements

Include common failures and fixes.

Examples:

```md
## `Missing PlayerSpawn`

Every playable LDtk level must contain exactly one `PlayerSpawn`.

Fix:
Open the level in LDtk, select the `Entities` layer, and place a `PlayerSpawn`.
```

```md
## `Unknown enemyType: goblin`

The level contains an enemy type that code does not know about.

Fix:
Either change the LDtk `enemyType` to an approved value, or ask the programmer to add support for `goblin`.
```

```md
## Sprite animation tag not found

The code requested an animation such as `walk_down`, but the exported Aseprite JSON does not contain that tag.

Fix:
Open the `.aseprite` file, add or rename the tag, export again, and rerun validation.
```

---

## 18. Runtime Demo Requirements

Create a minimal demo that:

1. Loads the sample LDtk JSON.
2. Validates it.
3. Renders a simple representation of the level.
4. Draws collision bounds in debug mode.
5. Draws entity markers and labels in debug mode.
6. Shows a visible error overlay if content validation fails.

The demo does not need full gameplay.

The goal is to prove the content pipeline works.

---

## 19. Error Handling Requirements

Content errors should be human-readable.

Bad:

```txt
Cannot read property 'value' of undefined
```

Good:

```txt
Level "Dungeon_01" entity "Door" at x=320 y=128 is missing required field "targetLevel".
Open LDtk, select the Door entity, and set targetLevel.
```

Include enough context for designers and artists to fix their own mistakes.

---

## 20. Hot Reload Requirements

In development mode, support fast iteration where reasonable.

At minimum:

- Vite reloads when exported JSON or PNG files change.
- Validation runs when content loads.
- Errors appear in the browser console or visible debug overlay.

Optional but preferred:

- Preserve camera/player position while reloading the current level.
- Add a keyboard shortcut to reload the level data.
- Add a debug panel showing loaded level ID and entity counts.

Do not make hot reload so complex that it blocks the initial pipeline.

---

## 21. Testing Requirements

Add lightweight tests or validation fixtures if the project test setup exists.

At minimum, create sample invalid content cases for:

- Missing `PlayerSpawn`
- Door missing `targetLevel`
- Unknown `enemyType`
- Invalid trigger payload JSON
- Missing animation tag

If no test runner exists, make `npm run validate:content` cover the sample project and fail with clear messages.

---

## 22. Implementation Order

Follow this order:

1. Inspect existing project structure.
2. Identify the renderer/game framework already in use.
3. Add or adapt the folder structure.
4. Add content TypeScript types.
5. Add LDtk raw type definitions or minimal interfaces.
6. Add LDtk loader.
7. Add entity field readers.
8. Add validators.
9. Add sample LDtk exported JSON or placeholder fixture.
10. Add sprite atlas loader.
11. Add sample Aseprite-exported JSON or placeholder fixture.
12. Add runtime demo/debug rendering.
13. Add validation script.
14. Add package scripts.
15. Add Git LFS `.gitattributes`.
16. Write README.
17. Write docs.
18. Run build and validation.
19. Fix errors.
20. Summarize what was created and how to use it.

---

## 23. Quality Bar

The implementation is acceptable only if:

- The project runs locally with a documented command.
- A sample level loads successfully.
- Content validation fails clearly on bad data.
- LDtk raw data does not leak all over gameplay code.
- Entity fields are documented and validated.
- The artist workflow is documented.
- The level designer workflow is documented.
- README links to all relevant docs.
- Folder names and file ownership are obvious.
- Adding a new entity type has a documented process.

---

## 24. Things to Avoid

Do not:

- Use Tiled.
- Hardcode level data directly into gameplay code.
- Let gameplay systems depend on raw LDtk JSON everywhere.
- Skip validation.
- Use vague docs like "export the level somehow".
- Require designers or artists to edit TypeScript.
- Store only exported assets while losing editable source files.
- Put huge binary assets into normal Git history without LFS.
- Assume hot reload is complete if JSON updates but textures/entities are stale.
- Create a massive game engine rewrite.
- Build complex gameplay before the content pipeline is reliable.

---

## 25. Final Response Expected from the Implementation LLM

When done, summarize:

- Files created
- Scripts added
- How to run the project
- How to validate content
- Where the level designer should start
- Where the artist should start
- Any assumptions made
- Any TODOs that remain

Do not claim the pipeline is complete if validation, docs, or the sample level are missing.
