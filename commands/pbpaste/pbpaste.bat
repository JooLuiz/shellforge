@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\pbpaste.ps1" %*
exit /b %ERRORLEVEL%
