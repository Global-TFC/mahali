#!/usr/bin/env python
"""
Backup and Restore module for Mahall Software
Handles backup of SQLite database and media files to ZIP archive
"""

import os
import sys
import zipfile
import tempfile
from pathlib import Path
import shutil

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mahall_backend.settings')

def create_backup(backup_path=None):
    """
    Create a backup of the database and media files
    
    Args:
        backup_path (str): Path where backup ZIP should be saved
                          If None, creates in current directory
    
    Returns:
        str: Path to the created backup file
    """
    try:
        import django
        django.setup()
        
        from django.conf import settings
        
        # Determine backup path
        if backup_path is None:
            backup_path = backend_dir / "mahall_backup.zip"
        else:
            backup_path = Path(backup_path)
        
        # Ensure backup path is a Path object
        backup_path = Path(backup_path)
        
        # Get database and media paths
        db_path = Path(settings.DATABASES['default']['NAME'])
        media_path = Path(settings.MEDIA_ROOT)
        
        print(f"Creating backup...")
        print(f"Database: {db_path}")
        print(f"Media: {media_path}")
        print(f"Backup to: {backup_path}")
        
        # Create temporary directory for backup contents
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Copy database file
            if db_path.exists():
                shutil.copy2(db_path, temp_path / "db.sqlite3")
                print("Database copied")
            else:
                print("Warning: Database file not found")
            
            # Copy media directory if it exists
            if media_path.exists() and media_path.is_dir():
                media_backup_path = temp_path / "media"
                shutil.copytree(media_path, media_backup_path)
                print("Media files copied")
            else:
                print("Warning: Media directory not found")
            
            # Create ZIP file
            with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in temp_path.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(temp_path)
                        zipf.write(file_path, arcname)
            
            print(f"Backup created successfully: {backup_path}")
            return str(backup_path)
            
    except Exception as e:
        print(f"Error creating backup: {e}")
        raise

def restore_backup(backup_path):
    """
    Restore database and media files from backup ZIP
    
    Args:
        backup_path (str): Path to backup ZIP file
    """
    try:
        import django
        django.setup()
        
        from django.conf import settings
        
        backup_path = Path(backup_path)
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup file not found: {backup_path}")
        
        # Get database and media paths
        db_path = Path(settings.DATABASES['default']['NAME'])
        media_path = Path(settings.MEDIA_ROOT)
        
        print(f"Restoring from backup: {backup_path}")
        print(f"Database target: {db_path}")
        print(f"Media target: {media_path}")
        
        # Create temporary directory for extraction
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Extract backup
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_path)
            
            # Restore database
            backup_db = temp_path / "db.sqlite3"
            if backup_db.exists():
                # Backup current database first
                if db_path.exists():
                    backup_name = f"{db_path}.backup"
                    shutil.copy2(db_path, backup_name)
                    print(f"Current database backed up to: {backup_name}")
                
                shutil.copy2(backup_db, db_path)
                print("Database restored")
            else:
                print("Warning: No database found in backup")
            
            # Restore media files
            backup_media = temp_path / "media"
            if backup_media.exists() and backup_media.is_dir():
                # Backup current media first
                if media_path.exists():
                    backup_media_name = f"{media_path}_backup"
                    if os.path.exists(backup_media_name):
                        shutil.rmtree(backup_media_name)
                    shutil.copytree(media_path, backup_media_name)
                    print(f"Current media backed up to: {backup_media_name}")
                
                # Remove current media directory
                if media_path.exists():
                    shutil.rmtree(media_path)
                
                # Restore media from backup
                shutil.copytree(backup_media, media_path)
                print("Media files restored")
            else:
                print("Warning: No media directory found in backup")
        
        print("Restore completed successfully")
        
    except Exception as e:
        print(f"Error restoring backup: {e}")
        raise

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python backup_restore.py backup [backup_path]")
        print("  python backup_restore.py restore backup_path")
        return
    
    command = sys.argv[1].lower()
    
    if command == "backup":
        backup_path = sys.argv[2] if len(sys.argv) > 2 else None
        create_backup(backup_path)
    elif command == "restore":
        if len(sys.argv) < 3:
            print("Error: restore command requires backup_path")
            return
        backup_path = sys.argv[2]
        restore_backup(backup_path)
    else:
        print(f"Unknown command: {command}")
        print("Available commands: backup, restore")

if __name__ == "__main__":
    main()