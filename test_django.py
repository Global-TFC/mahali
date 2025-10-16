#!/usr/bin/env python
"""
Test script to verify Django executable works correctly
"""

import subprocess
import sys
import os

def test_django_executable():
    # Get the path to the Django executable
    backend_path = os.path.join(os.path.dirname(__file__), 'frontend', 'dist-electron', 'win-unpacked', 'backend')
    django_exe = os.path.join(backend_path, 'django_server.exe')
    
    if not os.path.exists(django_exe):
        print(f"Django executable not found at: {django_exe}")
        return False
    
    print(f"Testing Django executable at: {django_exe}")
    
    try:
        # Test with a simple command
        result = subprocess.run([django_exe, '--version'], 
                              capture_output=True, text=True, timeout=10)
        print("Django version:", result.stdout.strip())
        return True
    except subprocess.TimeoutExpired:
        print("Django executable test timed out")
        return False
    except Exception as e:
        print(f"Error testing Django executable: {e}")
        return False

if __name__ == '__main__':
    success = test_django_executable()
    sys.exit(0 if success else 1)