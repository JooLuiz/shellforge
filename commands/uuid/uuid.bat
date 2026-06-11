@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\uuid.ps1" %*
exit /b %ERRORLEVEL%
