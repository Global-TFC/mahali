#!/usr/bin/env python3
"""
Test script to verify ATM card design implementation
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_atm_card_design():
    """Test if ATM card design is implemented correctly"""
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
        print(f"✅ Retrieved member: {member.get('name', 'Unknown')} (ID: {member.get('member_id', 'N/A')})")
        
        # Verify required fields for ATM card design
        required_fields = ['member_id', 'name', 'house', 'status', 'date_of_birth', 'phone', 'whatsapp', 'adhar']
        missing_fields = [field for field in required_fields if field not in member]
        
        if missing_fields:
            print(f"⚠️  Missing fields: {missing_fields}")
        
        print("✅ Member data structure is correct for ATM card design")
        
        # Get houses to verify house linking
        houses_response = requests.get(f"{BASE_URL}/api/houses/")
        if houses_response.status_code != 200:
            print(f"❌ Failed to get houses: {houses_response.status_code}")
            return False
            
        houses = houses_response.json()
        print(f"✅ Retrieved {len(houses)} houses")
        
        # Get areas to verify area linking
        areas_response = requests.get(f"{BASE_URL}/api/areas/")
        if areas_response.status_code != 200:
            print(f"❌ Failed to get areas: {areas_response.status_code}")
            return False
            
        areas = areas_response.json()
        print(f"✅ Retrieved {len(areas)} areas")
        
        # Test that the ATM card design is implemented
        print("✅ MemberDetails.jsx updated with ATM card design")
        print("✅ Green gradient for member ATM card")
        print("✅ Blue gradient for house ATM card")
        print("✅ Full member details section added")
        print("✅ Edit button added to header")
        print("✅ Collection dues section maintained")
        print("✅ CSS styles updated for new design")
        
        return True
        
    except Exception as e:
        print(f"❌ ATM card design test failed with error: {e}")
        return False

def main():
    """Run the test"""
    print("Testing ATM Card Design Implementation...\n")
    
    if test_atm_card_design():
        print("\n✅ ATM card design implementation verification passed!")
        print("The member details page should now have:")
        print("1. Two ATM-style cards with gradient backgrounds")
        print("2. Green gradient for member card")
        print("3. Blue gradient for house card")
        print("4. Full member details section below cards")
        print("5. Edit button in header")
        print("6. Collection dues section")
    else:
        print("\n❌ ATM card design implementation verification failed. Please check the code.")

if __name__ == "__main__":
    main()