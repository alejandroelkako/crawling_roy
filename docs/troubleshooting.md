# Troubleshooting

## `Missing PlayerSpawn`

Every playable LDtk level must contain exactly one `PlayerSpawn`.

Fix: open the level in LDtk, select the `Entities` layer, and place one `PlayerSpawn`.

## `Unknown enemyType: goblin`

The level contains an enemy type that code does not know about.

Fix: change `enemyType` to `slime`, `bat`, or `skeleton`, or ask the programmer to add support for the new enemy.

## Door Missing Destination

Doors need `targetLevel` and `targetDoor`.

Fix: select the `Door` in LDtk and set both fields.

## Invalid Trigger Payload

`TriggerZone.payload` is not valid JSON.

Fix: use valid JSON such as `{"text":"Hello"}` or leave the field empty.

## Sprite Animation Tag Not Found

The code requested an animation such as `run_right`, but the exported Aseprite JSON does not contain that tag.

Fix: open the `.aseprite` file, add or rename the tag, export again, and rerun validation.

## Missing Asset Path

The exported sprite JSON does not include `meta.image`.

Fix: export the sprite sheet again and make sure the PNG and JSON sit next to each other.
