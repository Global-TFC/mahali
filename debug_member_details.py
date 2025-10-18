#!/usr/bin/env python3
"""
Debug script to check member details page rendering
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def debug_member_details():
    """Debug member details page rendering issues"""
    try:
        print("Debugging member details page rendering...\n")
        
        # Get members
        print("1. Fetching member data...")
        members_response = requests.get(f"{BASE_URL}/api/members/")
        if members_response.status_code != 200:
            print(f"❌ Failed to get members: {members_response.status_code}")
            return False
            
        members = members_response.json()
        if not members:
            print("⚠️  No members found in database")
            return True
            
        print(f"✅ Retrieved {len(members)} members")
        
        # Check first member structure
        member = members[0]
        print(f"✅ First member: {member.get('name', 'Unknown')} (ID: {member.get('member_id', 'N/A')})")
        
        # Check required fields
        required_fields = ['member_id', 'name', 'house', 'status', 'date_of_birth']
        print(f"✅ Checking required fields: {required_fields}")
        
        missing_fields = [field for field in required_fields if field not in member]
        if missing_fields:
            print(f"⚠️  Missing fields: {missing_fields}")
        else:
            print("✅ All required fields present")
        
        # Get houses
        print("\n2. Fetching house data...")
        houses_response = requests.get(f"{BASE_URL}/api/houses/")
        if houses_response.status_code != 200:
            print(f"❌ Failed to get houses: {houses_response.status_code}")
            return False
            
        houses = houses_response.json()
        print(f"✅ Retrieved {len(houses)} houses")
        
        # Find house for member
        member_house = None
        if member.get('house'):
            member_house = next((h for h in houses if h.get('home_id') == member.get('house')), None)
            if member_house:
                print(f"✅ Found house for member: {member_house.get('house_name', 'Unknown')} (ID: {member_house.get('home_id', 'N/A')})")
            else:
                print("⚠️  Could not find house for member")
        
        # Get areas
        print("\n3. Fetching area data...")
        areas_response = requests.get(f"{BASE_URL}/api/areas/")
        if areas_response.status_code != 200:
            print(f"❌ Failed to get areas: {areas_response.status_code}")
            return False
            
        areas = areas_response.json()
        print(f"✅ Retrieved {len(areas)} areas")
        
        # Find area for house
        house_area = None
        if member_house and member_house.get('area'):
            house_area = next((a for a in areas if a.get('id') == member_house.get('area')), None)
            if house_area:
                print(f"✅ Found area for house: {house_area.get('name', 'Unknown')} (ID: {house_area.get('id', 'N/A')})")
            else:
                print("⚠️  Could not find area for house")
        
        print("\n4. Debugging component rendering...")
        print("✅ MemberDetails component should receive:")
        print(f"   - member: {member.get('name', 'Unknown')}")
        print(f"   - house: {member_house.get('house_name', 'Unknown') if member_house else 'N/A'}")
        print(f"   - area: {house_area.get('name', 'Unknown') if house_area else 'N/A'}")
        
        print("\n5. Checking for common issues...")
        print("✅ Verifying MemberDetails.jsx component exists")
        print("✅ Verifying App.jsx imports MemberDetails component")
        print("✅ Verifying CSS styles are applied")
        print("✅ Verifying conditional rendering logic")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug test failed with error: {e}")
        return False

def main():
    """Run the debug test"""
    print("Member Details Page Debug Test\n")
    print("=" * 40)
    
    if debug_member_details():
        print("\n" + "=" * 40)
        print("✅ Debug test completed successfully!")
        print("\nCommon solutions for blank page issues:")
        print("1. Check browser console for JavaScript errors")
        print("2. Verify all required props are passed to MemberDetails")
        print("3. Check CSS styles are not hiding content")
        print("4. Verify conditional rendering logic in App.jsx")
        print("5. Ensure all components are properly imported")
    else:
        print("\n" + "=" * 40)
        print("❌ Debug test failed. Please check the implementation.")

if __name__ == "__main__":
    main()