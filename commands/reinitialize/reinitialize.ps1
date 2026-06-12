. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Reinitialize"

if ($args.Count -gt 0) {
    Write-CommandError -CommandName $commandName -Message "This command does not accept arguments."
}

$profilePath = $PROFILE.CurrentUserCurrentHost
if ([string]::IsNullOrWhiteSpace($profilePath)) {
    Write-CommandError -CommandName $commandName -Message "Unable to resolve PowerShell profile path."
}

if (-not (Test-Path -LiteralPath $profilePath)) {
    Write-CommandError -CommandName $commandName -Message "Profile file does not exist: $profilePath"
}

. $profilePath
Write-Output "Profile reloaded: $profilePath"
exit 0
