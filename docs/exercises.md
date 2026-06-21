# Learning Platforming Roy — A Hands-On Curriculum

A progressive set of exercises that teach this codebase by working *through* it, not just reading it. Each exercise targets one real architectural idea, points at the exact files involved, and ends with a command you can run to prove you got it right.

The whole project is ~1,100 lines of TypeScript. You can hold all of it in your head by the end. The goal of these exercises is to get it there.

---

## How to use this guide

**The golden loop.** Every exercise starts from a green baseline and ends back at green:

```bash
npm install            # once
npm run validate:content   # parses the sample level + atlases, asserts the 5 bad fixtures fail
npm run build              # tsc type-check + vite production build
npm run dev                # live demo in the browser (press "r" to reload content)
```

`npm run check` runs `validate:content` then `build` in one shot — use it as your "am I still green?" command.

**Rules of engagement**

1. **Start green, end green.** Before each exercise run `npm run check`. It should pass. After, it should pass again (unless the exercise is explicitly about making it *fail* on purpose).
2. **Change one layer at a time.** This codebase is layered on purpose. Resist editing five files at once until Tier 3, where that's the whole point.
3. **Undo is free.** Everything here is local. `git stash` or `git checkout -- <file>` resets any exercise. Experiment fearlessly.
4. **Predict before you run.** The highest-value habit: write down what you *think* will happen, then run the command. The gap between prediction and reality is where the learning is.

**Difficulty markers:** 🟢 reading/tracing · 🟡 small change · 🟠 multi-file change · 🔴 design/debugging.

**Answer policy.** Hints are folded under each exercise. Full reference solutions are *not* in this file on purpose — ask and I'll generate one for any exercise, review your diff, or turn any exercise into a guided step-by-step.

---

## The 60-second map

Two pipelines feed one demo. Raw editor formats (LDtk, Aseprite) are parsed and validated at the edge, then the rest of the code only ever sees clean, strongly-typed *Definition* objects.

```
LDtk JSON  ──► loadLdtkWorld ──► parseLdtkLevel ──► validateLevelDefinition ──► LevelDefinition ─┐
 (editor)        (fetch)         (raw → clean)        (semantic checks)          (clean type)    │
                                                                                                 ├─► Game ─► CanvasRenderer + DebugDraw
Aseprite   ──► loadSpriteAtlas ─► parseSpriteAtlas ─► validateSpriteAtlas ──► SpriteAtlasDefinition┘        (canvas debug view)
 JSON           (fetch)          (raw → clean)        (tag/frame checks)        (clean type)
```

The layers, and the one rule that holds them together:

| Layer | Folder | Job | Rule |
|---|---|---|---|
| Entry | `src/main.ts`, `src/game/Game.ts` | wire URLs → load → render | knows nothing about LDtk internals |
| Content | `src/game/content/` | turn raw JSON into clean types + validate | the **only** place allowed to be opinionated about shape |
| LDtk | `src/game/ldtk/` | raw LDtk type shims, field readers, entity registry | isolates the editor's quirks |
| Entities | `src/game/entities/` | per-kind runtime factories (`*Definition` → `GameEntity`) | one file per entity kind |
| Animation | `src/game/animation/` | sprite-sheet frame/tag playback | currently **dormant** (see Tier 4) |
| Renderer | `src/game/renderer/`, `src/game/debug/` | draw the level to a canvas | reads `LevelDefinition`, draws debug rects |

**The one rule:** *raw LDtk JSON must never leak past the content layer.* Gameplay code sees `LevelDefinition` / `EntityDefinition`, never `LdtkLayerInstance`. Most exercises are really about feeling where that boundary is.

---

## Tier 0 — Orientation 🟢

### Exercise 0.1 — Boot it and watch it run
**Goal:** a working environment and a mental image of the demo.

**Steps**
1. `npm install`, then `npm run dev`. Open the URL.
2. Identify on screen: the tile grid, the red collision rectangles, the light-blue hazard rectangles (there are none in the sample — note that), the five colored entity markers with labels, and the level-summary box top-left.
3. Press **`r`**. Watch the console log `Loaded content …`. You just triggered a hot reload.
4. In a second terminal: `npm run validate:content` and `npm run build`. Both should pass.

