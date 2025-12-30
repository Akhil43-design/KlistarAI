@echo off
title Stop Server
color 0C
echo.
echo Stopping KlistarAi Server...
echo.
REM Kill all Python processes including child processes (/T)
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM py.exe /T 2>nul

echo.
echo ========================================================
echo               SERVER STOPPED
echo ========================================================
echo.
echo (If you see "The process ... not found", it was already stopped)
echo.
pause
