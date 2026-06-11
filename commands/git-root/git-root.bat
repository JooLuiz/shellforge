@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\git-root.ps1" %*
exit /b %ERRORLEVEL%