**Verify:** the browser shows a starter platformer level with labeled markers; both commands exit 0.

<details><summary>What you just learned</summary>

`src/main.ts` constructs one `Game` (`src/game/Game.ts`) with a level URL, a level id, and two sprite-atlas URLs. `Game.start()` → `reload()` loads everything in parallel, then renders. The `r` key handler is `Game.ts:24-29`. The five marker colors live in `DebugDraw.entityMarker` (`src/game/debug/DebugDraw.ts:42`).
</details>

### Exercise 0.2 — Trace one entity end-to-end on paper 🟢
**Goal:** see the whole pipeline through a single object.

Pick the **Door** in the sample level. Without changing any code, write down — file by file — every transformation it goes through, from JSON to pixels on screen.

**Steps**
1. Find the Door's raw JSON in `public/assets/exported/levels/starter.ldtk.json` (it's `exit-door`, around line 62).
2. Follow it: `loadLdtkWorld` → `parseLdtkLevel` → `parseEntities` → `parseEntity`'s `case "Door"` → which field readers fire? → `DoorDefinition` → `validateLevelDefinition` / `validateEntity`'s `case "Door"` → `createRuntimeEntity` → `createDoor` → `DebugDraw.entityMarker`.
3. For each hop, note the **type** the data has at that point (`LdtkEntityInstance` → `DoorDefinition` → `GameEntity`).

**Verify:** you can answer — *at which line does the raw `{ "__identifier": "Door", … }` stop existing and become a typed `DoorDefinition`?* (Answer: the `return { …base, kind: "Door", … }` in `parseEntity`, `parseLdtkLevel.ts:128`.)

<details><summary>Hint</summary>

The field readers `readString` / `readBoolean` / `readNullableString` (in `src/game/ldtk/ldtkFieldReaders.ts`) are the exact spot where untyped `unknown` JSON values become typed fields. That's the membrane.
</details>

---

## Tier 1 — Reading comprehension 🟢

### Exercise 1.1 — Predict which gate catches each bad fixture 🟢
**Goal:** internalize the **two lines of defense**.

There are two independent places content can be rejected:
- **The parser gate** — field readers + `readEnum` + the `switch` default in `parseLdtkLevel.ts`. Fails *fast* on the first problem, throws a plain `Error`, and always includes `x=…/y=…` coordinates.
- **The validator gate** — `validateContent.ts`. Runs *after* a clean parse, checks cross-field and whole-level rules, and **accumulates every issue** into a `ContentValidationError.issues[]`.

For each of the five fixtures in `fixtures/invalid/`, predict **(a)** which gate fires and **(b)** the gist of the message. *Then* run `npm run validate:content` and check yourself against the output.

| Fixture | Your prediction: parser or validator? |
|---|---|
| `missing-player-spawn.ldtk.json` | ? |
| `door-missing-target.ldtk.json` | ? |
| `unknown-enemy.ldtk.json` | ? |
| `bad-trigger-payload.ldtk.json` | ? |
| `missing-animation-tag.json` | ? |

<details><summary>Answer key</summary>

- **door-missing-target → parser** (`readString` throws "missing required field targetLevel").
- **unknown-enemy → parser** (`readEnum` throws "invalid enemyType value goblin").
- **bad-trigger-payload → parser** (`parsePayload` → `JSON.parse` throws "invalid JSON in field payload").
- **missing-player-spawn → validator** (`ContentValidationError`: "must contain exactly one PlayerSpawn; found 0").
- **missing-animation-tag -> validator** (`ContentValidationError`: "missing animation tag run_right").

The punchline: 3 caught by the parser, 2 by the validator. Notice that `validateEntity`'s checks for `targetLevel` and `enemyType` are effectively **unreachable from the LDtk path** — the parser already threw. They're a safety net for code that constructs an `EntityDefinition` directly. Spotting "redundant" validation and understanding *why* it's there is the real lesson.
</details>

### Exercise 1.2 — Hand-decode the collision grid 🟢
**Goal:** understand the IntGrid → `Rect[]` conversion in `parseCollision` (`parseLdtkLevel.ts:68`).

The sample's `Collision` layer is a flat `intGridCsv` array (`starter.ldtk.json:108`). Using only the code in `parseCollision` and the level's `pxWid` of 320:

