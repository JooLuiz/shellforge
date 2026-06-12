. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Hidden"

if ($args.Count -lt 1) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: command to run."
}

$commandString = Get-RemainingArgumentString -Arguments $args
$profileCommand = Get-ShellForgeProfileCommandArgument -CommandString $commandString

try {
    $hiddenProcess = Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-ExecutionPolicy", "Bypass",
        "-Command", $profileCommand
    ) -WindowStyle Hidden -Wait -PassThru

    if ($null -ne $hiddenProcess) {
        exit $hiddenProcess.ExitCode
    }
}
catch {
    Write-CommandError -CommandName $commandName -Message "Failed to run hidden command."
}

exit 0
