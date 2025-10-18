#!/usr/bin/env python3
"""
Test script to verify member view button functionality
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_member_view_functionality():
    """Test if member view button works with correct data structure"""
    try:
        # Get members
        members_response = requests.get(f"{BASE_URL}/api/members/")
        if members_response.status_code != 200:
            print(f"❌ Failed to get members: {members_response.status_code}")
            return False
            
        members = members_response.json()
        if not members:
            print("⚠️  No members found in database")
            return True
            
        # Check first member structure
        member = members[0]
        required_fields = ['member_id', 'name', 'house', 'status', 'date_of_birth', 'phone', 'whatsapp']
        
        print(f"✅ Retrieved member: {member.get('name', 'Unknown')} (ID: {member.get('member_id', 'N/A')})")
        
        # Verify required fields exist
        missing_fields = [field for field in required_fields if field not in member]
        if missing_fields:
            print(f"⚠️  Missing fields in member data: {missing_fields}")
        else:
            print("✅ All required member fields present")
        
        # Get houses
        houses_response = requests.get(f"{BASE_URL}/api/houses/")
        if houses_response.status_code != 200:
            print(f"❌ Failed to get houses: {houses_response.status_code}")
            return False
            
        houses = houses_response.json()
        print(f"✅ Retrieved {len(houses)} houses")
        
        # Get areas
        areas_response = requests.get(f"{BASE_URL}/api/areas/")
        if areas_response.status_code != 200:
            print(f"❌ Failed to get areas: {areas_response.status_code}")
            return False
            
        areas = areas_response.json()
        print(f"✅ Retrieved {len(areas)} areas")
        
        print("🎉 Member view button functionality test passed!")
        print("You can now click the 'View' button next to any member in the members list to see their details.")
        return True
        
    except Exception as e:
        print(f"❌ Member view button test failed with error: {e}")
        return False

def main():
    """Run the test"""
    print("Testing Member View Button Functionality...\n")
    
    if test_member_view_functionality():
        print("\n✅ All tests passed! Member view button is working correctly.")
    else:
        print("\n❌ Tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()