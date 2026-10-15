@echo off
title LiveCodeShare Server
cd /d "%~dp0"
echo ========================================================
echo        Starting LiveCodeShare Collaborative Server
echo ========================================================
echo.
node server.js
pause
