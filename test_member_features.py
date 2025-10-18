#!/usr/bin/env python3
"""
Test script to verify all member modal features are working correctly
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_api_connectivity():
    """Test if the API is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/api/members/")
        if response.status_code == 200:
            print("✅ API connectivity test passed")
            return True
        else:
            print(f"❌ API connectivity test failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API connectivity test failed with error: {e}")
        return False

def test_house_api():
    """Test if house API is accessible"""
    try:
        response = requests.get(f"{BASE_URL}/api/houses/")
        if response.status_code == 200:
            print("✅ House API connectivity test passed")
            return True
        else:
            print(f"❌ House API connectivity test failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ House API connectivity test failed with error: {e}")
        return False

def test_member_creation():
    """Test creating a member with all fields"""
    member_data = {
        "name": "Test Member",
        "house": "1001",
        "status": "live",
        "date_of_birth": "1990-01-01",
        "mother_name": "Mother Name",
        "mother_surname": "Mother Surname",
        "father_name": "Father Name",
        "father_surname": "Father Surname",
        "adhar": "123456789012",
        "phone": "1234567890",
        "whatsapp": "1234567890",
        "isGuardian": False
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/members/", json=member_data)
        if response.status_code == 201:
            print("✅ Member creation test passed")
            return True
        else:
            print(f"❌ Member creation test failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Member creation test failed with error: {e}")
        return False

def main():
    """Run all tests"""
    print("Running Member Feature Tests...\n")
    
    tests = [
        test_api_connectivity,
        test_house_api,
        test_member_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Member features are working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()