1. Compute `widthInCells`.
2. Count how many `solids` the parser produces. (No `2`/`3` values appear, so how many `hazards`?)
3. Row 0 has two `0`s among the `1`s. Compute their pixel `x`. Which sample-level opening does that represent?

<details><summary>Answers</summary>

`widthInCells = Math.ceil(320 / 16) = 20`, grid is 12 rows. **58 solids, 0 hazards.** The two `0`s in row 0 are at indices 9 and 10 -> `x = 144` and `160` — the **exit opening**, lined up precisely with the `exit-door` entity at `px:[144,0]` width 32. Map geometry and entity placement agree by construction. Change a `1` to a `2` in the CSV, re-run `npm run dev`, and watch a blue hazard rectangle appear.
</details>

---

## Tier 2 — One-layer changes 🟡

> Re-run `npm run check` after each. Use `git diff` to see exactly what you touched.

### Exercise 2.1 — Add a trigger event to the allowlist 🟡
**Goal:** feel the simplest "the validator owns the rules" change.

`TriggerZone.eventName` is gated by `knownEvents` (`validateContent.ts:12`) — and *only* there (the parser reads it as a plain string). 

1. Add `"spawn_boss"` to `knownEvents`.
2. In `starter.ldtk.json`, change the existing TriggerZone's `eventName` value to `spawn_boss` (or add a second TriggerZone on the `Triggers` layer that uses it).
3. `npm run validate:content`.

<details><summary>Hint</summary>

Before step 1, set the value to `spawn_boss` and run validation to *see it fail* — that's the "before". Then add it to the set for the "after". This is the cheapest demonstration that `eventName` is validator-enforced, not parser-enforced.
</details>

### Exercise 2.2 — Add a new enemy type `ghost` 🟡
**Goal:** trace how a single enum threads through multiple files.

`enemyType` is enforced in **two** places (find them): the `readEnum` allow-list inside `parseEntity` and the `knownEnemyTypes` set in the validator. Plus the union type itself.

1. Add `"ghost"` to the `EnemyType` union in `contentTypes.ts:2`.
2. Add `"ghost"` to the `readEnum` allowed list in `parseLdtkLevel.ts` (`case "EnemySpawn"`).
3. Add `"ghost"` to `knownEnemyTypes` in `validateContent.ts:10`.
4. Change the sample `EnemySpawn`'s `enemyType` to `ghost` and validate.
5. **Now the lesson:** revert step 2 only (leave 1 and 3). Re-run `validate:content`. Which gate fails, and what does that tell you about the order checks run in?

<details><summary>What step 5 teaches</summary>

With the type and validator updated but the parser's `readEnum` list stale, `readEnum` throws *first* ("invalid enemyType value ghost"), so the validator's `knownEnemyTypes` check never runs. Proof that the parser is the front line and the validator is the backstop. Skip any one of the three edits and you get a *different* failure — that's the cost of an enum spread across layers, and the motivation for Tier 3's checklist.
</details>

### Exercise 2.3 — Tighten the sprite contract 🟡
**Goal:** the Aseprite half of the pipeline.

`validateSpriteAtlasDefinition` (`validateContent.ts:105`) requires the tags in `requiredAnimationTags` (`:13`) and checks every tag's frame range.

1. Add `"jump"` to `requiredAnimationTags`. Run `validate:content` — `hero.json` and `enemies.json` now fail.
2. Add a `jump` frame tag to both `public/assets/exported/sprites/*.json` so they pass again (you can point `jump` at an existing frame index until dedicated jump art exists).
3. Bonus: give a tag a `to` index past the end of `frames` and confirm the "points outside the frame range" check fires.

<details><summary>Hint</summary>

A frame tag is `{ "name": "jump", "from": 0, "to": 0, "direction": "forward" }`. The range check is `tag.to >= atlas.frames.length` -> keep `from`/`to` within the frame count. Look at `parseSpriteAtlas` (`loadSpriteAtlas.ts:24`) to see how `frameTags` become the `tags` record.
</details>

---

## Tier 3 — The vertical slice 🟠 (the keystone exercise)

