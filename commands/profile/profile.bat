@echo off
start "" /B powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\profile.ps1" %*
exit /b 0
