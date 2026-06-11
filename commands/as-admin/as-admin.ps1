. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "As Admin"

if ($args.Count -lt 1) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: command to run."
}

$commandString = Get-RemainingArgumentString -Arguments $args
$profileCommand = Get-ShellForgeProfileCommandArgument -CommandString $commandString

try {
    $elevatedProcess = Start-Process -FilePath "powershell.exe" -ArgumentList @(
        "-ExecutionPolicy", "Bypass",
        "-Command", $profileCommand
    ) -Verb RunAs -Wait -PassThru

    if ($null -ne $elevatedProcess) {
        exit $elevatedProcess.ExitCode
    }
}
catch {
    Write-CommandError -CommandName $commandName -Message "Failed to run command as administrator."
}

exit 0
