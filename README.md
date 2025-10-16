# Mahall Software

A comprehensive community management application built with Django (backend) and React (frontend), packaged as an Electron desktop application.

## Features

- Modern, responsive UI with light, dim, and dark themes
- Community management with areas, houses, members, and collections
- Data export/import functionality with progress indicators
- Standalone desktop application with integrated backend

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm 6 or higher

### Development Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd "Mahall Software"
   ```

2. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   cd ..
   ```

4. Run the development servers:
   ```
   # Terminal 1: Start Django backend
   cd backend
   python manage.py runserver
   
   # Terminal 2: Start React frontend
   cd frontend
   npm run dev
   
   # Terminal 3: Start Electron app
   cd frontend
   npm run electron-dev
   ```

### Building the Desktop Application

To build the standalone Electron application:

1. Build the Django executable:
   ```
   cd backend
   python build_django_exe.py
   cd ..
   ```

2. Package the Electron app:
   ```
   cd frontend
   npm run package-app
   ```

3. Find the installer in `frontend/dist-electron/` directory.

### Installation Script

For Windows users, you can run the installation script:
```
install_app.bat
```

This will automatically install all dependencies and build the application.

## Usage

### Development Mode

1. Start the Django backend server:
   ```
   cd backend
   python manage.py runserver
   ```

2. Start the React frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Start the Electron app in development mode:
   ```
   cd frontend
   npm run electron-dev
   ```

### Production Mode

After building the application, you can run the packaged executable directly:
- Windows: Run `Mahall Software Setup X.X.X.exe` from the `frontend/dist-electron` directory

## Project Structure

```
Mahall Software/
├── backend/                 # Django backend
│   ├── mahall_backend/      # Main Django app
│   ├── society/             # Society management app
│   ├── manage.py            # Django management script
│   └── requirements.txt     # Python dependencies
├── frontend/                # React frontend with Electron
│   ├── src/                 # React source code
│   ├── electron-main.js     # Electron main process
│   └── dist/                # Built frontend files
└── README.md                # This file
```

## Technologies Used

- **Backend**: Django 5.2, Django REST Framework
- **Frontend**: React 18, Vite
- **Desktop**: Electron 33
- **Database**: SQLite
- **Packaging**: PyInstaller, electron-builder

## License

This project is licensed under the MIT License.