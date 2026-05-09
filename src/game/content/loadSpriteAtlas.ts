import type { AnimationTag, SpriteAtlasDefinition, SpriteFrame } from "./contentTypes";
import { validateSpriteAtlasDefinition } from "./validateContent";

interface AsepriteJson {
  meta?: {
    image?: string;
    frameTags?: Array<{ name: string; from: number; to: number; direction?: string }>;
  };
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    duration?: number;
  }>;
}

export async function loadSpriteAtlas(url: string): Promise<SpriteAtlasDefinition> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load sprite atlas JSON at "${url}". HTTP ${response.status}.`);
  }
  return parseSpriteAtlas((await response.json()) as AsepriteJson, url);
}

export function parseSpriteAtlas(json: AsepriteJson, sourceUrl: string): SpriteAtlasDefinition {
  const imagePath = resolveImagePath(sourceUrl, json.meta?.image);
  const frames: SpriteFrame[] = json.frames.map((frame) => ({
    name: frame.filename,
    x: frame.frame.x,
    y: frame.frame.y,
    width: frame.frame.w,
    height: frame.frame.h,
    durationMs: frame.duration ?? 100
  }));
  const tags: Record<string, AnimationTag> = {};

  for (const tag of json.meta?.frameTags ?? []) {
    tags[tag.name] = {
      name: tag.name,
      from: tag.from,
      to: tag.to,
      direction: normalizeDirection(tag.direction)
    };
  }

  const atlas = {
    id: sourceUrl.split("/").pop()?.replace(".json", "") ?? sourceUrl,
    imagePath,
    frames,
    tags
  };
  validateSpriteAtlasDefinition(atlas);
  return atlas;
}

function resolveImagePath(sourceUrl: string, imageName: string | undefined): string {
  if (!imageName) return "";
  if (imageName.startsWith("/")) return imageName;
  return `${sourceUrl.slice(0, sourceUrl.lastIndexOf("/") + 1)}${imageName}`;
}

function normalizeDirection(direction: string | undefined): AnimationTag["direction"] {
  if (direction === "reverse" || direction === "pingpong") return direction;
  return "forward";
}
