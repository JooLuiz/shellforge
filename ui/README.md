# Desktop UI (`ui/`)

This folder contains the ShellForge Electron desktop manager for:

- pre-defined commands (20 commands; Action Runner is always listed first)
- custom actions (`config/config.json` -> `actionRunner`)
- scheduled tasks (`scheduled-tasks/*.ps1`, excluding the example file)

## UX behavior

- The app has three tabs: `Pre-defined Commands`, `Custom Actions`, and `Scheduled Tasks`.
- Dashed list separators render only between adjacent rows (no top dash on first row and no bottom dash on last row).
- App chrome is fixed (`window header`, `tab header`, and `footer`) while only tab list content scrolls.
- Footer includes a sun/moon theme toggle (left of external links). Initial mode follows OS `prefers-color-scheme`; user choice is persisted in local storage.
- Theme toggle also syncs native window chrome (title bar controls and default menu bar) through Electron `nativeTheme.themeSource` on Windows.
- `New Action` and `New Schedule` CTAs are rendered in the tab header area.
- Tab header search is available on all tabs and resets when switching tabs.
- Pre-defined Commands tab includes category filter chips in the fixed tab header (not in the scrollable list), mapped internally to command metadata (`Core`, `Shell lifecycle`, `Unix parity`, `Windows utilities`).
- Pre-defined command metadata is centralized in `src/shared/predefinedCommandsRegistry.ts`.
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
- Scheduled task modal command field is a single combobox labeled `Command` (CLI custom action aliases and pre-defined commands; free-text values allowed). Argument fields appear only when the command resolves to a custom action with a `getArguments` step, using schema-defined names (`--arg.*`).
- Scheduled task modal supports structured action arguments (`--arg.*`) and an inline verbose (`-v`) toggle. Verbose applies to both custom actions and free-text commands. Metadata is stored in a `# shellforge:scheduledCommandV1` comment inside generated `.ps1` scripts for edit round-trip.
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
- Styles are organized by domain under `src/renderer/styles/` (`themes`, `base`, `layout`, `components`, `custom-actions`, `scheduled`, `editors`, `responsive`) and imported in a fixed order to preserve cascade behavior.

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

## Package Windows installer

Build the NSIS installer locally on Windows:

```powershell
npm ci
npm ci --prefix ui
npm run ui:dist
```

The installer is written to `ui/dist/ShellForge-Setup.exe`.

Packaged installs store writable user data under `%APPDATA%/ShellForge/shellforge-data/` (`config/config.json`, `scheduled-tasks/`, browser profiles). Read-only runtime files (`commands/`, `command-lib/`, `utils/`, bundled Node, and dependencies) stay under the install directory and are not duplicated into AppData.

The installer bundles **Node.js 22 LTS** under `shellforge-data/nodejs/` (prepared by `ui/scripts/download-node-runtime.mjs` during `npm run prepare:runtime`). [`commands/action-runner`](../../commands/action-runner) uses [`utils/shellforge-node.cmd`](../utils/shellforge-node.cmd), which prefers bundled `node.exe` and falls back to `node` on `PATH` for source/dev installs without a runtime bundle. Expect roughly 50–80 MB added to the installer size.

The desktop UI shows a **PowerShell profile health banner** when the profile path is not writable, execution policy blocks profile scripts, or the managed ShellForge block is missing.

Published installers are attached to [GitHub Releases](https://github.com/JooLuiz/shellforge/releases).

Requirements on end-user machines:

- Windows 10+
- PowerShell profile access for CLI alias registration (the app surfaces remediation steps when checks fail)

## Test

```powershell
npm run ui:test
```

## Notes

- App window icon for dev/preview comes from `resources/icons/shell-forge-mark.ico` (Windows) and `resources/icons/shell-forge-mark.png` (Linux).
- Regenerate native icons after logo changes with `npm run generate:icons`.
- In dev/preview, Windows may still show `electron.exe` as the process name in Task Manager; the window and taskbar icon should still use ShellForge.
- The app writes only inside:
  - `config/config.json`
  - `scheduled-tasks/*.ps1`
  - a managed block in `$PROFILE` delimited by:
    - `# === shellforge:BEGIN (managed - do not edit) ===`
    - `# === shellforge:END ===`
- Content outside the managed block is preserved.
