# Command Library

Shared PowerShell helpers for ShellForge predefined commands.

## Entry point

- [`ShellForge.CommandLib.ps1`](ShellForge.CommandLib.ps1) — error formatting, argument quoting, path helpers, and port lookup utilities.

## Usage

Each predefined command script dot-sources the library from its own folder:

```powershell
. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"
```

## Helpers

| Function | Purpose |
| --- | --- |
| `Write-CommandError` | Prints `[ERROR] - [Command] - message` and exits with code `1` |
| `Get-RemainingArgumentString` | Quotes and joins trailing CLI arguments for `watch`, `as-admin`, and `hidden` |
| `Resolve-RepoRelativePath` | Resolves relative or absolute paths from the current directory |
| `Get-ListeningProcessIdsForPort` | Returns process IDs listening on a TCP port |

## Tests

Integration smoke tests live in [`tests/predefinedCommands.integration.test.js`](tests/predefinedCommands.integration.test.js).
