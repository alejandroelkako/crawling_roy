import type { LevelDefinition } from "../content/contentTypes";
import { DebugDraw } from "../debug/DebugDraw";
import { PlayerState } from "../entities/Player";

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(parent: HTMLElement) {
    this.canvas = document.createElement("canvas");
    parent.append(this.canvas);
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create a 2D canvas context.");
    this.ctx = ctx;
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }

  render(level: LevelDefinition, player?: PlayerState): void {
    this.resize();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    const scale = Math.min(this.canvas.width / level.width, this.canvas.height / level.height);
    this.ctx.translate(24, 88);
    this.ctx.scale(scale * 0.9, scale * 0.9);

    this.drawBackground(level);
    this.drawTiles(level);
    const debug = new DebugDraw(this.ctx);
    for (const rect of level.collision.solids) debug.rect(rect, "#ff6978", true);
    for (const rect of level.collision.hazards) debug.rect(rect, "#7dd3fc", true);
    for (const entity of level.entities) debug.entityMarker(entity);
    if (player) this.drawPlayer(player);
    this.ctx.restore();

    new DebugDraw(this.ctx).levelSummary(level);
  }

  private drawPlayer(player: PlayerState): void {
      this.ctx.save();
      this.ctx.fillStyle = "#f8e16c";
      this.ctx.fillRect(player.x, player.y, player.width, player.height);
      this.ctx.strokeStyle = "#1c1f24";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(player.x + 0.5, player.y + 0.5, player.width - 1, player.height - 1);
      this.ctx.restore();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width * window.devicePixelRatio));
    const height = Math.max(240, Math.floor(rect.height * window.devicePixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  private drawBackground(level: LevelDefinition): void {
    this.ctx.fillStyle = "#17202a";
    this.ctx.fillRect(0, 0, level.width, level.height);
    this.ctx.strokeStyle = "#314050";
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= level.width; x += level.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, level.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= level.height; y += level.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(level.width, y);
      this.ctx.stroke();
    }
  }

  private drawTiles(level: LevelDefinition): void {
    const palette = ["#253545", "#2c604d", "#5a4d35", "#434b5f"];
    for (const layer of level.tileLayers) {
      for (const tile of layer.tiles) {
        this.ctx.fillStyle = palette[tile.tileId % palette.length];
        this.ctx.fillRect(tile.x, tile.y, level.tileSize, level.tileSize);
      }
    }
  }
}
