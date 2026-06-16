# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-06-16

### Changed

- Project license updated to GNU Affero General Public License v3.0 (AGPL-3.0-only); root, UI, and page `package.json` license fields now reflect AGPL.
- Replaced root `LICENSE` with the official AGPLv3 text and `Copyright (C) 2026 João Luiz de Castro`.
- Added license sections to [README.md](README.md) (English) and [README.pt-br.md](README.pt-br.md) (Portuguese).
- Added AGPL copyright headers to ShellForge entry points and core runtime sources (Electron main/preload/renderer, docs site entry, action-runner, utils, and command library).

## [1.0.6] - 2026-06-12

### Fixed

- `action-runner.bat` now runs `cd /d "%~dp0"` before invoking Node, so CLI aliases work from any terminal working directory (matching Run Now spawn behavior).

## [1.0.5] - 2026-06-12

### Fixed

- First packaged app launch sets User `SHELLFORGE_USER_DATA` to `%APPDATA%/ShellForge/shellforge-data/` when not already defined, aligning CLI with the desktop app.
- CLI user-data resolution falls back to the AppData path for packaged installs when the runtime install dir has no config, even before `config.json` exists.

## [1.0.3] - 2026-06-12

### Fixed

- CLI custom actions now resolve user data from `%APPDATA%/ShellForge/shellforge-data/` when `SHELLFORGE_USER_DATA` is not set, fixing profile aliases such as `lancar-horas` on packaged installs.

## [1.0.2] - 2026-06-12

### Fixed

- Packaged app **Run Now** for custom actions failed with "path not found" because action-runner was spawned with user-data as the working directory; spawn now uses the action-runner install directory while config still loads from AppData.
- Hardened `action-runner.bat` to resolve `shellforge-node.cmd` to a fully qualified path before execution (CLI reliability from arbitrary working directories).
- Packaged user-data path now stores config, scheduled tasks, and browser profiles under `%APPDATA%/ShellForge/shellforge-data/` instead of `%APPDATA%/shellforge-ui/`.
- Scheduled Tasks tab now warns and disables ON/OFF toggles when ShellForge is not running as Administrator; toggle/save sync failures due to missing elevation are surfaced instead of failing silently.
- Scheduled task names are restricted to ASCII letters, numbers, spaces, hyphens, and underscores; invalid names show row/modal validation errors, toggles are disabled, and enable failures surface explicit registration errors instead of silently staying off.
- Docs site mobile layout: sticky header with menu drawer, no page-level horizontal scroll, compact content blocks, and js-pretty-icons sun/moon theme toggle.

### Changed

- Electron `appId` and Windows App User Model ID updated to `app.shellforge`.

## [1.0.1] - 2026-06-11

### Fixed

- Adjusting Release Windows action and removing Create Tag and Release action.

## [1.0.0] - 2026-06-11

### Added

- ShellForge desktop manager for custom actions, scheduled tasks, and predefined commands.
- Visual custom action editor with flow graph, scoped block navigation, step details panel, and validation banners.
- Run-action modal with argument inputs inferred from the action schema.
- Scheduled task editor with command builder, trigger-time picker, weekday selection, and search.
- Predefined commands tab with category filters and enable/disable toggles.
- Theme support (light/dark) with persisted preference.
- Application menu (File / View / Help) with keyboard shortcuts for creating custom actions and scheduled tasks.
- Locale support (English and Portuguese) for menu labels, app UI copy, and delete confirmation modals.
- Shared `formatMessage` helper for i18n template interpolation (e.g. `{itemName}` in titles).
- Profile health banner when PowerShell profile setup needs attention.
- Windows NSIS installer build pipeline and GitHub Actions release workflow for desktop builds.
- Restructured action runner with modular step handlers and expanded test coverage.
- Browser automation steps: navigate, click, type, wait for page state, set web storage, for-each element, and close browser.
- Control-flow steps: forEach, if/else, try/catch, and wait.
- Integration steps: API request, shell command, write file, invoke action, set variable, and get arguments.
- Context interpolation for step fields using `{{context.*}}` and `{{env.*}}` templates.
- Shared PowerShell command library for predefined command integration tests.
- New Unix-parity CLI commands: head, tail, watch, which, mkdirp, open, pbcopy, pbpaste, realpath, uuid, and git-root.
- New Windows utility CLI commands: kill-port, as-admin, and hidden.
- New shell lifecycle CLI commands: reload-env and profile.
- Documentation site deploy workflow and test workflows with coverage gates.
- README updates for desktop install, command layout, and the documentation site.
- API Request step support for HEAD and OPTIONS HTTP methods in the editor and runtime.
- ForEach step support for context-backed lists via `{{context.path}}` or `{{env.VAR}}` templates.
- Shared delete confirmation modal for custom actions and scheduled tasks.
- Footer and in-app http(s) links open in the system default browser instead of a new Electron window.
- Expanded UI test suite with coverage gate for renderer and shared modules.
- Dedicated tests for the delete confirmation hook, modal component, and context variable inference edge cases.
- Expanded `scheduledTaskCommand` test coverage included in the UI coverage gate.
- ESLint configuration for root and UI packages.

### Changed

- Moved the legacy action runner into `commands/action-runner/`; profile aliases now point at `commands/{name}/` launchers.
- Split custom action constants into focused modules for easier maintenance.
- Decomposed the action editor into lifecycle, validation, flow graph/scope hooks, and shared editor context.
- Wired application menu "New …" actions to the active tab through AppCommandBridge.
- Reordered API Request method dropdown so common verbs appear first and HEAD/OPTIONS appear last.
- Hid the API Request body field for GET, HEAD, and OPTIONS methods.
- Replaced scheduled task delete `window.confirm` with the in-app confirmation modal.
- Delete confirmation modal resolves copy from i18n via a `variant` prop (`customAction` / `scheduledTask`) instead of hardcoded English strings in each tab.
- Delete confirmation modal uses neutral `button-ghost` styling for Cancel and destructive `button-red` styling for Delete.
- Delete failures surface inside the confirmation modal via an in-modal error banner, wired from tab-level error state.
- Locale push events use the shared `IPC_CHANNELS.localeChanged` constant across main process, preload, and tests.
- UI coverage exclusions narrowed: `scheduledTaskCommand.ts`, `contextVarInference.ts`, and `useDeleteConfirmModal.ts` are no longer excluded from the coverage gate.

### Fixed

- Custom Actions tab import paths for AppCommandBridge and i18n.
- JsonFieldEditor now persists bare interpolation templates (for example `{{context.userIds}}`) when JSON parsing fails.
- ForEach now throws a clear error when an interpolated list is not an array after resolution.
- Delete confirmation modal ignores rapid double-clicks while a delete request is in flight (ref-based synchronous guard in `useDeleteConfirmModal`).

## [0.1.5] - 2024-07-01

### Fixed

- Adjusting invalid characters issue in release tag flow

## [0.1.4] - 2024-07-01

### Fixed

- Adjusting the release tag release notes message

## [0.1.3] - 2024-07-01

### Added

- Updating the github actions to use the latest github recommendations

## [0.1.2] - 2024-07-01

### Added

- Creating a new github action to validate the PR required fields.

## [0.1.1] - 2024-07-01

### Added

- Enhancing github action to include the release notes in the release.

## [0.1.0] - 2024-06-30

### Added

- Implementing a more visual scheduler.

## [0.0.2] - 2024-05-18

### Added

- Implemented command "reinitialize", that reinitializes your powershell.

## [0.0.1] - 2024-05-18

### Added

- Implemented shell command "login", that logs in a site.

- Implemented shell command "touch" to be window's equivalent to Unix's touch command.
