@echo off
echo 🚀 Starting SubGuard Application...

echo 📋 Checking prerequisites...

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running. Please start MongoDB first.
    echo    On Windows: net start MongoDB
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)
echo ✅ Python is installed

echo 📁 Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "logs" mkdir logs

echo 📦 Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
)
cd ..

echo 📦 Installing frontend dependencies...
cd Hacktproject
if not exist "node_modules" (
    npm install
)
cd ..

echo 📦 Installing NLP service dependencies...
cd nlp_service
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo 🔧 Checking environment configuration...
if not exist "backend\.env" (
    echo ⚠️  backend\.env not found. Creating from template...
    copy "backend\.env.example" "backend\.env"
    echo 📝 Please edit backend\.env with your configuration
)

echo 🎯 Starting services...

echo 🤖 Starting NLP service...
cd nlp_service
start "NLP Service" cmd /k "venv\Scripts\activate.bat && python app.py"
cd ..

timeout /t 3 /nobreak >nul

echo 🔧 Starting backend API...
cd backend
start "Backend API" cmd /k "npm run dev"
cd ..

timeout /t 5 /nobreak >nul

echo 🎨 Starting frontend...
cd Hacktproject
start "Frontend" cmd /k "npm start"
cd ..

echo.
echo 🎉 SubGuard Application Started Successfully!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🤖 NLP Service: http://localhost:5001
echo.
echo 🛑 To stop all services, close the command windows or run stop.bat
echo.
pause
