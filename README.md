# Crawling Roy

Browser 2D platformer content pipeline scaffold using TypeScript, Vite, LDtk exports, and Aseprite sprite-sheet exports.

## Prerequisites

- Node.js 20 or newer
- npm
- LDtk for editing `assets/source/levels/*.ldtk`
- Aseprite for editing `assets/source/sprites/*.aseprite`
- Git LFS for binary art files

## Setup

```bash
npm install
npm run dev
```

Open the Vite URL and the demo loads `Level_01` from `public/assets/exported/levels/starter.ldtk.json`.

## Commands

- `npm run dev` starts the browser demo.
- `npm run build` type-checks and builds the app.
- `npm run validate:content` validates the sample level, sprite atlases, and invalid fixtures.
- `npm run export:art` exports Aseprite files when the Aseprite CLI is installed.
- `npm run check` validates content and builds.

## Content Pipeline

Designers edit LDtk source files under `assets/source/levels` and export JSON to `public/assets/exported/levels`. Artists edit Aseprite source files under `assets/source/sprites` and export PNG/JSON to `public/assets/exported/sprites`. The game loads only exported runtime assets.

## Structure

- `src/game/content` loaders, parsers, runtime types, and validation
- `src/game/ldtk` LDtk-specific raw types, field readers, and entity registry
- `src/game/renderer` canvas debug demo renderer
- `public/assets/exported` browser-loaded level and sprite exports
- `assets/source` editable human-owned source assets
- `docs` human workflow documentation

## Docs

- [Content pipeline](docs/content-pipeline.md)
- [Level design](docs/level-design.md)
- [Art pipeline](docs/art-pipeline.md)
- [Entity contract](docs/entity-contract.md)
- [Troubleshooting](docs/troubleshooting.md)
