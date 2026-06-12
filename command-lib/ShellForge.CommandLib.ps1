function Write-CommandError {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName,

        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    Write-Error "[ERROR] - [$CommandName] - $Message"
    exit 1
}

function Get-CommandLabel {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName
    )

    return $CommandName
}

function Get-RemainingArgumentString {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    if ($Arguments.Count -eq 0) {
        return ""
    }

    return ($Arguments | ForEach-Object {
        if ($_ -match '\s|"') {
            '"' + ($_ -replace '"', '""') + '"'
        }
        else {
            $_
        }
    }) -join ' '
}

function Get-ShellForgeProfilePath {
    $profilePath = $PROFILE.CurrentUserCurrentHost
    if ([string]::IsNullOrWhiteSpace($profilePath)) {
        return $null
    }

    if (-not (Test-Path -LiteralPath $profilePath)) {
        return $null
    }

    return $profilePath
}

function Import-ShellForgeProfileIfNeeded {
    if ($script:ShellForgeProfileImported) {
        return
    }

    $profilePath = Get-ShellForgeProfilePath
    if ($null -eq $profilePath) {
        return
    }

    . $profilePath
    $script:ShellForgeProfileImported = $true
}

function Invoke-ShellForgeCommandString {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandString
    )

    if ([string]::IsNullOrWhiteSpace($CommandString)) {
        return
    }

    Import-ShellForgeProfileIfNeeded
    Invoke-Expression $CommandString
}

function Get-ShellForgeProfileCommandArgument {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandString
    )

    $profilePath = Get-ShellForgeProfilePath
    if ($null -eq $profilePath) {
        return $CommandString
    }

    $escapedProfilePath = $profilePath.Replace("'", "''")
    return ". '$escapedProfilePath'; $CommandString; exit `$LASTEXITCODE"
}

function Resolve-RepoRelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PathValue
    )

    if ([System.IO.Path]::IsPathRooted($PathValue)) {
        return [System.IO.Path]::GetFullPath($PathValue)
    }

    return [System.IO.Path]::GetFullPath((Join-Path -Path (Get-Location) -ChildPath $PathValue))
}

function Get-ListeningProcessIdsForPort {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if (-not $connections) {
        return @()
    }

    return $connections |
        Select-Object -ExpandProperty OwningProcess -Unique |
        Where-Object { $_ -gt 0 }
}

function Import-ShellForgeCommandLib {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptRoot
    )

    $libraryPath = Join-Path -Path $ScriptRoot -ChildPath "..\..\command-lib\ShellForge.CommandLib.ps1"
    . $libraryPath
}
