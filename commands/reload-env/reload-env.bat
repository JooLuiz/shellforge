@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\reload-env.ps1" %*
exit /b %ERRORLEVEL%
