. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Reload Env"

if ($args.Count -gt 0) {
    Write-CommandError -CommandName $commandName -Message "This command does not accept arguments."
}

function Get-MergedPathValue {
    param(
        [System.EnvironmentVariableTarget]$Target
    )

    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)

    $pathSegments = @()
    if (-not [string]::IsNullOrWhiteSpace($machinePath)) {
        $pathSegments += $machinePath.Split(";") | Where-Object { $_.Trim().Length -gt 0 }
    }
    if (-not [string]::IsNullOrWhiteSpace($userPath)) {
        $pathSegments += $userPath.Split(";") | Where-Object { $_.Trim().Length -gt 0 }
    }

    return ($pathSegments -join ";")
}

$env:Path = Get-MergedPathValue
Write-Output "PATH refreshed for the current session."
exit 0
