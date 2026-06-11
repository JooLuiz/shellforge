. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Kill Port"
$forceKill = $false
$portValue = 0
$argumentIndex = 0

while ($argumentIndex -lt $args.Count) {
    $currentArgument = $args[$argumentIndex]
    if ($currentArgument -eq "-f") {
        $forceKill = $true
        $argumentIndex++
        continue
    }

    if (-not [int]::TryParse($currentArgument, [ref]$portValue) -or $portValue -le 0) {
        Write-CommandError -CommandName $commandName -Message "Invalid port: $currentArgument"
    }
    break
}

if ($portValue -le 0) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: port."
}

$processIds = Get-ListeningProcessIdsForPort -Port $portValue
if ($processIds.Count -eq 0) {
    Write-CommandError -CommandName $commandName -Message "No process is listening on port $portValue."
}

foreach ($processId in $processIds) {
    try {
        if ($forceKill) {
            Stop-Process -Id $processId -Force -ErrorAction Stop
        }
        else {
            Stop-Process -Id $processId -ErrorAction Stop
        }
    }
    catch {
        Write-CommandError -CommandName $commandName -Message "Failed to stop process $processId on port $portValue."
    }
}

exit 0
