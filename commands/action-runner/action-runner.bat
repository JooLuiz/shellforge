@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

set JS_FILE="%~dp0\action-runner.js"

set "hasAction="
set "normalizedArgs="

:argLoop
if "%~1"=="" goto :argLoopEnd

if /I "%~1"=="-a" (
  if "%~2"=="" (
    echo [ERROR] - [Action Runner] - The parameter -a requires an action name.
    exit /b 1
  )
  set "hasAction=true"
  set "normalizedArgs=!normalizedArgs! --action=%~2"
  shift
  shift
  goto :argLoop
)

if /I "%~1"=="--action" (
  if "%~2"=="" (
    echo [ERROR] - [Action Runner] - The parameter --action requires an action name.
    exit /b 1
  )
  set "hasAction=true"
  set "normalizedArgs=!normalizedArgs! --action=%~2"
  shift
  shift
  goto :argLoop
)

set "currentArg=%~1"
echo !currentArg! | findstr /B /C:"--action=" /C:"action=" >nul 2>&1
if !errorlevel! equ 0 set "hasAction=true"

set "normalizedArgs=!normalizedArgs! %1"
shift
goto :argLoop

:argLoopEnd

if not defined hasAction (
  echo [ERROR] - [Action Runner] - Missing the mandatory parameter --action or -a.
  exit /b 1
)

set "NODE_WRAPPER=%~dp0..\..\utils\shellforge-node.cmd"
for %%I in ("%NODE_WRAPPER%") do set "NODE_WRAPPER=%%~fI"
call "%NODE_WRAPPER%" %JS_FILE%!normalizedArgs!

exit /b %errorlevel%
