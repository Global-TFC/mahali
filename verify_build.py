#!/usr/bin/env python
"""
Script to verify that the Mahali build is working correctly.
This script will:
1. Check that all required build files exist
2. Verify the database is properly initialized
3. Confirm the build is ready for distribution
"""

import os
import sys
from pathlib import Path

def check_build_files():
    """Check that all required build files exist"""
    print("Checking build files...")
    
    # Define required files
    required_files = [
        "frontend/dist-electron/Mahali Setup 1.0.3.exe",
        "frontend/dist-electron/win-unpacked/Mahali.exe",
        "frontend/dist-electron/win-unpacked/backend/django_server.exe",
        "frontend/dist-electron/win-unpacked/backend/mahall_backup_restore.exe",
        "frontend/dist-electron/win-unpacked/backend/db.sqlite3"
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = Path(file_path)
        if not full_path.exists():
            missing_files.append(file_path)
            print(f"  ❌ Missing: {file_path}")
        else:
            print(f"  ✅ Found: {file_path}")
    
    return len(missing_files) == 0

def check_database():
    """Check that the database is properly initialized"""
    print("\nChecking database...")
    
    db_path = Path("frontend/dist-electron/win-unpacked/backend/db.sqlite3")
    if not db_path.exists():
        print("  ❌ Database file not found")
        return False
    
    # Check if database has required tables
    try:
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check for django_migrations table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='django_migrations'")
        result = cursor.fetchone()
        
        if result:
            print("  ✅ Database has django_migrations table")
            
            # Check for some key tables
            key_tables = ['society_area', 'society_house', 'society_member']
            for table in key_tables:
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if cursor.fetchone():
                    print(f"  ✅ Database has {table} table")
                else:
                    print(f"  ❌ Database missing {table} table")
                    conn.close()
                    return False
            
            conn.close()
            return True
        else:
            print("  ❌ Database missing django_migrations table")
            conn.close()
            return False
            
    except Exception as e:
        print(f"  ❌ Error checking database: {e}")
        return False

def main():
    print("Mahali Build Verification")
    print("=" * 30)
    
    # Change to project root directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    # Run checks
    build_files_ok = check_build_files()
    database_ok = check_database()
    
    print("\n" + "=" * 30)
    print("Verification Results:")
    
    if build_files_ok:
        print("✅ Build files: All required files present")
    else:
        print("❌ Build files: Some files are missing")
    
    if database_ok:
        print("✅ Database: Properly initialized with required tables")
    else:
        print("❌ Database: Not properly initialized")
    
    if build_files_ok and database_ok:
        print("\n🎉 BUILD VERIFICATION PASSED")
        print("The build is ready for distribution!")
        return 0
    else:
        print("\n❌ BUILD VERIFICATION FAILED")
        print("Please check the issues above and rebuild if necessary.")
        return 1

if __name__ == "__main__":
    sys.exit(main())