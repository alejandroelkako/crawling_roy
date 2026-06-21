# Entity Contract

This is the contract between LDtk and TypeScript. Designers may place only these entity names unless code and docs are updated.

## PlayerSpawn

- Purpose: player start point.
- Required fields: `spawnDirection`.
- Optional fields: `id`, default `player-start`.
- Valid values: `spawnDirection` is `left` or `right`.
- Runtime behavior: marks where the player should start.
- Validation: every playable level must contain exactly one.

## Door

- Purpose: level transition marker.
- Required fields: `id`, `targetLevel`, `targetDoor`, `locked`.
- Optional fields: `requiresKey`.
- Valid values: `requiresKey` is required when `locked` is true.
- Runtime behavior: points to another level and door id.
- Validation: must have rectangular bounds and destination metadata.

## EnemySpawn

- Purpose: spawn enemies.
- Required fields: `id`, `enemyType`, `patrolRadius`, `count`, `respawn`.
- Valid values: `enemyType` is `slime`, `bat`, or `skeleton`; `patrolRadius >= 0`; `count` is 1-10.
- Runtime behavior: creates an enemy spawn instruction.
- Validation: unknown enemy types fail.

## Pickup

- Purpose: place collectible items.
- Required fields: `id`, `pickupType`, `amount`.
- Optional fields: `keyId`.
- Valid values: `pickupType` is `coin`, `heart`, or `key`; `amount > 0`.
- Runtime behavior: creates pickup markers.
- Validation: `keyId` is required when `pickupType` is `key`.

## TriggerZone

- Purpose: non-solid event rectangle.
- Required fields: `id`, `eventName`, `once`, `payload`.
- Valid values: `eventName` is currently `show_message`, `start_encounter`, `open_secret`, or `level_complete`; `payload` is empty or valid JSON.
- Runtime behavior: marks an event area.
- Validation: unknown events and invalid JSON fail.

## How to Add a New Entity Type

1. Add the entity definition in LDtk.
2. Add TypeScript type.
3. Add validator.
4. Add entity factory or handler.
5. Add docs to this file.
6. Add a sample to the test level.
7. Run `npm run validate:content`.
