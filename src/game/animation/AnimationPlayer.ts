import { AnimationAtlas } from "./AnimationAtlas";

export class AnimationPlayer {
  private elapsed = 0;
  private frameIndex = 0;

  constructor(
    private readonly atlas: AnimationAtlas,
    private readonly tagName: string
  ) {}

  update(deltaMs: number): number {
    const tag = this.atlas.getTag(this.tagName);
    const frame = this.atlas.getFrame(this.frameIndex);
    this.elapsed += deltaMs;
    if (this.elapsed >= frame.durationMs) {
      this.elapsed = 0;
      this.frameIndex = this.frameIndex >= tag.to ? tag.from : this.frameIndex + 1;
    }
    return this.frameIndex;
  }
}
