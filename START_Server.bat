@echo off
title KlistarAi Server (Running)
color 0A
cd /d "d:\ada_v2-main\ada_v2-main"

echo [1/2] Clearning previous instances...
taskkill /F /IM python.exe >nul 2>&1

echo [2/2] Starting Server...
echo.
echo Server will be available at: http://localhost:8000
echo.
echo ========================================================
echo        DO NOT CLOSE THIS WINDOW WHILE USING THE APP
echo ========================================================

echo Opening Browser...
start "" "http://localhost:5173"

python backend/server.py
pause
