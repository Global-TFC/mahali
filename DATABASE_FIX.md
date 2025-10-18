# Database Fix Instructions

## Problem
After installation, the application may blink or show database connection errors. This happens when the database migrations are not properly applied to the SQLite database file.

## Solution

### Quick Fix
Run the provided batch file:
```
fix_db.bat
```

This will automatically check and fix the database issues.

### Manual Fix
If the batch file doesn't work, you can manually fix the database:

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the improved database fix script:
   ```
   python fix_db.py
   ```

### What the Fix Does
The improved fix script performs the following actions:
1. Checks if the database exists and has the required tables in both development and production locations
2. If not, it runs Django migrations to create all necessary tables
3. Copies the initialized database from development to production location if needed
4. Verifies that all migrations are properly recorded in both locations

### Prevention
The issue is now addressed in the installation process. The updated installation script automatically initializes the database during installation and ensures both development and production databases are properly set up.

## Technical Details
The problem occurs because:
1. Django uses different database locations for development and production:
   - Development: `backend/db.sqlite3`
   - Production: `%APPDATA%/Mahali/db.sqlite3`
2. Django tracks migrations in the `django_migrations` table
3. Sometimes the database file exists but without the required tables
4. This creates a mismatch between Django's migration tracking and the actual database state
5. The fix ensures both the migration tracking and actual tables are in sync in both locations