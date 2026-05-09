import type { EntityDefinition, LevelDefinition, Rect } from "../content/contentTypes";

export class DebugDraw {
  constructor(private readonly ctx: CanvasRenderingContext2D) {}

  rect(rect: Rect, color: string, fill = false): void {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 2;
    if (fill) {
      this.ctx.globalAlpha = 0.22;
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    this.ctx.globalAlpha = 1;
    this.ctx.strokeRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2);
    this.ctx.restore();
  }

  label(text: string, x: number, y: number, color = "#e8edf2"): void {
    this.ctx.save();
    this.ctx.font = "12px ui-monospace, Consolas, monospace";
    const width = this.ctx.measureText(text).width + 8;
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    this.ctx.fillRect(x, y - 16, width, 18);
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x + 4, y - 3);
    this.ctx.restore();
  }

  levelSummary(level: LevelDefinition): void {
    this.ctx.save();
    this.ctx.font = "13px ui-monospace, Consolas, monospace";
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    this.ctx.fillRect(12, 12, 300, 58);
    this.ctx.fillStyle = "#e8edf2";
    this.ctx.fillText(`Level: ${level.id}`, 24, 34);
    this.ctx.fillText(`Entities: ${level.entities.length}`, 24, 54);
    this.ctx.restore();
  }

  entityMarker(entity: EntityDefinition): void {
    const colors: Record<EntityDefinition["kind"], string> = {
      PlayerSpawn: "#62d26f",
      Door: "#69a7ff",
      EnemySpawn: "#ff8a4c",
      Pickup: "#ffd166",
      TriggerZone: "#c789ff"
    };
    this.rect(entity, colors[entity.kind], true);
    this.label(`${entity.kind}:${entity.id}`, entity.x, entity.y, colors[entity.kind]);
  }
}
