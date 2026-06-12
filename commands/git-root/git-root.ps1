. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Git Root"
$shouldChangeDirectory = $args -contains "--cd"
$currentPath = (Get-Location).ProviderPath
if ([string]::IsNullOrWhiteSpace($currentPath)) {
    $currentPath = (Get-Location).Path
}

while ($true) {
    $gitDirectoryPath = Join-Path -Path $currentPath -ChildPath ".git"
    if (Test-Path -LiteralPath $gitDirectoryPath) {
        if ($shouldChangeDirectory) {
            Set-Location -LiteralPath $currentPath
        }
        else {
            Write-Output $currentPath
        }
        exit 0
    }

    $parentPath = Split-Path -Path $currentPath -Parent
    if ([string]::IsNullOrWhiteSpace($parentPath) -or $parentPath -eq $currentPath) {
        break
    }

    $currentPath = $parentPath
}

Write-CommandError -CommandName $commandName -Message "Not inside a Git repository."
