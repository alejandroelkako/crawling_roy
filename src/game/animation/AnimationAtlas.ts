import type { AnimationTag, SpriteAtlasDefinition, SpriteFrame } from "../content/contentTypes";

export class AnimationAtlas {
  constructor(readonly definition: SpriteAtlasDefinition) {}

  getFrame(index: number): SpriteFrame {
    const frame = this.definition.frames[index];
    if (!frame) {
      throw new Error(`Sprite atlas "${this.definition.id}" does not contain frame ${index}.`);
    }
    return frame;
  }

  getTag(name: string): AnimationTag {
    const tag = this.definition.tags[name];
    if (!tag) {
      throw new Error(`Sprite atlas "${this.definition.id}" is missing animation tag "${name}".`);
    }
    return tag;
  }
}
