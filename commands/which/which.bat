@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\which.ps1" %*
exit /b %ERRORLEVEL%
