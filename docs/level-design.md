# Level Design

Open the LDtk project from `assets/source/levels`. Exported JSON must go to `public/assets/exported/levels`.

## Required Layers

- `Tiles`: visual tiles.
- `Collision`: IntGrid or tiles for blockers.
- `Entities`: `PlayerSpawn`, `Door`, `EnemySpawn`, and `Pickup`.
- `Triggers`: rectangular `TriggerZone` entities.

Use a 16 px grid unless the programmer changes the runtime contract.

## Collision Values

- `0`: empty
- `1`: solid ground, wall, or platform blocker
- `2`: pit hazard
- `3`: water hazard

## Placing Entities

- `PlayerSpawn`: place exactly one in each playable level. Set `spawnDirection` to `left` or `right`.
- `Door`: set `id`, `targetLevel`, `targetDoor`, `locked`, and `requiresKey` when locked. Use platformer-neutral ids such as `entry-door` and `exit-door`.
- `EnemySpawn`: set `enemyType` to `slime`, `bat`, or `skeleton`; `count` must be 1-10.
- `Pickup`: set `pickupType` to `coin`, `heart`, or `key`; key pickups require `keyId`.
- `TriggerZone`: place on the `Triggers` layer; `payload` must be empty or valid JSON.

## Export

Use LDtk export JSON and save the runtime file under `public/assets/exported/levels`. Do not hand-edit exported JSON except for emergency debugging.

## Common Mistakes

- More than one `PlayerSpawn`.
- Door missing `targetLevel` or `targetDoor`.
- Trigger payload with invalid JSON.
- Platforms, floors, or walls drawn visually in `Tiles` but missing from `Collision`.

## Level Designer Checklist

- [ ] The level has exactly one `PlayerSpawn`.
- [ ] All doors have `targetLevel` and `targetDoor`.
- [ ] Collision exists on floors, platforms, walls, and blockers.
- [ ] Enemy spawns use approved `enemyType` values.
- [ ] Trigger payloads are valid JSON or empty.
- [ ] The level passes `npm run validate:content`.
