@echo off
echo Starting Ottoman Archive Application...
cd /d "%~dp0"
call npm.cmd run dev
pause
