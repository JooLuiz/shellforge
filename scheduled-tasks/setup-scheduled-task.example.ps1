param(
    [switch]$Remove
)

# Replace with your desired task name
$TaskName = "YourTaskName"

if ($Remove) {
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[SUCCESS] - Scheduled task '$TaskName' has been removed." -ForegroundColor Green
    } else {
        Write-Host "[INFO] - Scheduled task '$TaskName' does not exist, nothing to remove." -ForegroundColor Yellow
    }
    return
}

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
    Write-Host "[ERROR] - This script must be run as Administrator. Right-click PowerShell and select 'Run as administrator'." -ForegroundColor Red
    return
}

$profilePath = $PROFILE.CurrentUserCurrentHost

# Replace with the times you want the task to trigger (24h format)
$triggerTimes = @("08:00", "12:00", "13:00", "17:00")

# Replace with the days of the week you want the task to run
$weekdays = @(
    [System.DayOfWeek]::Monday,
    [System.DayOfWeek]::Tuesday,
    [System.DayOfWeek]::Wednesday,
    [System.DayOfWeek]::Thursday,
    [System.DayOfWeek]::Friday
)

$triggers = @()
foreach ($time in $triggerTimes) {
    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $weekdays -At $time
    $triggers += $trigger
}

# Replace {{YOUR_COMMAND_HERE}} with the command you want to run (e.g. a function or alias from your $PROFILE)
$actionArguments = "-NoProfile -ExecutionPolicy Bypass -Command `". '$profilePath'; {{YOUR_COMMAND_HERE}}`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $actionArguments

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[INFO] - Existing task '$TaskName' removed. Recreating..." -ForegroundColor Yellow
}

Register-ScheduledTask `
    -TaskName $TaskName `
    -Trigger $triggers `
    -Action $action `
    -Settings $settings `
    -Principal $principal `
    -Description "Runs '{{YOUR_COMMAND_HERE}}' at specified times on selected weekdays." | Out-Null

$registeredTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($registeredTask) {
    Write-Host ""
    Write-Host "[SUCCESS] - Scheduled task '$TaskName' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Task Name : $TaskName"
    Write-Host "  Triggers  : $($triggerTimes -join ', ') ($($weekdays -join ', '))"
    Write-Host "  Command   : {{YOUR_COMMAND_HERE}}"
    Write-Host "  Profile   : $profilePath"
    Write-Host ""
    Write-Host "You can verify it with: Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] - Failed to create the scheduled task." -ForegroundColor Red
}
