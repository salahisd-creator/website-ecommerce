@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo === ISD order server ===
set /p ADMIN_PASSWORD=Type the admin password then press Enter: 
echo.
node server.js
pause
