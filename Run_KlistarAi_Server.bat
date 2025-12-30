@echo off
title KlistarAi Server Launcher
color 0A
echo.
echo ========================================================
echo               KLISTAR AI SERVER LAUNCHER
echo ========================================================
echo.
echo [1/3] Navigating to Project Directory...
cd /d "d:\ada_v2-main\ada_v2-main"

echo [1.5/3] Cleaning up previous instances...
taskkill /F /IM python.exe >nul 2>&1

echo [2/3] Checking environment...
python --version

echo [3/3] Starting Server...
echo.
echo Server will be available at: http://localhost:8000
echo.
echo --------------------------------------------------------
echo           LOGS (Close window to stop server)
echo --------------------------------------------------------

python backend/server.py

echo.
echo Server stopped.
pause
