# Art Pipeline

Save editable sprite sources in `assets/source/sprites`. Exported PNG and JSON go to `public/assets/exported/sprites`.

## Animation Tags

Use Aseprite tags for animation names. Standard tags:

- `idle_down`, `idle_up`, `idle_left`, `idle_right`
- `walk_down`, `walk_up`, `walk_left`, `walk_right`
- `attack_down`, `attack_up`, `attack_left`, `attack_right`
- `hurt`, `death`

The current validator requires `idle_down` and `walk_down` for sample atlases.

## Sprite Rules

- Keep a consistent canvas size per character family.
- Keep feet aligned to the same baseline.
- Use transparent backgrounds.
- Do not change frame dimensions after code references the sheet.
- Do not rename tags without telling the programmer.

## Export

Manual export: use Aseprite `File > Export Sprite Sheet`, choose JSON Array, include frame tags, and save PNG/JSON next to each other in `public/assets/exported/sprites`.

CLI export:

```bash
npm run export:art
```

The CLI script is a no-op with instructions if Aseprite is not installed.

## Artist Checklist

- [ ] Source `.aseprite` file is saved in `assets/source/sprites`.
- [ ] PNG export is saved in `public/assets/exported/sprites`.
- [ ] JSON export is saved next to the PNG.
- [ ] Animation tags use approved names.
- [ ] Frame dimensions are consistent.
- [ ] Character feet align to the expected baseline.
- [ ] Transparent background is used.
- [ ] The game loads the sprite without validation errors.
