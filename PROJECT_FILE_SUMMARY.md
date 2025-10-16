# Mahall Software - Project File Summary

## Overview
This document provides a comprehensive summary of all files in the Mahall Software project, organized by directory and function.

## Directory Structure

```
Mahall Software/
├── backend/
├── frontend/
└── Documentation files
```

## Backend Files (`backend/`)

### Core Django Files
- `manage.py` - Django management script
- `requirements.txt` - Python dependencies
- `db.sqlite3` - SQLite database with sample data
- `.env.sample` - Environment variable template

### Django Applications
- `mahall_backend/` - Main Django application
  - `settings.py` - Application settings
  - `urls.py` - URL routing
  - `wsgi.py` - WSGI configuration
  - `asgi.py` - ASGI configuration
- `society/` - Society management application
  - `models.py` - Data models (Area, House, Member, etc.)
  - `views.py` - API views
  - `serializers.py` - Data serialization
  - `urls.py` - Application URLs

### Packaging Files
- `build_django_exe.py` - PyInstaller packaging script for Django
- `django_server.exe` - Standalone Django executable
- `build_exe.py` - Legacy packaging script

### Utility Files
- `initial_data.json` - Sample data for database population
- `install_django.ps1` - PowerShell installation script

## Frontend Files (`frontend/`)

### Configuration Files
- `package.json` - Node.js dependencies and scripts
- `vite.config.js` - Vite build configuration
- `eslint.config.js` - ESLint configuration
- `.env.sample` - Environment variable template
- `.gitignore` - Git ignore patterns

### Electron Files
- `electron-main.js` - Electron main process with Django integration
- `scripts/copy-backend.cjs` - Backend file copying script for packaging

### Source Code (`frontend/src/`)
- `App.jsx` - Main application component
- `main.jsx` - React entry point
- Component files:
  - `Header.jsx` - Application header
  - `Sidebar.jsx` - Navigation sidebar
  - `AreaManagement.jsx` - Area management section
  - `HouseManagement.jsx` - House management section
  - `MemberManagement.jsx` - Member management section
  - `CollectionManagement.jsx` - Collection management section
  - `SubCollectionManagement.jsx` - SubCollection management section
  - `MemberObligationManagement.jsx` - Member obligation management section
  - `ExportImport.jsx` - Data export/import functionality
  - `ThemeContext.jsx` - Theme management context

### Build Output (`frontend/dist/`)
- `index.html` - Main HTML file
- `loading.html` - Loading screen during startup
- Asset files (CSS, JS bundles)

### Packaged Application (`frontend/dist-electron/`)
- `Mahall Software Setup 0.0.0.exe` - Windows installer
- `win-unpacked/` - Unpacked application files
  - `Mahall Software.exe` - Main executable
  - `backend/` - Backend files including Django executable
  - `resources/` - Application resources

## Documentation Files

### Main Documentation
- `README.md` - Project overview and usage instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `FINAL_IMPLEMENTATION_REPORT.md` - Comprehensive implementation report
- `INTEGRATION_TEST.md` - Test results and verification

### Installation Scripts
- `install_app.bat` - Automated installation script for Windows
- `setup.bat` - Alternative installation script

## Key Features by File

### Backend Models (`backend/society/models.py`)
- Area model for geographic divisions
- House model for residential units
- Member model for residents
- Collection model for financial collections
- SubCollection model for collection breakdowns
- MemberObligation model for member responsibilities

### Frontend Components
- `Sidebar.jsx` - Theme selection (light, dim, dark)
- `ExportImport.jsx` - Data management with progress indicators
- All management components - CRUD operations for respective entities

### Electron Integration (`frontend/electron-main.js`)
- Automatic Django server startup/shutdown
- Loading screen during initialization
- Process management and cleanup

### Packaging (`frontend/package.json`, `backend/build_django_exe.py`)
- PyInstaller integration for Django
- Electron-builder configuration
- Cross-platform build scripts

## Build and Deployment

### Development Commands
- `npm run dev` - Start Vite development server
- `npm run electron-dev` - Start Electron in development mode
- `python manage.py runserver` - Start Django development server

### Production Commands
- `npm run build` - Build React frontend
- `npm run build-django` - Build Django executable
- `npm run package-app` - Package complete Electron application

## File Sizes (Approximate)
- Django executable: 35 MB
- Complete installer: 162 MB
- Database: 266 KB
- Frontend bundle: 252 KB (JS) + 14 KB (CSS)

## Dependencies

### Backend (Python)
- Django 5.2.5
- Django REST Framework
- Pillow (PIL)
- django-cors-headers

### Frontend (Node.js)
- React 19.1.1
- Electron 33.2.1
- Vite 6.0.1
- Axios 1.12.2

## Platform Support
- Primary: Windows (11/10)
- Packaging: NSIS installer
- Architecture: x64

This comprehensive file structure provides a complete community management application with integrated backend and frontend, packaged as a standalone desktop application.