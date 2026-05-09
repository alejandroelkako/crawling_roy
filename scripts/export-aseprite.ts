import { access, mkdir, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, join } from "node:path";

const sourceDir = join(process.cwd(), "assets/source/sprites");
const outputDir = join(process.cwd(), "public/assets/exported/sprites");

async function commandExists(command: string): Promise<boolean> {
  const probe = process.platform === "win32" ? "where" : "which";
  return new Promise((resolve) => {
    const child = spawn(probe, [command], { stdio: "ignore" });
    child.on("close", (code) => resolve(code === 0));
  });
}

async function runAseprite(sourcePath: string): Promise<void> {
  const name = basename(sourcePath).replace(/\.(aseprite|ase)$/i, "");
  await mkdir(outputDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      "aseprite",
      [
        "-b",
        sourcePath,
        "--sheet",
        join(outputDir, `${name}.png`),
        "--data",
        join(outputDir, `${name}.json`),
        "--format",
        "json-array",
        "--list-tags"
      ],
      { stdio: "inherit" }
    );
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Aseprite export failed for ${sourcePath}.`))));
  });
}

try {
  await access(sourceDir);
} catch {
  console.log("No assets/source/sprites directory found. Nothing to export.");
  process.exit(0);
}

if (!(await commandExists("aseprite"))) {
  console.log("Aseprite CLI was not found.");
  console.log("Manual export: File > Export Sprite Sheet, JSON Array, include frame tags, save PNG/JSON to public/assets/exported/sprites.");
  process.exit(0);
}

const files = (await readdir(sourceDir))
  .filter((file) => /\.(aseprite|ase)$/i.test(file))
  .map((file) => join(sourceDir, file));

for (const file of files) {
  await runAseprite(file);
}

console.log(`Exported ${files.length} Aseprite file(s).`);
