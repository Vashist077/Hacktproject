@echo off
echo Starting SubGuard Application...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd /d D:\kpr1\backend && npm start"

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d D:\kpr1\Hacktproject && npm start"

echo Starting AI Service...
start "AI Service" cmd /k "cd /d D:\kpr1\nlp_service && python app.py"

echo.
echo All services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo AI Service: http://localhost:5001
echo.
echo Press any key to exit...
pause > nul
