
#!/usr/bin/env python
"""
Backup and Restore CLI for Mahall Software
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.absolute()
sys.path.insert(0, str(backend_dir))

# Import backup_restore module
try:
    import backup_restore
    backup_restore.main()
except ImportError as e:
    print(f"Error importing backup_restore module: {e}")
    sys.exit(1)
