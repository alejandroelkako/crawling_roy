import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseLdtkLevel } from "../src/game/content/parseLdtkLevel";
import { parseSpriteAtlas } from "../src/game/content/loadSpriteAtlas";
import type { LdtkWorld } from "../src/game/ldtk/ldtkTypes";

const root = process.cwd();

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(join(root, path), "utf8")) as T;
}

async function validateValidContent(): Promise<void> {
  const world = await readJson<LdtkWorld>("public/assets/exported/levels/dungeon.ldtk.json");
  const level = parseLdtkLevel(world, "Dungeon_01");
  console.log(`OK level: ${level.id} (${level.entities.length} entities)`);

  for (const atlasPath of ["public/assets/exported/sprites/hero.json", "public/assets/exported/sprites/enemies.json"]) {
    const atlas = parseSpriteAtlas(await readJson(atlasPath), `/${atlasPath.replaceAll("\\", "/")}`);
    console.log(`OK sprite atlas: ${atlas.id} (${Object.keys(atlas.tags).length} tags)`);
  }
}

async function expectInvalid(name: string, run: () => unknown): Promise<void> {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`OK invalid fixture failed as expected: ${name} - ${message}`);
    return;
  }
  throw new Error(`Invalid fixture unexpectedly passed: ${name}`);
}

async function validateInvalidFixtures(): Promise<void> {
  await expectInvalid("missing-player-spawn", async () => {
    const world = await readJson<LdtkWorld>("fixtures/invalid/missing-player-spawn.ldtk.json");
    parseLdtkLevel(world, "Missing_Player");
  });

  await expectInvalid("door-missing-target", async () => {
    const world = await readJson<LdtkWorld>("fixtures/invalid/door-missing-target.ldtk.json");
    parseLdtkLevel(world, "Door_Missing_Target");
  });

  await expectInvalid("unknown-enemy", async () => {
    const world = await readJson<LdtkWorld>("fixtures/invalid/unknown-enemy.ldtk.json");
    parseLdtkLevel(world, "Unknown_Enemy");
  });

  await expectInvalid("bad-trigger-payload", async () => {
    const world = await readJson<LdtkWorld>("fixtures/invalid/bad-trigger-payload.ldtk.json");
    parseLdtkLevel(world, "Bad_Trigger");
  });

  await expectInvalid("missing-animation-tag", async () => {
    parseSpriteAtlas(await readJson("fixtures/invalid/missing-animation-tag.json"), "/fixtures/invalid/missing-animation-tag.json");
  });
}

await validateValidContent();
await validateInvalidFixtures();
console.log("Content validation complete.");
