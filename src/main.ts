import { Game } from "./game/Game";
import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element.");
}

const game = new Game(app, {
  levelUrl: "/assets/exported/levels/dungeon.ldtk.json",
  levelId: "Dungeon_01",
  spriteAtlases: ["/assets/exported/sprites/hero.json", "/assets/exported/sprites/enemies.json"]
});

void game.start();
