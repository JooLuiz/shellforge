. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Which"

if ($args.Count -lt 1) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: command name."
}

$targetCommand = $args[0]
$resolvedCommand = Get-Command -Name $targetCommand -ErrorAction SilentlyContinue

if (-not $resolvedCommand) {
    Write-CommandError -CommandName $commandName -Message "Command not found: $targetCommand"
}

$sourcePath = $resolvedCommand.Source
if ([string]::IsNullOrWhiteSpace($sourcePath)) {
    $sourcePath = $resolvedCommand.Definition
}

Write-Output $sourcePath
exit 0
