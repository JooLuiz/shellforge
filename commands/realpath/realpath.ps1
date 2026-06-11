. "$PSScriptRoot\..\..\command-lib\ShellForge.CommandLib.ps1"

$commandName = "Realpath"

if ($args.Count -lt 1) {
    Write-CommandError -CommandName $commandName -Message "Missing required argument: path."
}

try {
    $resolvedPath = Resolve-RepoRelativePath -PathValue $args[0]
    Write-Output $resolvedPath
}
catch {
    Write-CommandError -CommandName $commandName -Message "Invalid path: $($args[0])"
}

exit 0
