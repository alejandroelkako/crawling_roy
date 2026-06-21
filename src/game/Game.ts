import { loadLdtkWorld } from "./content/loadLdtkWorld";
import { loadSpriteAtlas } from "./content/loadSpriteAtlas";
import {
    ContentValidationError,
    type LevelDefinition,
    type PlayerSpawnDefinition,
    type Rect,
    type SpriteAtlasDefinition
} from "./content/contentTypes";
import { createPlayer, type PlayerState } from "./entities/Player";
import { createRuntimeEntity } from "./ldtk/ldtkEntityRegistry";
import { CanvasRenderer } from "./renderer/CanvasRenderer";

export interface GameOptions {
  levelUrl: string;
  levelId: string;
  spriteAtlases: string[];
}

export class Game {
  private readonly renderer: CanvasRenderer;
  private level: LevelDefinition | null = null;
  private atlases: SpriteAtlasDefinition[] = [];
  private player: PlayerState | null = null;
  private overlay: HTMLDivElement | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private readonly input = {
      left: false,
      right: false,
      jumpQueued: false
  };

  constructor(
    private readonly root: HTMLElement,
    private readonly options: GameOptions
  ) {
    this.renderer = new CanvasRenderer(root);
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
    window.addEventListener("keyup", (event) => this.handleKeyUp(event));
  }

  async start(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    try {
      this.clearError();
      const [level, ...atlases] = await Promise.all([
        loadLdtkWorld(this.options.levelUrl, this.options.levelId),
        ...this.options.spriteAtlases.map((url) => loadSpriteAtlas(url))
      ]);
      this.level = level;
      this.atlases = atlases;
      level.entities.map(createRuntimeEntity);
      this.player = createPlayer(findPlayerSpawn(level));
      console.info("Loaded content", { level: level.id, atlases: this.atlases.map((atlas) => atlas.id) });
      this.startLoop();
    } catch (error) {
      this.stopLoop();
      this.showError(error);
    }
  }

  private startLoop(): void {
   this.stopLoop();
   this.lastFrameTime = performance.now();
   this.animationFrameId = window.requestAnimationFrame((time) => this.frame(time));
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
        window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
  }

  private frame(time: number): void {
    const deltaSeconds = Math.min((time - this.lastFrameTime) / 1000, 1 / 30);
    this.lastFrameTime = time;

    if (this.level && this.player) {
        this.updatePlayer(this.player, this.level, deltaSeconds);
        this.renderer.render(this.level, this.player);
    }

    this.animationFrameId = window.requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  private updatePlayer(player: PlayerState, level: LevelDefinition, deltaSeconds: number): void {
      const moveSpeed = 90;
      const gravity = 500;
      const jumpVelocity = -210;

      const horizontalInput = Number(this.input.right) - Number(this.input.left);
      player.velocityX = horizontalInput * moveSpeed;

      if (this.input.jumpQueued && player.grounded) {
          player.velocityY = jumpVelocity;
          player.grounded = false;
      }
      this.input.jumpQueued = false;

      player.velocityY += gravity * deltaSeconds;

      player.x += player.velocityX * deltaSeconds;
      this.resolveHorizontalCollision(player, level.collision.solids);
      player.x = clamp(player.x, 0, level.width - player.width);

      player.y += player.velocityY * deltaSeconds;
      player.grounded = false;
      this.resolveVerticalCollision(player, level.collision.solids);
      player.y = clamp(player.y, 0, level.height - player.height);
  }

  private resolveHorizontalCollision(player: PlayerState, solids: Rect[]): void {
      const solid = solids.find((rect) => intersects(player, rect));
      if (!solid) return;

      if (player.velocityX > 0) player.x = solid.x - player.width;
      if (player.velocityX < 0) player.x = solid.x + solid.width;
      player.velocityX = 0;
  }

  private resolveVerticalCollision(player: PlayerState, solids: Rect[]): void {
      const solid = solids.find((rect) => intersects(player, rect));
      if (!solid) return;

      if (player.velocityY > 0) {
          player.y = solid.y - player.height;
          player.grounded = true;
      }
      if (player.velocityY < 0) player.y = solid.y + solid.height;
      player.velocityY = 0;
  }

  private handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      if (key == "r") {
          void this.reload();
          return;
      }
      if (key === "arrowleft" || key === "a") this.input.left = true;
      if (key === "arrowright" || key === "d") this.input.right = true;
      if ((key == " " || key === "arrowup" || key === "w") && !event.repeat) this.input.jumpQueued = true;
      if (isGameKey(key)) event.preventDefault();
  }

  private handleKeyUp(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") this.input.left = false;
      if (key === "arrowright" || key === "d") this.input.right = false;
      if (isGameKey(key)) event.preventDefault();
  }

  private showError(error: unknown): void {
    const message =
      error instanceof ContentValidationError
        ? `${error.message}\n\n${error.issues.map((issue) => `- ${issue.message}`).join("\n")}`
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(error);
    this.overlay = document.createElement("div");
    this.overlay.className = "error-overlay";
    this.overlay.textContent = message;
    this.root.append(this.overlay);
  }

  private clearError(): void {
    this.overlay?.remove();
    this.overlay = null;
  }
}

  function findPlayerSpawn(level: LevelDefinition): PlayerSpawnDefinition {
      const spawn = level.entities.find(
          (entity): entity is PlayerSpawnDefinition => entity.kind === "PlayerSpawn");
      if (!spawn) throw new Error(`Level "${level.id}" is missing PlayerSpawn.`);
      return spawn;
  }

  function intersects(a: Rect, b: Rect): boolean {
      return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  function clamp(value: number, min: number, max: number): number {
      return Math.min(Math.max(value, min), max);
  }

  function isGameKey(key: string): boolean {
      return key === "arrowleft" || key === "arrowright" || key === "arrowup"
          || key === "a" || key === "d" || key === "w" || key === " ";
  }

