@echo off
echo Fixing Mahali Database Issues...
echo =================================

cd /d "%~dp0backend"

echo Checking and fixing database...
python fix_db.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database fix completed successfully!
    echo You can now run the application normally.
) else (
    echo.
    echo Database fix failed!
    echo Please check the error messages above.
)

echo.
pause