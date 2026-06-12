@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\hidden.ps1" %*
exit /b %ERRORLEVEL%
