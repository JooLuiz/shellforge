. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Uuid"
$suppressNewLine = $args -contains "-n"
$generatedUuid = [guid]::NewGuid().ToString()

if ($suppressNewLine) {
    Write-Host -NoNewline $generatedUuid
}
else {
    Write-Output $generatedUuid
}

exit 0
