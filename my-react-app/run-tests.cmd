@echo off
cd /d "%~dp0"
echo Running server tests...
node --test tests/server.test.js
pause
