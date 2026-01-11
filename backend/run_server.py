
#!/usr/bin/env python
"""
Simple Django server script for Electron app
"""

import os
import sys
import django
from django.core.management import execute_from_command_line
from django.conf import settings

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mahall_backend.settings')
django.setup()

if __name__ == '__main__':
    # Run the development server
    execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000', '--noreload'])
