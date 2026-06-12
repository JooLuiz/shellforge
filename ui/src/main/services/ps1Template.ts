import type { ScheduledTaskInput } from "../../shared/types";
import { serializeScheduledCommandMetadata } from "../../shared/scheduledTaskCommand";

function mapWeekday(weekday: string): string {
  const normalizedDay = weekday.trim().toLowerCase();
  const mapping: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return mapping[normalizedDay] ?? weekday;
}

export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function buildScheduledTaskFileName(actionName: string): string {
  return `setup-${toKebabCase(actionName)}-task.ps1`;
}

export function generateScheduledTaskScript(input: ScheduledTaskInput): string {
  const triggerTimesLiteral = input.triggerTimes.map((time) => `"${time}"`).join(", ");
  const weekdaysLiteral = input.weekdays
    .map((weekday) => `    [System.DayOfWeek]::${mapWeekday(weekday)}`)
    .join(",\r\n");
  const descriptionTimes = input.triggerTimes.join(", ");
  const descriptionWeekdays = input.weekdays.map((weekday) => mapWeekday(weekday)).join(", ");
  const metadataLine = input.commandMetadata
    ? serializeScheduledCommandMetadata(input.commandMetadata)
    : null;

  return [
    "# managed by ShellForge UI",
    ...(metadataLine ? [metadataLine] : []),
    "param(",
    "    [switch]$Remove",
    ")",
    "",
    `$TaskName = "${input.actionName}"`,
    "",
    "if ($Remove) {",
    "    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue",
    "    if ($existingTask) {",
    "        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false",
    "        Write-Host \"[SUCCESS] - Scheduled task '$TaskName' has been removed.\" -ForegroundColor Green",
    "    } else {",
    "        Write-Host \"[INFO] - Scheduled task '$TaskName' does not exist, nothing to remove.\" -ForegroundColor Yellow",
    "    }",
    "    return",
    "}",
    "",
    "$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(",
    "    [Security.Principal.WindowsBuiltInRole]::Administrator",
    ")",
    "if (-not $isAdmin) {",
    "    Write-Host \"[ERROR] - This script must be run as Administrator. Right-click PowerShell and select 'Run as administrator'.\" -ForegroundColor Red",
    "    exit 1",
    "}",
    "",
    "$profilePath = $PROFILE.CurrentUserCurrentHost",
    `$triggerTimes = @(${triggerTimesLiteral})`,
    "$weekdays = @(",
    weekdaysLiteral,
    ")",
    "",
    "$triggers = @()",
    "foreach ($time in $triggerTimes) {",
    "    $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $weekdays -At $time",
    "    $triggers += $trigger",
    "}",
    "",
    `$actionArguments = "-NoProfile -ExecutionPolicy Bypass -Command \`". '$profilePath'; ${input.command}\`""`,
    "$action = New-ScheduledTaskAction -Execute \"powershell.exe\" -Argument $actionArguments",
    "",
    "$settings = New-ScheduledTaskSettingsSet `",
    "    -AllowStartIfOnBatteries `",
    "    -DontStopIfGoingOnBatteries `",
    "    -StartWhenAvailable `",
    "    -MultipleInstances IgnoreNew",
    "",
    "$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest",
    "",
    "$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue",
    "if ($existingTask) {",
    "    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false",
    "    Write-Host \"[INFO] - Existing task '$TaskName' removed. Recreating...\" -ForegroundColor Yellow",
    "}",
    "",
    "$ErrorActionPreference = 'Stop'",
    "try {",
    "    Register-ScheduledTask `",
    "        -TaskName $TaskName `",
    "        -Trigger $triggers `",
    "        -Action $action `",
    "        -Settings $settings `",
    "        -Principal $principal `",
    `        -Description "Runs '${input.command}' at ${descriptionTimes} on ${descriptionWeekdays}." | Out-Null`,
    "} catch {",
    "    Write-Host \"[ERROR] - Failed to create the scheduled task.\" -ForegroundColor Red",
    "    Write-Host $_.Exception.Message -ForegroundColor Red",
    "    exit 1",
    "}",
    "",
    "$registeredTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue",
    "if ($registeredTask) {",
    "    Write-Host \"\"",
    "    Write-Host \"[SUCCESS] - Scheduled task '$TaskName' created successfully!\" -ForegroundColor Green",
    "    Write-Host \"\"",
    "    Write-Host \"  Task Name : $TaskName\"",
    "    Write-Host \"  Triggers  : $($triggerTimes -join ', ')\"",
    `    Write-Host "  Command   : ${input.command}"`,
    "    Write-Host \"  Profile   : $profilePath\"",
    "    Write-Host \"\"",
    "    Write-Host \"You can verify it with: Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo\" -ForegroundColor Cyan",
    "} else {",
    "    Write-Host \"[ERROR] - Failed to create the scheduled task.\" -ForegroundColor Red",
    "    exit 1",
    "}",
    "",
  ].join("\r\n");
}
