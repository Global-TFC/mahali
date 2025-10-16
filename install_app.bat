@echo off
echo Installing Mahall Software...
echo.

echo This script will install the Mahall Software application on your system.
echo.

echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo Installing Node.js dependencies...
cd frontend
npm install
cd ..

echo Building Django executable...
cd backend
python build_django_exe.py
cd ..

echo Building Electron application...
cd frontend
npm run build
electron-builder
cd ..

echo.
echo Installation completed!
echo You can find the installer in the frontend/dist-electron folder.
echo.
pause