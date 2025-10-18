#!/usr/bin/env python
"""
Test script to verify that the house component changes have been implemented correctly.
"""

import os
from pathlib import Path

def check_files_exist():
    """Check that all required files exist"""
    print("Checking required files...")
    
    required_files = [
        "frontend/src/components/HouseModal.jsx",
        "frontend/src/components/Houses.jsx",
        "frontend/src/components/App.jsx"
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

def check_house_modal_content():
    """Check that HouseModal.jsx has the required content"""
    print("\nChecking HouseModal.jsx content...")
    
    try:
        with open("frontend/src/components/HouseModal.jsx", "r", encoding="utf-8") as f:
            content = f.read()
            
        required_elements = [
            "import React",
            "import { houseAPI, areaAPI }",
            "import { FaHome }",
            "const HouseModal",
            "formData",
            "areas",
            "loadAreas()",
            "handleChange",
            "handleSubmit",
            "house_name",
            "family_name",
            "location_name",
            "area",
            "address"
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in content:
                missing_elements.append(element)
                print(f"  ❌ Missing: {element}")
            else:
                print(f"  ✅ Found: {element}")
        
        return len(missing_elements) == 0
    except Exception as e:
        print(f"  ❌ Error reading HouseModal.jsx: {e}")
        return False

def check_houses_content():
    """Check that Houses.jsx has the required content"""
    print("\nChecking Houses.jsx content...")
    
    try:
        with open("frontend/src/components/Houses.jsx", "r", encoding="utf-8") as f:
            content = f.read()
            
        required_elements = [
            "import React, { useState }",
            "import { FaHome, FaRedo, FaPlus, FaEdit, FaTrash }",
            "import HouseModal",
            "import DeleteConfirmModal",
            "const Houses",
            "handleAddHouse",
            "handleEditHouse",
            "handleDeleteHouse",
            "handleReloadData",
            "isModalOpen",
            "isDeleteModalOpen"
        ]
        
        missing_elements = []
        for element in required_elements:
            if element not in content:
                missing_elements.append(element)
                print(f"  ❌ Missing: {element}")
            else:
                print(f"  ✅ Found: {element}")
        
        return len(missing_elements) == 0
    except Exception as e:
        print(f"  ❌ Error reading Houses.jsx: {e}")
        return False

def check_app_content():
    """Check that App.jsx passes loadDataForTab to Houses component"""
    print("\nChecking App.jsx content...")
    
    try:
        with open("frontend/src/components/App.jsx", "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check that loadDataForTab is passed to Houses component
        if "loadDataForTab={loadDataForTab}" in content:
            print("  ✅ loadDataForTab passed to Houses component")
            return True
        else:
            print("  ❌ loadDataForTab not passed to Houses component")
            return False
    except Exception as e:
        print(f"  ❌ Error reading App.jsx: {e}")
        return False

def main():
    print("Testing House Component Changes")
    print("=" * 40)
    
    # Run all checks
    files_ok = check_files_exist()
    modal_ok = check_house_modal_content()
    houses_ok = check_houses_content()
    app_ok = check_app_content()
    
    print("\n" + "=" * 40)
    print("Test Results:")
    
    if files_ok:
        print("✅ Files: All required files present")
    else:
        print("❌ Files: Some files are missing")
    
    if modal_ok:
        print("✅ HouseModal: Content is correct")
    else:
        print("❌ HouseModal: Content issues found")
    
    if houses_ok:
        print("✅ Houses: Content is correct")
    else:
        print("❌ Houses: Content issues found")
    
    if app_ok:
        print("✅ App: loadDataForTab properly passed")
    else:
        print("❌ App: loadDataForTab not properly passed")
    
    if files_ok and modal_ok and houses_ok and app_ok:
        print("\n🎉 ALL TESTS PASSED")
        print("The house component changes have been implemented correctly!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        print("Please check the issues above and fix them.")
        return 1

if __name__ == "__main__":
    exit(main())