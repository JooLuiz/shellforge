@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\as-admin.ps1" %*
exit /b %ERRORLEVEL%
