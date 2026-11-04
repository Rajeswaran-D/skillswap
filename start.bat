@echo off
title SkillSwap - Student Skill Exchange Platform
cls
echo ========================================================
echo        SkillSwap - Student Skill Exchange Platform
echo ========================================================
echo.
echo Starting the SkillSwap server...
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system PATH!
    echo Please install Python 3 or add it to PATH to run the app.
    pause
    exit /b 1
)

:: Open the browser after 2 seconds in a background thread
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8080/login"

echo Server URL: http://localhost:8080/login
echo.
echo [INFO] The application will open in your default browser shortly.
echo [INFO] Press Ctrl+C in this window to stop the server.
echo.
echo ========================================================
echo.

:: Run the Python server
python run_app.py

pause