### Exercise 3.1 — Add a brand-new entity type, end to end
**Goal:** the one exercise that proves you understand the architecture. You'll touch every layer, in order, and let the **TypeScript compiler tell you what you forgot**.

Add a `Sign` entity: a readable in-world sign with a `text` field and an optional `spawnDirection` or display side.

Follow the contract from `docs/entity-contract.md` ("How to Add a New Entity Type"), in dependency order:

1. **Type** — in `contentTypes.ts`: add `SignDefinition extends BaseEntityDefinition { kind: "Sign"; text: string }` and add it to the `EntityDefinition` union (`:85`).
2. **Parse** — in `parseLdtkLevel.ts`: add `case "Sign":` to the switch (`:121`), reading `text` via `readString`.
3. **Validate** — in `validateContent.ts`: add `"Sign"` to `knownEntities` (`:9`) and a `case "Sign":` in `validateEntity` (e.g. reject empty `text`).
4. **Factory** — add `src/game/entities/Sign.ts` exporting `createSign(def: SignDefinition): GameEntity`.
5. **Register** — in `ldtkEntityRegistry.ts`: add `Sign: createSign`.
6. **Draw** — in `DebugDraw.ts`: add a color for `Sign` in the `colors` map (`:43`).
7. **Document** — add a `## Sign` section to `docs/entity-contract.md`.
8. **Sample** — add a `Sign` instance to the `Entities` layer in `starter.ldtk.json` (and to `defs.entities`).
9. `npm run check`, then `npm run dev` and find your sign's marker.

**The payoff — do this deliberately:** make edits 1–4 and 7–8, then run `npm run build` *before* doing 5 and 6. Read the two compiler errors. They will point you straight at `ldtkEntityRegistry.ts` and `DebugDraw.ts`.

<details><summary>Why the compiler catches steps 5 & 6</summary>

The registry is declared with `satisfies { [Kind in EntityDefinition["kind"]]: … }` (`ldtkEntityRegistry.ts:15`) and the debug colors with `Record<EntityDefinition["kind"], string>` (`DebugDraw.ts:43`). The moment `"Sign"` joins the `EntityDefinition` union, both objects are *missing a key* and `tsc` fails. This is the codebase using the type system as a checklist: you literally cannot ship a half-registered entity. Internalize this pattern — it's the single most important design idea in the repo.
</details>

<details><summary>Stretch</summary>

Make `Sign.text` support the same allowlist discipline as triggers, or have `validateEntity` warn when two `Sign`s share identical text. Then add an *invalid* fixture (`fixtures/invalid/sign-empty-text.ldtk.json`) and a matching `expectInvalid(...)` block in `scripts/validate-content.ts` — now you've extended the test harness too.
</details>

---

## Tier 4 — Debugging & dormant seams 🔴

These exercises live in the parts of the codebase that are *built but not wired in*. Finding them is itself the lesson.

### Exercise 4.1 — The animation system has bugs (and isn't even running) 🔴
**Goal:** read `AnimationPlayer` critically and discover it's dead code waiting for you.

`src/game/animation/AnimationPlayer.ts` advances frames over time. Study `update()` (`:12`), then answer:

1. The `AnimationTag.direction` field can be `"forward" | "reverse" | "pingpong"` — it's parsed in `loadSpriteAtlas` and stored. **Where is it read during playback?** (Trace `update()`.)
2. If a tag is `{ from: 5, to: 8 }`, what frame indices does a freshly-constructed player emit on each call, given it starts at `frameIndex = 0`?
3. Grep the codebase: where is `AnimationPlayer` actually *instantiated*?

Then write a 15-line scratch script and run it with `npx tsx scratch.ts` to confirm your answers, driving `update()` with fixed `deltaMs`.

<details><summary>What you'll find</summary>

1. **Nowhere.** `direction` is parsed and stored but `update()` never reads it — `reverse` and `pingpong` silently play forward. (Fix: branch on `tag.direction`.)
2. It emits `0,1,2,3,4,5,6,7,8` then loops `5..8` — it never clamps `frameIndex` to `tag.from` at start or on tag change, so it plays frames *outside* the tag once.
3. **Nowhere** — `grep -rn AnimationPlayer src` shows only its own file. `Game.ts` loads atlases but never creates a player. The animation system is a fully-built, untested, unused seam. Fixing the bugs *and* wiring it in is Tier 5.
</details>

