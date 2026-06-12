. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Profile"

if ($args.Count -gt 0) {
    Write-CommandError -CommandName $commandName -Message "This command does not accept arguments."
}

$profilePath = $PROFILE.CurrentUserCurrentHost
if ([string]::IsNullOrWhiteSpace($profilePath)) {
    Write-CommandError -CommandName $commandName -Message "Unable to resolve PowerShell profile path."
}

$profileDirectory = Split-Path -Path $profilePath -Parent
if (-not (Test-Path -LiteralPath $profileDirectory)) {
    New-Item -ItemType Directory -Path $profileDirectory -Force | Out-Null
}

if (-not (Test-Path -LiteralPath $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force | Out-Null
}

$editorCandidates = @(
    $env:EDITOR,
    $env:VISUAL,
    "code",
    "notepad"
) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }

foreach ($editorCommand in $editorCandidates) {
    $resolvedEditor = Get-Command -Name $editorCommand -ErrorAction SilentlyContinue
    if ($resolvedEditor) {
        Start-Process -FilePath $resolvedEditor.Source -ArgumentList $profilePath
        exit 0
    }
}

Write-CommandError -CommandName $commandName -Message "No supported editor found. Set EDITOR or install VS Code."
