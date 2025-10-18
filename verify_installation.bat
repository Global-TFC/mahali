@echo off
echo Mahali Installation Verification
echo ================================
echo.

echo Checking if required files exist...
if exist "frontend\dist-electron\Mahali Setup 1.0.3.exe" (
    echo ✅ Installer file found
) else (
    echo ❌ Installer file missing
)

if exist "frontend\dist-electron\win-unpacked\Mahali.exe" (
    echo ✅ Main application found
) else (
    echo ❌ Main application missing
)

if exist "frontend\dist-electron\win-unpacked\backend\django_server.exe" (
    echo ✅ Backend server found
) else (
    echo ❌ Backend server missing
)

if exist "frontend\dist-electron\win-unpacked\backend\mahall_backup_restore.exe" (
    echo ✅ Backup/restore tool found
) else (
    echo ❌ Backup/restore tool missing
)

echo.
echo Checking database...
if exist "frontend\dist-electron\win-unpacked\backend\db.sqlite3" (
    echo ✅ Database file found
    echo.
    echo For detailed database verification, run:
    echo   cd backend
    echo   python fix_db.py
) else (
    echo ❌ Database file missing
)

echo.
echo Installation verification complete.
echo.
echo If all checks passed, your build is ready for distribution!
echo.
pause