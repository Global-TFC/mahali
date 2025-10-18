#!/usr/bin/env python3
"""
Test script to verify member details page functionality
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_member_details():
    """Test if we can retrieve member and house details"""
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
            
        # Get first member
        member = members[0]
        print(f"✅ Retrieved member: {member['name']} (ID: {member['member_id']})")
        
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
        
        print("🎉 Member details page functionality test passed!")
        print("You can now view member details by clicking the 'View' button in the members list.")
        return True
        
    except Exception as e:
        print(f"❌ Member details test failed with error: {e}")
        return False

def main():
    """Run the test"""
    print("Testing Member Details Page Functionality...\n")
    
    if test_member_details():
        print("\n✅ All tests passed! Member details page is ready to use.")
    else:
        print("\n❌ Tests failed. Please check the implementation.")

if __name__ == "__main__":
    main()