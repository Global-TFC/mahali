@echo off
echo Rebuilding Mahall Software Application...
echo.

echo Building Django executable...
cd backend
python build_django_exe.py
if %errorlevel% neq 0 (
    echo Error building Django executable!
    pause
    exit /b %errorlevel%
)
cd ..

echo Building React frontend...
cd frontend
npm run build
if %errorlevel% neq 0 (
    echo Error building React frontend!
    pause
    exit /b %errorlevel%
)

echo Packaging Electron application...
npm run build-electron
if %errorlevel% neq 0 (
    echo Error packaging Electron application!
    pause
    exit /b %errorlevel%
)

echo.
echo Build completed successfully!
echo Installer location: frontend\dist-electron\Mahall Software Setup 0.0.0.exe
echo.
pause