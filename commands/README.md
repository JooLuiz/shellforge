# Pre-defined commands

Each subfolder in `commands/` is a Windows CLI command exposed through PowerShell aliases managed by ShellForge.

- Every command folder contains a `{command-name}.bat` entry point and a `{command-name}.ps1` script.
- The ShellForge profile block registers `Set-Alias -Force` entries pointing at each enabled `.bat` launcher.
- `action-runner/` runs custom action flows from `config/config.json`.
- Shared libraries stay at the repository root: `utils/`, `command-lib/`.

After changing aliases in the desktop app, regenerate the profile and run `reinitialize` in PowerShell (or open a new terminal) to reload your session.

ShellForge does not ship `sleep`; use PowerShell's built-in `sleep` alias or `Start-Sleep`.

## Launcher behavior

- **Standard commands** (`uuid`, `touch`, etc.) use a synchronous `.bat` → PowerShell handoff so stdout, stderr, and exit codes stay in your terminal.
- **GUI commands** (`profile`, `open`) use `start /B` in their `.bat` launchers so `cmd.exe` exits immediately after starting PowerShell; this avoids a lingering console window while the editor or default app opens.

## Wrapper commands

- **`watch`** — runs another command repeatedly. Use ShellForge profile commands such as `watch uuid`.
- **`hidden`** — runs a command in a separate hidden PowerShell window. Console output is **not** forwarded to your current terminal. Use it for background tasks, not for commands where you need to see stdout (for example `uuid`).

For privilege and safety notes, see the **Security and privileges** section in the root [`README.md`](../README.md).
