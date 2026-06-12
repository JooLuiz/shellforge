. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Mkdirp"

if ($args.Count -lt 1) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: directory path."
}

foreach ($directoryPath in $args) {
    try {
        New-Item -ItemType Directory -Path $directoryPath -Force | Out-Null
    }
    catch {
        Write-CommandError -CommandName $commandName -Message "Failed to create directory: $directoryPath"
    }
}

exit 0
