@echo off
echo 🛑 Stopping SubGuard Application...

echo 🔧 Stopping Node.js processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM nodemon.exe 2>nul

echo 🤖 Stopping Python processes...
taskkill /F /IM python.exe 2>nul

echo 🔌 Freeing up ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /F /PID %%a 2>nul

echo ✅ All SubGuard services stopped successfully!
echo.
echo 📋 To start again, run: start.bat
pause
