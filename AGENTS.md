# AGENTS.md

## Repository Expectations

- Use `npm run check` as the full verification command before merging TypeScript, content, or build changes.
- Keep game runtime code in `src/game` decoupled from content export scripts in `scripts`.
- Preserve strict TypeScript behavior; avoid weakening types or adding broad `any` types unless there is a narrow interop reason.
- Treat files under `public/assets/exported` as generated/exported content. Prefer fixing source content or export scripts when practical.

## Review Guidelines

- Flag player-control, collision, animation, camera, and render-loop regressions as high priority when they can break normal gameplay.
- Check LDtk and sprite atlas loading changes against the validation flow; content schema drift should be caught by `npm run validate:content`.
- Watch for browser-only assumptions in shared code and for async loading paths that can leave the game in a partially initialized state.
- Verify new entity/content contracts are documented in `docs/` when they affect level design or exported assets.
- Treat failing `npm run check` or missing coverage for risky game-state changes as a review blocker.
