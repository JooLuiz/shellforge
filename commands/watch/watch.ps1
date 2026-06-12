. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Watch"
$intervalSeconds = 2
$argumentIndex = 0

if ($args.Count -gt 0 -and $args[0] -eq "-n") {
    if ($args.Count -lt 2) {
        Write-CommandError -CommandName $commandName -Message "Option -n requires an interval in seconds."
    }
    if (-not [double]::TryParse($args[1], [ref]$intervalSeconds) -or $intervalSeconds -le 0) {
        Write-CommandError -CommandName $commandName -Message "Invalid interval: $($args[1])"
    }
    $argumentIndex = 2
}

if ($argumentIndex -ge $args.Count) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: command to watch."
}

$commandArguments = $args[$argumentIndex..($args.Count - 1)]
$commandString = Get-RemainingArgumentString -Arguments $commandArguments

while ($true) {
    Clear-Host
    Write-Output "watch: $commandString"
    Write-Output ("-" * 60)
    try {
        Invoke-ShellForgeCommandString -CommandString $commandString
    }
    catch {
        Write-Error $_.Exception.Message
        exit 1
    }

    if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    Start-Sleep -Seconds $intervalSeconds
}
