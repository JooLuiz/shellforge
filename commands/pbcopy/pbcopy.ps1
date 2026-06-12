. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Pbcopy"
$clipboardContent = $null

if ($args.Count -gt 0) {
    $filePaths = @()
    foreach ($argument in $args) {
        if (-not (Test-Path -LiteralPath $argument)) {
            Write-CommandError -CommandName $commandName -Message "File not found: $argument"
        }
        $filePaths += $argument
    }
    $clipboardContent = ($filePaths | ForEach-Object { Get-Content -LiteralPath $_ -Raw }) -join ""
}
elseif (-not [Console]::IsInputRedirected) {
    Write-CommandError -CommandName $commandName -Message "No input provided. Pipe content or pass file paths."
}
else {
    $clipboardContent = [Console]::In.ReadToEnd()
}

if ([string]::IsNullOrEmpty($clipboardContent)) {
    Write-CommandError -CommandName $commandName -Message "Clipboard input is empty."
}

Set-Clipboard -Value $clipboardContent
exit 0
