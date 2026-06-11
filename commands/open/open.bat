@echo off
start "" /B powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\open.ps1" %*
exit /b 0
