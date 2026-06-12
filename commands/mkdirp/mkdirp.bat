@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0\mkdirp.ps1" %*
exit /b %ERRORLEVEL%
