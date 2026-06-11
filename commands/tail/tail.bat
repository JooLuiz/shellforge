@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\tail.ps1" %*
exit /b %ERRORLEVEL%
