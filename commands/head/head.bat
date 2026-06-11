@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\head.ps1" %*
exit /b %ERRORLEVEL%
