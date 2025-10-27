import requests
import json

# Test GET request
print("Testing GET request...")
r = requests.get('http://127.0.0.1:8000/api/settings/')
print("Status code:", r.status_code)
print("Response:", r.json())

# Test PUT request
print("\nTesting PUT request...")
data = {
    'theme': 'dark', 
    'firebase_config': '{"test": "value"}'
}
r = requests.put('http://127.0.0.1:8000/api/settings/1/', json=data)
print("Status code:", r.status_code)
print("Response:", r.json())

# Test GET request again
print("\nTesting GET request after update...")
r = requests.get('http://127.0.0.1:8000/api/settings/')
print("Status code:", r.status_code)
print("Response:", r.json())