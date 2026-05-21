@echo off
setlocal enabledelayedexpansion

set JS_FILE="%~dp0\browser-automation.js"

set argCount=0
set isVerbose=
set "hasAction="
set actionIndex =0

for %%x in (%*) do (
  set /A argCount+=1
  set "argVec[!argCount!]=%%~x"

  if "%%~x"=="-v" (
    set isVerbose=true
  ) else if "%%~x"=="--verbose" (
    set isVerbose=true
  )

  if "%%~x"=="-a" (
    set "hasAction=%%x"
    set /A actionIndex=!argCount!+1
  ) else if "%%~x"=="--action" (
    set "hasAction=%%x"
    set /A actionIndex=!argCount!+1
  )
)

if defined hasAction (
  call set "action_value=action=%%argVec[%actionIndex%]%%"
) else (
  echo [ERROR] - [Browser Automation] - Missing the mandatory parameter --action or -a.
  exit
)

if defined isVerbose (
  echo [INFO] - [Browser Automation] - Verbose mode activated.
  node %JS_FILE% --verbose "%action_value%"
) else (
  node %JS_FILE% "%action_value%"
)

exit
