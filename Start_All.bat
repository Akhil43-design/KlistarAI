@echo off
title KlistarAi - All Systems Launcher
color 0B

echo ========================================================
echo             KLISTAR AI SYSTEM LAUNCHER
echo ========================================================
echo.

:: 1. Cleanup
echo [1/4] Cleaning up previous Python instances...
taskkill /F /IM python.exe >nul 2>&1

:: 2. Environment Setup
echo [1.5/4] Checking Environment...
where conda >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Conda detected. Running with 'ada_v2' environment.
    set "CMD_PREFIX=call conda activate ada_v2 && "
) else (
    echo [INFO] Conda NOT detected. Running with system Python/Node.
    set "CMD_PREFIX="
)

:: 3. Start Backend
echo [2/4] Starting Backend Server...
start "KlistarAi Backend" cmd /k "cd /d d:\ada_v2-main\ada_v2-main && %CMD_PREFIX%python backend/server.py"

:: 4. Start Desktop App
echo [3/4] Starting Desktop Application...
start "KlistarAi Desktop" cmd /k "cd /d d:\ada_v2-main\ada_v2-main && %CMD_PREFIX%npm run dev"

:: 5. Start Mobile App (Hosted)
echo [4/4] Starting Mobile Application (Networked)...
start "KlistarAi Mobile" cmd /k "cd /d d:\ada_v2-main\ada_v2-main\mobile_version && %CMD_PREFIX%npm run dev -- --host"

echo.
echo ========================================================
echo SYSTEM STARTUP INITIATED
echo.
echo 1. Backend: http://localhost:8000
echo 2. Desktop: Launching Window...
echo 3. Mobile:  Check the 'KlistarAi Mobile' window for the IP URL
echo.
echo Launching Google Chrome in 5 seconds...
timeout /t 5 /nobreak >nul
start chrome "http://localhost:5173"

echo.
echo You can close this launcher window (the apps will stay open).
echo ========================================================
pause
