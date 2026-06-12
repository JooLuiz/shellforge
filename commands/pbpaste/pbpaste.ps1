. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Pbpaste"

if ($args.Count -gt 0) {
    Write-CommandError -CommandName $commandName -Message "This command does not accept arguments."
}

try {
    $clipboardContent = Get-Clipboard -Raw
}
catch {
    Write-CommandError -CommandName $commandName -Message "Unable to read clipboard contents."
}

if ([string]::IsNullOrEmpty($clipboardContent)) {
    Write-CommandError -CommandName $commandName -Message "Clipboard is empty."
}

Write-Output $clipboardContent
exit 0
