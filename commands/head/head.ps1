. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Head"
$lineCount = 10
$argumentIndex = 0

if ($args.Count -gt 0 -and $args[0] -eq "-n") {
    if ($args.Count -lt 2) {
        Write-CommandError -CommandName $commandName -Message "Option -n requires a line count."
    }
    if (-not [int]::TryParse($args[1], [ref]$lineCount) -or $lineCount -lt 0) {
        Write-CommandError -CommandName $commandName -Message "Invalid line count: $($args[1])"
    }
    $argumentIndex = 2
}

if ($argumentIndex -ge $args.Count) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: file path."
}

$filePath = $args[$argumentIndex]
if (-not (Test-Path -LiteralPath $filePath)) {
    Write-CommandError -CommandName $commandName -Message "File not found: $filePath"
}

Get-Content -LiteralPath $filePath -TotalCount $lineCount
exit 0
