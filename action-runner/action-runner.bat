@echo off
setlocal enabledelayedexpansion

set JS_FILE="%~dp0\action-runner.js"

set "hasAction="
set argCount=0
set actionIndex=0

for %%x in (%*) do (
  set /A argCount+=1
  set "argVec[!argCount!]=%%~x"

  if "%%~x"=="-a" (
    set "hasAction=true"
    set /A actionIndex=!argCount!+1
  ) else if "%%~x"=="--action" (
    set "hasAction=true"
    set /A actionIndex=!argCount!+1
  )
)

if not defined hasAction (
  echo [ERROR] - [Action Runner] - Missing the mandatory parameter --action or -a.
  exit
)

node %JS_FILE% %*

exit
