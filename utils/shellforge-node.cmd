@echo off
setlocal
set "NODE_EXE=node"
if exist "%~dp0..\nodejs\node.exe" set "NODE_EXE=%~dp0..\nodejs\node.exe"
"%NODE_EXE%" %*
exit /b %ERRORLEVEL%
