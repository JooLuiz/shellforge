@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\reinitialize.ps1" %*
exit /b %ERRORLEVEL%
