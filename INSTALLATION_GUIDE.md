# Mahall Software Installation Guide

This guide provides detailed instructions for installing and setting up the Mahall Software application. This document is designed to help developers and Qoders understand the project structure, build process, and common troubleshooting steps.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Development Setup](#development-setup)
4. [Building the Application](#building-the-application)
5. [Installation Process](#installation-process)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Project Structure](#project-structure)
8. [Technologies Used](#technologies-used)

## Project Overview

Mahall Software is a comprehensive community management application built with Django (backend) and React (frontend), packaged as an Electron desktop application. It provides features for managing areas, houses, members, and collections within a community.

## Prerequisites

### System Requirements
- Windows 10/11 (64-bit)
- At least 4GB RAM
- 500MB free disk space for installation

### Development Tools
- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher
- Git (for version control)

## Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Mahall Software"
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Run Development Servers
Open three separate terminal windows:

**Terminal 1: Start Django Backend**
```bash
cd backend
python manage.py runserver
```

**Terminal 2: Start React Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3: Start Electron App**
```bash
cd frontend
npm run electron-dev
```

## Building the Application

The project uses a multi-stage build process:

### 1. Build the React Frontend
```bash
cd frontend
npm run build
```
This compiles the React application into static files in the `frontend/dist/` directory.

### 2. Build the Django Backend Executable
```bash
cd backend
python build_django_exe.py
```
This creates `django_server.exe` and `mahall_backup_restore.exe` in the `backend/` directory using PyInstaller.

### 3. Package the Electron App
```bash
cd frontend
npm run build-electron
```
This packages the Electron application and creates the installer in `frontend/dist-electron/` directory.

### 4. Alternative: Build Everything at Once
```bash
cd frontend
npm run package-app
```
This runs all the above steps in sequence:
- `npm run build` (frontend build)
- `cd ../backend && python build_django_exe.py` (backend build)
- `electron-builder` (Electron packaging)

## Installation Process

### For End Users
1. Download the installer from `frontend/dist-electron/Mahali Setup 1.0.3.exe`
2. Run the installer and follow the installation wizard
3. Launch the application from the desktop shortcut or Start menu

### For Developers
1. Follow the development setup instructions above
2. Or build the application using the build instructions and run the installer

## Common Issues and Solutions

### 1. "ffmpeg.dll was not found" Error
**Problem**: This error occurs when required DLL files are missing from the packaged application.

**Solution**:
- Ensure all DLL files are included in the package.json build configuration:
  ```json
  "extraFiles": [
    "node_modules/electron/dist/ffmpeg.dll",
    "node_modules/electron/dist/d3dcompiler_47.dll",
    "node_modules/electron/dist/libEGL.dll",
    "node_modules/electron/dist/libGLESv2.dll",
    "node_modules/electron/dist/vk_swiftshader.dll",
    "node_modules/electron/dist/vulkan-1.dll"
  ]
  ```
- Rebuild the application using `npm run package-app`

### 2. Application Won't Start After Installation
**Problem**: The application appears to launch but shows a blank screen or doesn't respond.

**Solution**:
- Check if the backend server is starting correctly
- Verify that `django_server.exe` is included in the installation package
- Ensure the database file `db.sqlite3` is present in the backend directory
- Check Windows Event Viewer for any application errors

### 3. Database Connection Issues
**Problem**: The application shows database connection errors or blinking issues.

**Solution**:
- Run the database fix script:
  ```bash
  fix_db.bat
  ```
- Or manually run:
  ```bash
  cd backend
  python fix_db.py
  ```
- This will initialize the database with all required tables and migrations

### 4. Build Process Fails
**Problem**: The build process fails with PyInstaller or electron-builder errors.

**Solution**:
- Clean previous build artifacts:
  ```bash
  Remove-Item -Recurse -Force frontend\dist
  Remove-Item -Recurse -Force frontend\dist-electron
  Remove-Item -Recurse -Force backend\dist
  ```
- Ensure all dependencies are installed correctly
- Check that Python and Node.js are in the system PATH

### 5. Missing Backend Executables
**Problem**: The `django_server.exe` or `mahall_backup_restore.exe` files are missing after building.

**Solution**:
- Run the backend build script directly:
  ```bash
  cd backend
  python build_django_exe.py
  ```
- Check that PyInstaller is installed:
  ```bash
  pip install pyinstaller
  ```

## Project Structure

```
Mahall Software/
├── backend/                    # Django backend
│   ├── mahall_backend/         # Main Django app
│   ├── society/                # Society management app
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── build_django_exe.py     # PyInstaller build script
│   ├── django_server.exe       # Main server executable (generated)
│   └── mahall_backup_restore.exe # Backup/restore executable (generated)
├── frontend/                   # React frontend with Electron
│   ├── src/                    # React source code
│   ├── electron-main.js        # Electron main process
│   ├── dist/                   # Built frontend files (generated)
│   └── dist-electron/          # Packaged Electron app (generated)
├── INSTALLATION_GUIDE.md       # This file
└── README.md                   # Main project documentation
```

## Technologies Used

### Backend
- **Framework**: Django 5.2
- **API**: Django REST Framework
- **Database**: SQLite
- **Packaging**: PyInstaller

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Components**: React Bootstrap
- **Icons**: React Icons

### Desktop Application
- **Framework**: Electron 33
- **Packaging**: electron-builder

## Troubleshooting Tips for Qoders

1. **Always check the build logs** for specific error messages
2. **Verify file paths** - Windows path separators can cause issues
3. **Ensure all dependencies are installed** before building
4. **Clean builds** - Remove previous build artifacts before rebuilding
5. **Check DLL files** - Missing DLLs are a common cause of runtime errors
6. **Database initialization** - Always run migrations or fix_db.py if there are database issues
7. **Environment variables** - Ensure DJANGO_SETTINGS_MODULE is set correctly in development

## Additional Resources

- Django Documentation: https://docs.djangoproject.com/
- React Documentation: https://reactjs.org/
- Electron Documentation: https://www.electronjs.org/docs
- PyInstaller Documentation: https://pyinstaller.org/

For any additional issues, please check the project's issue tracker or contact the development team.