### Exercise 4.2 — The registry output is computed and thrown away 🔴
**Goal:** find the gap between "level definition" and "runtime entity".

Look at `Game.reload()` (`Game.ts:35`). Line 44 is `level.entities.map(createRuntimeEntity);`.

1. The result of that `.map` is never assigned. So what is the line actually *for*? (Hint: what happens inside `createRuntimeEntity` → `ldtkEntityRegistry[kind]`, and what would happen if a kind were unregistered?)
2. The renderer draws markers from `level.entities` (the *definitions*), not from the `GameEntity[]` the registry produces. Make the runtime entities real: store them on the `Game`, and have `DebugDraw` render each `GameEntity`'s `label` (e.g. `"Door -> Level_02:entry-door"`) instead of recomputing a label from the definition.

<details><summary>Hint</summary>

`createDoor`/`createEnemySpawn`/etc. already produce nice human labels (`src/game/entities/*.ts`). Right now those labels are dead. Threading `GameEntity[]` from `Game` into the renderer is a small, satisfying way to connect the registry to what you see on screen — and it shows you why the registry exists at all.
</details>

---

## Tier 5 — Capstones 🔴

Pick one. Each integrates 3–4 subsystems and turns the "scaffold" into something that feels like a game.

### Capstone A — Render real sprites
Wire the animation pipeline you debugged in 4.1 into the renderer.

- Load `hero.png` into an `HTMLImageElement` (mirror how atlases are fetched in `Game.reload`).
- Build an `AnimationAtlas` from the loaded `hero.json`, drive an `AnimationPlayer` with a `requestAnimationFrame` loop and real delta time.
- In `CanvasRenderer`, `drawImage` the current frame's sub-rectangle at the `PlayerSpawn`'s position, on top of the debug rects.

**Done when:** the hero's two-frame `run_right` animation plays at the spawn point in `npm run dev`. (Today the renderer never calls `drawImage` at all — you're adding the first real sprite blit.)

### Capstone B — Door transitions between two levels
- Author a second level `Level_02` (copy the sample, give it an `entry-door` Door pointing back to `Level_01:exit-door`). Add it to the world JSON or a second file.
- Generalize `Game` to load a level by id at runtime and to switch levels — when a key is pressed near a Door, load `targetLevel` and position the player at the matching `targetDoor`.
- Respect `locked` / `requiresKey`: block the transition unless the matching key id has been "collected" (a `Set<string>` on `Game` is enough).

**Done when:** you can walk through the exit door, arrive in `Level_02`, and the locked door is gated on the silver key. This exercises `loadLdtkWorld`'s `levelId` parameter, the Door contract, and game state — the natural next step beyond a static demo.

---

## Cheat-sheet: where everything lives

| You want to… | Go to |
|---|---|
| Change which level/atlases load | `src/main.ts` |
| Change load/reload/error-overlay flow | `src/game/Game.ts` |
| Turn raw LDtk into clean types | `src/game/content/parseLdtkLevel.ts` |
| Read a typed field off a raw entity | `src/game/ldtk/ldtkFieldReaders.ts` |
| Add/relax a content rule | `src/game/content/validateContent.ts` |
| Add an entity *type* | `contentTypes.ts` → `parseLdtkLevel.ts` → `validateContent.ts` → `entities/*` → `ldtkEntityRegistry.ts` → `DebugDraw.ts` → docs → sample JSON |
| Change how the level looks on screen | `src/game/renderer/CanvasRenderer.ts`, `src/game/debug/DebugDraw.ts` |
| Animate sprites | `src/game/animation/` (currently dormant) |
| Add a test for bad content | `scripts/validate-content.ts` + a file in `fixtures/invalid/` |

**Three things to remember about this codebase**
1. **Raw LDtk stops at the content layer.** Everything downstream sees `LevelDefinition`/`EntityDefinition`.
2. **Two gates:** the parser fails fast with coordinates; the validator collects every issue. Know which one owns a given rule.
3. **The types are a checklist.** `satisfies` on the registry and `Record<kind, …>` in the debug colors make the compiler refuse an incompletely-added entity. Lean on that.
