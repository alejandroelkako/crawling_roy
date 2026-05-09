import { loadLdtkWorld } from "./content/loadLdtkWorld";
import { loadSpriteAtlas } from "./content/loadSpriteAtlas";
import { ContentValidationError, type LevelDefinition, type SpriteAtlasDefinition } from "./content/contentTypes";
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
  private overlay: HTMLDivElement | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: GameOptions
  ) {
    this.renderer = new CanvasRenderer(root);
    window.addEventListener("keydown", (event) => {
      if (event.key.toLowerCase() === "r") {
        void this.reload();
      }
    });
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
      console.info("Loaded content", { level: level.id, atlases: this.atlases.map((atlas) => atlas.id) });
      this.renderer.render(level);
    } catch (error) {
      this.showError(error);
    }
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
