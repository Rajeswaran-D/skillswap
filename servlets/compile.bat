@echo off
echo ========================================================
echo  Compiling SkillSwap Java Servlets
echo ========================================================

:: Set your Tomcat installation directory here (e.g. C:\xampp\tomcat or C:\apache-tomcat-9.0.x)
if "%TOMCAT_HOME%"=="" (
    set "TOMCAT_HOME=C:\apache-tomcat-9.0"
)

if not exist "%TOMCAT_HOME%\lib\servlet-api.jar" (
    echo [ERROR] servlet-api.jar not found at %TOMCAT_HOME%\lib\servlet-api.jar
    echo Please edit compile.bat and set TOMCAT_HOME to your actual Tomcat folder.
    echo Example: set "TOMCAT_HOME=C:\apache-tomcat-9.0"
    pause
    exit /b 1
)

if not exist "WEB-INF\classes" mkdir "WEB-INF\classes"

echo Compiling Java Servlets...
javac -cp "%TOMCAT_HOME%\lib\servlet-api.jar" -d "WEB-INF\classes" src\AddSkillServlet.java src\ProcessRequestServlet.java

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Servlets compiled successfully into WEB-INF\classes\
    echo Copy the entire 'servlets' folder into Tomcat's 'webapps' directory and rename it to 'skillswap-servlets'.
) else (
    echo.
    echo [ERROR] Compilation failed.
)
pause
