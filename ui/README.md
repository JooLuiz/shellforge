# Desktop UI (`ui/`)

This folder contains the Electron desktop manager for:

- pre-defined commands (`reinitialize`, `touch`, `action-runner`)
- custom actions (`config/config.json` -> `actionRunner`)
- scheduled tasks (`scheduled-tasks/*.ps1`, excluding the example file)

## UX behavior

- The app has three tabs: `Pre-defined Commands`, `Custom Actions`, and `Scheduled Tasks`.
- Dashed list separators render only between adjacent rows (no top dash on first row and no bottom dash on last row).
- App chrome is fixed (`window header`, `tab header`, and `footer`) while only tab list content scrolls.
- `New Action` and `New Schedule` CTAs are rendered in the tab header area.
- Alias inputs in predefined/custom rows use a placeholder-style grey state when alias equals the canonical command/action name.
- Edit modals auto-save after 10 seconds without field changes and also support explicit save.
- Create modals save only when the user clicks `Save`.
- Edit modal save button states follow: `Save` -> `Saving...` -> `Saved`.
- Custom action CLI exposure is stored as `availableOnCLI` in `config.ui.customActions`.
- Custom Actions rows keep `Available on CLI` right-aligned, remove per-row step counts, and align `Run Now`/`Command alias` controls on the right side.
- Custom actions editor supports flow-canvas `+` insertion nodes, richer field editors (list/object/JSON), and keeps canvas/details in a two-column layout.
- Scheduled task modal keeps a two-column layout with `Task Name`/`Command`/`Hours` on the left and `Days of week` on the right.
- Scheduled task weekday checkboxes are rendered in a single, left-aligned column.
- `New Action` and `New Schedule` create-request tokens are consumed after modal open, so switching tabs does not reopen create modals automatically.
- Scheduled task modal command selection uses custom action aliases with optional custom command fallback.
- Scheduled task parser accepts both `$triggerTimes = @(...)` and legacy `$triggerTime = "HH:mm"` formats.
- Scheduled task row toggles execute the corresponding `scheduled-tasks/*.ps1` script:
  - toggle ON: runs the script to register/update the Windows scheduled task
  - toggle OFF: runs the same script with `-Remove`

## Tech stack

- Electron + electron-vite
- React + TypeScript
- React Flow (visual action flow)

## Renderer styles

- The renderer stylesheet entrypoint is `src/renderer/styles/index.css`.
- Styles are organized by domain under `src/renderer/styles/` (`base`, `layout`, `components`, `custom-actions`, `scheduled`, `editors`, `responsive`) and imported in a fixed order to preserve cascade behavior.

## Run locally

From repository root:

```powershell
npm run ui:dev
```

or directly:

```powershell
npm run dev --prefix ui
```

## Build

```powershell
npm run ui:build
```

## Test

```powershell
npm run ui:test
```

## Notes

- The app writes only inside:
  - `config/config.json`
  - `scheduled-tasks/*.ps1`
  - a managed block in `$PROFILE` delimited by:
    - `# === windows-custom-commands:BEGIN (managed - do not edit) ===`
    - `# === windows-custom-commands:END ===`
- Content outside the managed block is preserved.
