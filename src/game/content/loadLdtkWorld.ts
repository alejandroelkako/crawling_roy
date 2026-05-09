import type { LevelDefinition } from "./contentTypes";
import { parseLdtkLevel } from "./parseLdtkLevel";
import type { LdtkWorld } from "../ldtk/ldtkTypes";

export async function loadLdtkWorld(url: string, levelId: string): Promise<LevelDefinition> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load LDtk JSON at "${url}". HTTP ${response.status}.`);
  }
  const world = (await response.json()) as LdtkWorld;
  return parseLdtkLevel(world, levelId);
}
