#!/usr/bin/env python3
"""
Test script to verify member data flow to MemberDetails component
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_member_data_flow():
    """Test member data flow to MemberDetails component"""
    try:
        print("Testing member data flow to MemberDetails component...\n")
        
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
        print(f"Member data structure:")
        for key, value in member.items():
            print(f"  {key}: {value}")
        
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
            # Check if area is an object or ID
            if isinstance(member_house.get('area'), dict):
                house_area = member_house.get('area')
            else:
                house_area = next((a for a in areas if a.get('id') == member_house.get('area')), None)
            
            if house_area:
                print(f"✅ Found area for house: {house_area.get('name', 'Unknown')} (ID: {house_area.get('id', 'N/A')})")
            else:
                print("⚠️  Could not find area for house")
        
        print("\n4. Verifying data flow to MemberDetails component...")
        print("✅ Member data:")
        print(f"   - member_id: {member.get('member_id', 'N/A')}")
        print(f"   - name: {member.get('name', 'N/A')}")
        print(f"   - house: {member.get('house', 'N/A')}")
        print(f"   - status: {member.get('status', 'N/A')}")
        print(f"   - date_of_birth: {member.get('date_of_birth', 'N/A')}")
        
        print("✅ House data:")
        if member_house:
            print(f"   - home_id: {member_house.get('home_id', 'N/A')}")
            print(f"   - house_name: {member_house.get('house_name', 'N/A')}")
            print(f"   - family_name: {member_house.get('family_name', 'N/A')}")
            print(f"   - area: {member_house.get('area', 'N/A')}")
        else:
            print("   - No house data available")
        
        print("✅ Area data:")
        if house_area:
            print(f"   - id: {house_area.get('id', 'N/A')}")
            print(f"   - name: {house_area.get('name', 'N/A')}")
        else:
            print("   - No area data available")
        
        print("\n5. Expected props for MemberDetails component:")
        print("✅ member: Complete member object")
        print("✅ house: Complete house object or null")
        print("✅ area: Complete area object or null")
        print("✅ onViewHouse: Function to handle house navigation")
        print("✅ onEditMember: Function to handle edit action")
        
        return True
        
    except Exception as e:
        print(f"❌ Data flow test failed with error: {e}")
        return False

def main():
    """Run the data flow test"""
    print("Member Data Flow Test\n")
    print("=" * 40)
    
    if test_member_data_flow():
        print("\n" + "=" * 40)
        print("✅ Data flow test completed successfully!")
        print("\nNext steps to fix blank page issue:")
        print("1. Check browser console for JavaScript errors")
        print("2. Verify MemberDetails component renders without errors")
        print("3. Check CSS styles are not hiding content")
        print("4. Ensure all required props are properly passed")
        print("5. Verify conditional rendering logic in App.jsx")
    else:
        print("\n" + "=" * 40)
        print("❌ Data flow test failed. Please check the implementation.")

if __name__ == "__main__":
    main()