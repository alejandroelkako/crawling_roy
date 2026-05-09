# Content Pipeline

## Flow

Designer edits LDtk source files, exports JSON, the loader validates it, and the game consumes a clean `LevelDefinition`.

Artist edits Aseprite source files, exports PNG/JSON, the sprite loader validates animation tags, and the game consumes an `AnimationAtlas`.

## Ownership

- Designers own `assets/source/levels/*.ldtk`.
- Artists own `assets/source/sprites/*.aseprite`.
- Programmers own `src/game/content`, `src/game/ldtk`, validation, and runtime behavior.
- The browser loads only files in `public/assets/exported`.

## Validation

Validation runs when content loads in the browser and through:

```bash
npm run validate:content
```

Fix the first reported error in LDtk or Aseprite, export again, then rerun validation.

## Adding a Level

1. Create or edit the LDtk project in `assets/source/levels`.
2. Include `Tiles`, `Collision`, `Entities`, and `Triggers` layers.
3. Export LDtk JSON to `public/assets/exported/levels`.
4. Ensure the playable level has exactly one `PlayerSpawn`.
5. Run `npm run validate:content`.

## Adding a Sprite Sheet

1. Save the `.aseprite` source in `assets/source/sprites`.
2. Add required animation tags such as `idle_down` and `walk_down`.
3. Export PNG and JSON to `public/assets/exported/sprites`.
4. Add the JSON path to the loader if code needs it.
5. Run `npm run validate:content`.

## Adding an Entity Type

Update LDtk entity definitions, TypeScript runtime types, the validator, entity registry, docs, and the sample level. Then run validation.
