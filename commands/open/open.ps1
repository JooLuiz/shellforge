. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Open"
$target = if ($args.Count -gt 0) { $args[0] } else { "." }

try {
    Start-Process -FilePath $target
}
catch {
    Write-CommandError -CommandName $commandName -Message "Failed to open target: $target"
}

exit 0
