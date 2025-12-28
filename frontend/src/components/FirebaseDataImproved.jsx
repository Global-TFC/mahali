import React, { useState, useEffect } from 'react';
import { settingsAPI, areaAPI, houseAPI, memberAPI } from '../api';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './FirebaseDataImproved.css';

const FirebaseDataImproved = () => {
  const [firebaseConfig, setFirebaseConfig] = useState(null);
  const [firebaseData, setFirebaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [houseData, setHouseData] = useState({
    house_name: '',
    family_name: '',
    location_name: '',
    area: '',
    address: '',
    road_name: ''
  });
  const [members, setMembers] = useState([]);
  const [guardianId, setGuardianId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // New states for the tabbed workflow
  const [activeTab, setActiveTab] = useState('house'); // 'house' or 'members'
  const [houseAdded, setHouseAdded] = useState(false);
  const [createdHouse, setCreatedHouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fatherSearchTerm, setFatherSearchTerm] = useState({});
  const [motherSearchTerm, setMotherSearchTerm] = useState({});
  const [fatherSearchResults, setFatherSearchResults] = useState({});
  const [motherSearchResults, setMotherSearchResults] = useState({});
  const [showFatherSearch, setShowFatherSearch] = useState({});
  const [showMotherSearch, setShowMotherSearch] = useState({});
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState(new Set()); // For multi-select
  const [allMembers, setAllMembers] = useState([]); // Add this line to store all members

  useEffect(() => {
    loadAppSettings();
    loadAreas();
    loadAllMembers(); // Add this line to load all members
    
    // Listen for settings updates from other components
    const handleSettingsUpdate = (event) => {
      console.log('FirebaseData: Settings updated:', event.detail);
      setAppSettings(event.detail);
      if (event.detail.firebase_config && event.detail.firebase_config.trim() !== '') {
        try {
          const parsedConfig = JSON.parse(event.detail.firebase_config);
          console.log('FirebaseData: Parsed updated Firebase config:', parsedConfig);
          setFirebaseConfig(parsedConfig);
        } catch (e) {
          console.error('Failed to parse Firebase config:', e);
          setError('Invalid Firebase configuration format');
          setFirebaseConfig(null);
        }
      } else {
        console.log('FirebaseData: Firebase config removed from settings');
        setFirebaseConfig(null);
      }
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const loadAppSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      if (response.data.length > 0) {
        const settings = response.data[0];
        console.log('FirebaseData: Loaded settings:', settings);
        setAppSettings(settings);
        if (settings.firebase_config && settings.firebase_config.trim() !== '') {
          try {
            const parsedConfig = JSON.parse(settings.firebase_config);
            console.log('FirebaseData: Parsed Firebase config:', parsedConfig);
            setFirebaseConfig(parsedConfig);
          } catch (e) {
            console.error('Failed to parse Firebase config:', e);
            setError('Invalid Firebase configuration format');
            setFirebaseConfig(null);
          }
        } else {
          console.log('FirebaseData: No Firebase config found in settings');
          setFirebaseConfig(null);
        }
      } else {
        console.log('FirebaseData: No settings found');
      }
    } catch (error) {
      console.error('Failed to load app settings:', error);
      setError('Failed to load app settings: ' + error.message);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areaAPI.getAll();
      setAreas(response.data);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  // Add this function to load all members
  const loadAllMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      // Ensure response.data is an array
      if (response && Array.isArray(response.data)) {
        setAllMembers(response.data);
      } else {
        console.warn('Unexpected response format for members:', response);
        setAllMembers([]);
      }
    } catch (error) {
      console.error('Failed to load all members:', error);
      setAllMembers([]); // Set to empty array on error
    }
  };

  const loadFirebaseData = async () => {
    if (!firebaseConfig) {
      setError('Firebase is not configured');
      return;
    }

    // Validate Firebase configuration
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      setError(`Invalid Firebase configuration: Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('FirebaseData: Attempting to load Firebase SDKs');
      // Dynamically import Firebase SDKs only when needed
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      
      console.log('FirebaseData: Initializing Firebase with config:', firebaseConfig);
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      console.log('FirebaseData: Attempting to fetch data from families collection');
      
      // Fetch data from 'families' collection
      const querySnapshot = await getDocs(collection(db, 'families'));
      const dataList = [];
      querySnapshot.forEach((doc) => {
        dataList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('FirebaseData: Successfully fetched', dataList.length, 'documents');
      setFirebaseData(dataList);
    } catch (err) {
      console.error('Error fetching Firebase data:', err);
      // More detailed error handling
      let errorMessage = 'Failed to fetch data from Firebase';
      
      // Handle different types of errors
      if (err.code) {
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'Permission denied: Check Firebase rules for families collection';
            break;
          case 'unauthenticated':
            errorMessage = 'Authentication required: Check Firebase configuration';
            break;
          case 'failed-precondition':
            errorMessage = 'Firebase not properly configured: Check project settings';
            break;
          case 'unavailable':
            errorMessage = 'Firebase services unavailable: Check network connection';
            break;
          case 'cancelled':
            errorMessage = 'Request cancelled: Network issue or timeout';
            break;
          default:
            errorMessage = `Firebase error (${err.code}): ${err.message || 'Unknown error'}`;
        }
      } else if (err.name === 'FirebaseError') {
        errorMessage = `Firebase error: ${err.message}`;
      } else if (err.message) {
        // Check for network-related errors
        if (err.message.includes('Network Error') || err.message.includes('net::ERR_')) {
          errorMessage = 'Network error: Check internet connection and firewall settings';
        } else {
          errorMessage = 'Failed to fetch data from Firebase: ' + err.message;
        }
      }
      
      console.error('FirebaseData Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('FirebaseData: firebaseConfig changed:', firebaseConfig);
    if (firebaseConfig) {
      console.log('FirebaseData: Loading Firebase data because config is available');
      loadFirebaseData();
    } else {
      console.log('FirebaseData: Not loading Firebase data because config is not available');
      setFirebaseData([]);
    }
  }, [firebaseConfig]);

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    
    // Initialize house data with Firebase data
    setHouseData({
      house_name: item.houseName || item.house_name || '',
      family_name: item.familyName || item.family_name || '',
      location_name: item.locationName || item.location || item.location_name || '',
      area: item.area || '',
      address: item.address || '',
      road_name: item.roadName || item.road_name || ''
    });
    
    // Initialize members data with Firebase data
    const firebaseMembers = item.members || [];
    const initializedMembers = firebaseMembers.map((member, index) => ({
      id: Date.now() + index, // Temporary ID
      name: member.fullName || member.name || '',
      surname: member.surname || '',
      date_of_birth: member.dob || member.date_of_birth || '',
      father_name: member.fatherName || member.father_name || '',
      father_surname: member.fatherSurname || member.father_surname || '',
      mother_name: member.motherName || member.mother_name || '',
      mother_surname: member.motherSurname || member.mother_surname || '',
      phone: member.phone || '',
      whatsapp: member.whatsapp || '',
      aadhar: member.aadhaar || member.aadhar || '',
      status: member.status || 'live',
      father_id: member.father_id || null,
      mother_id: member.mother_id || null
    }));
    
    // Auto-select all members by default since they came from Firebase
    const allMemberIds = initializedMembers.map(member => member.id);
    setSelectedMembers(new Set(allMemberIds));
    
    setMembers(initializedMembers);
    
    // Set guardian based on primaryMember data if available
    let guardianIndex = 0; // Default to first member
    if (item.primaryMember && item.primaryMember.name) {
      // Try to find the member that matches the primary member
      const primaryMemberName = item.primaryMember.name.toLowerCase();
      const matchingMemberIndex = initializedMembers.findIndex(member => 
        member.name.toLowerCase() === primaryMemberName || 
        `${member.name} ${member.surname}`.toLowerCase() === primaryMemberName
      );
      if (matchingMemberIndex !== -1) {
        guardianIndex = matchingMemberIndex;
      }
    }
    setGuardianId(initializedMembers[guardianIndex]?.id || null);
    // Reset states
    setHouseAdded(false);
    setCreatedHouse(null);
    setActiveTab('house');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setHouseData({
      house_name: '',
      family_name: '',
      location_name: '',
      area: '',
      address: '',
      road_name: ''
    });
    setMembers([]);
    setGuardianId(null);
    setSaveMessage('');
    // Reset states
    setHouseAdded(false);
    setCreatedHouse(null);
    setActiveTab('house');
    setSelectedMembers(new Set());
  };

  const handleHouseDataChange = (field, value) => {
    setHouseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      surname: '',
      date_of_birth: '',
      father_name: '',
      father_surname: '',
      mother_name: '',
      mother_surname: '',
      phone: '',
      whatsapp: '',
      aadhar: '',
      status: 'live',
      father_id: null,
      mother_id: null
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id, field, value) => {
    setMembers(prev => prev.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  // Handle father search for a specific member
  const handleFatherSearch = (memberId, term) => {
    setFatherSearchTerm(prev => ({ ...prev, [memberId]: term }));
    
    // If term is empty, clear search results
    if (!term) {
      setFatherSearchResults(prev => ({ ...prev, [memberId]: [] }));
      return;
    }
    
    // Search for members using API
    memberAPI.search({ search: term })
      .then(response => {
        // Extract results from paginated response
        const results = response.data.results || response.data;
        // Limit to 10 results
        const limitedResults = Array.isArray(results) ? results.slice(0, 10) : [];
        setFatherSearchResults(prev => ({ ...prev, [memberId]: limitedResults }));
      })
      .catch(error => {
        console.error('Error searching fathers:', error);
        setFatherSearchResults(prev => ({ ...prev, [memberId]: [] }));
      });
  };

  // Handle mother search for a specific member
  const handleMotherSearch = (memberId, term) => {
    setMotherSearchTerm(prev => ({ ...prev, [memberId]: term }));
    
    // If term is empty, clear search results
    if (!term) {
      setMotherSearchResults(prev => ({ ...prev, [memberId]: [] }));
      return;
    }
    
    // Search for members using API
    memberAPI.search({ search: term })
      .then(response => {
        // Extract results from paginated response
        const results = response.data.results || response.data;
        // Limit to 10 results
        const limitedResults = Array.isArray(results) ? results.slice(0, 10) : [];
        setMotherSearchResults(prev => ({ ...prev, [memberId]: limitedResults }));
      })
      .catch(error => {
        console.error('Error searching mothers:', error);
        setMotherSearchResults(prev => ({ ...prev, [memberId]: [] }));
      });
  };

  // Select father for a specific member
  const selectFather = (memberId, father) => {
    updateMember(memberId, 'father_id', father.member_id);
    updateMember(memberId, 'father_name', father.name || '');
    updateMember(memberId, 'father_surname', father.surname || '');
    setShowFatherSearch(prev => ({ ...prev, [memberId]: false }));
    setFatherSearchTerm(prev => ({ ...prev, [memberId]: '' }));
    setFatherSearchResults(prev => ({ ...prev, [memberId]: [] }));
  };

  // Select mother for a specific member
  const selectMother = (memberId, mother) => {
    updateMember(memberId, 'mother_id', mother.member_id);
    updateMember(memberId, 'mother_name', mother.name || '');
    updateMember(memberId, 'mother_surname', mother.surname || '');
    setShowMotherSearch(prev => ({ ...prev, [memberId]: false }));
    setMotherSearchTerm(prev => ({ ...prev, [memberId]: '' }));
    setMotherSearchResults(prev => ({ ...prev, [memberId]: [] }));
  };


  const removeMember = (id) => {
    setMembers(prev => prev.filter(member => member.id !== id));
    if (guardianId === id) {
      setGuardianId(null);
    }
    // Remove from selected members if present
    const newSelected = new Set(selectedMembers);
    newSelected.delete(id);
    setSelectedMembers(newSelected);
  };

  const setGuardian = (id) => {
    setGuardianId(id);
  };

  // Toggle member selection
  const toggleMemberSelection = (id) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  // Select all members
  const selectAllMembers = () => {
    const allMemberIds = members.map(member => member.id);
    setSelectedMembers(new Set(allMemberIds));
  };

  // Deselect all members
  const deselectAllMembers = () => {
    setSelectedMembers(new Set());
  };

  // Fuzzy search function with improved matching
  const fuzzySearch = (text, term) => {
    if (!term) return true;
    const lowerText = text.toLowerCase().trim();
    const lowerTerm = term.toLowerCase().trim();
    
    // Exact match
    if (lowerText === lowerTerm) return true;
    
    // Partial match
    if (lowerText.includes(lowerTerm)) return true;
    
    // Split term into words and check if all words are present
    const termWords = lowerTerm.split(/\s+/);
    return termWords.every(word => lowerText.includes(word));
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    fuzzySearch(`${member.name} ${member.surname}`, searchTerm)
  );

  // Filter members for father selection with improved search (from all members)
  const getFilteredFathers = (memberId, term) => {
    // Ensure allMembers is an array
    if (!Array.isArray(allMembers)) {
      console.warn('allMembers is not an array:', allMembers);
      return [];
    }
    
    return allMembers.filter(member => 
      member.id !== memberId && 
      (fuzzySearch(`${member.name} ${member.surname}`, term) || 
       fuzzySearch(`${member.name}`, term) || 
       fuzzySearch(`${member.surname}`, term))
    );
  };

  // Filter members for mother selection with improved search (from all members)
  const getFilteredMothers = (memberId, term) => {
    // Ensure allMembers is an array
    if (!Array.isArray(allMembers)) {
      console.warn('allMembers is not an array:', allMembers);
      return [];
    }
    
    return allMembers.filter(member => 
      member.id !== memberId && 
      (fuzzySearch(`${member.name} ${member.surname}`, term) || 
       fuzzySearch(`${member.name}`, term) || 
       fuzzySearch(`${member.surname}`, term))
    );
  };

  // Save house function
  const saveHouse = async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      // Create the house with all fields
      const houseResponse = await houseAPI.create({
        house_name: houseData.house_name,
        family_name: houseData.family_name,
        location_name: houseData.location_name,
        area: houseData.area,
        address: houseData.address,
        road_name: houseData.road_name
      });
      
      const createdHouse = houseResponse.data;
      console.log('House created:', createdHouse);
      setCreatedHouse(createdHouse);
      setHouseAdded(true);
      setSaveMessage('House created successfully!');
      // Switch to members tab
      setActiveTab('members');
    } catch (error) {
      console.error('Error saving house:', error);
      setSaveMessage('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Save selected members function
  const saveSelectedMembers = async () => {
    if (selectedMembers.size === 0) {
      setSaveMessage('Please select at least one member to add');
      return;
    }

    setSaving(true);
    setSaveMessage('');
    
    try {
      // Create selected members
      const selectedMembersArray = members.filter(member => selectedMembers.has(member.id));
      const createdMembers = [];
      
      for (const member of selectedMembersArray) {
        // Find father and mother objects for names
        const father = members.find(m => m.id === member.father_id);
        const mother = members.find(m => m.id === member.mother_id);
        
        const memberData = {
          name: member.name,
          surname: member.surname,
          date_of_birth: member.date_of_birth,
          father_name: member.father_name || (father ? `${father.name}` : ''),
          father_surname: member.father_surname || (father ? `${father.surname}` : ''),
          mother_name: member.mother_name || (mother ? `${mother.name}` : ''),
          mother_surname: member.mother_surname || (mother ? `${mother.surname}` : ''),
          phone: member.phone,
          whatsapp: member.whatsapp,
          aadhar: member.aadhar,
          status: member.status,
          house: createdHouse.home_id,
          isGuardian: member.id === guardianId
        };
        
        const memberResponse = await memberAPI.create(memberData);
        createdMembers.push(memberResponse.data);
        console.log('Member created:', memberResponse.data);
      }
      
      setSaveMessage(`${createdMembers.length} members created successfully!`);
      
      // Close modal after a delay
      setTimeout(() => {
        closeModal();
      }, 2000);
      
    } catch (error) {
      console.error('Error saving members:', error);
      setSaveMessage('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderData = () => {
    if (loading) {
      return <div className="loading">Loading Firebase data...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    if (firebaseData.length === 0) {
      return <div className="no-data">No data found in Firebase collection</div>;
    }

    // Get all unique keys for table headers (excluding 'id' and 'members')
    const allKeys = new Set();
    firebaseData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'id' && key !== 'members') { // Exclude 'id' and 'members' columns
          allKeys.add(key);
        }
      });
    });

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Family Name</th>
              <th>House Name</th>
              <th>Location</th>
              {Array.from(allKeys).map(key => (
                <th key={key}>{key}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {firebaseData.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.familyName || item.family_name || 'N/A'}</td>
                <td>{item.houseName || item.house_name || 'N/A'}</td>
                <td>{item.locationName || item.location_name || 'N/A'}</td>
                {Array.from(allKeys).map(key => (
                  <td key={key}>
                    {renderTableCell(item[key], key)}
                  </td>
                ))}
                <td>
                  <div className="actions-container">
                    <button 
                      className="action-btn"
                      onClick={() => handleRowClick(item)}
                    >
                      Process
                    </button>
                    <button 
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                        setShowMembersModal(true);
                      }}
                    >
                      View Members ({(item.members || []).length})
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this item from Firebase?')) {
                          await deleteFirebaseItem(item);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to delete item from Firebase
  const deleteFirebaseItem = async (item) => {
    try {
      // Dynamically import Firebase SDKs only when needed
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      // Delete the document
      await deleteDoc(doc(db, 'families', item.id));
      
      // Reload the data
      loadFirebaseData();
      
      console.log('Successfully deleted item from Firebase');
    } catch (error) {
      console.error('Error deleting item from Firebase:', error);
      setError('Failed to delete item from Firebase: ' + error.message);
    }
  };

  // Render member details in a clean format
  // Render table cell content with special handling for member data
  const renderTableCell = (value, key) => {
    // Check if this is a member object (could be a parsed object or a JSON string)
    let memberData = null;
    
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // Try to parse JSON string
      try {
        memberData = JSON.parse(value);
      } catch (e) {
        // If parsing fails, treat as regular string
        return String(value || '');
      }
    } else if (typeof value === 'object' && value !== null) {
      // Already an object
      memberData = value;
    }
    
    // Check if this looks like member data
    if (memberData && (memberData.name || memberData.phone || memberData.whatsapp)) {
      return (
        <div className="member-table-cell">
          <div className="member-info">
            <div className="member-avatar-small">
              {memberData.photoURL ? (
                <img src={memberData.photoURL} alt="" className="member-image" />
              ) : (
                <div className="member-icon">{memberData.name ? memberData.name.charAt(0).toUpperCase() : 'U'}</div>
              )}
            </div>
            <div className="member-names">
              <div className="member-name">{memberData.name || 'Unknown'}</div>
              {memberData.surname && <div className="member-surname">{memberData.surname}</div>}
            </div>
          </div>
          <div className="member-contact">
            {memberData.phone && (
              <button 
                className="copy-btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(memberData.phone);
                }}
                title="Copy phone number"
              >
                📋
              </button>
            )}
            {memberData.whatsapp && (
              <button 
                className="whatsapp-btn-small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/${memberData.whatsapp}`, '_blank');
                }}
                title="Message on WhatsApp"
              >
                💬
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // For other data types, render normally
    return typeof value === 'object' ? JSON.stringify(value) : String(value || '');
  };

  const renderMemberDetails = (member) => {
    return (
      <div className="member-detail-card">
        <div className="member-basic-info">
          <div className="member-avatar-large">
            {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="member-identity">
            <div className="member-full-name">
              {member.name || 'Unknown Member'}
              {member.surname && ` ${member.surname}`}
            </div>
            {(member.phone || member.whatsapp) && (
              <div className="member-contact-info">
                {member.phone && (
                  <span className="contact-item">
                    📞 {member.phone}
                  </span>
                )}
                {member.whatsapp && (
                  <span className="contact-item">
                    💬 {member.whatsapp}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="member-additional-info">
          {member.date_of_birth && (
            <div className="info-row">
              <span className="info-label">📅 Date of Birth:</span>
              <span className="info-value">{member.date_of_birth}</span>
            </div>
          )}
          
          {(member.father_name || member.father_surname) && (
            <div className="info-row">
              <span className="info-label">👨 Father:</span>
              <span className="info-value">
                {member.father_name} {member.father_surname || ''}
              </span>
            </div>
          )}
          
          {(member.mother_name || member.mother_surname) && (
            <div className="info-row">
              <span className="info-label">👩 Mother:</span>
              <span className="info-value">
                {member.mother_name} {member.mother_surname || ''}
              </span>
            </div>
          )}
          
          {member.aadhar && (
            <div className="info-row">
              <span className="info-label">💳 Aadhar:</span>
              <span className="info-value">{member.aadhar}</span>
            </div>
          )}
          
          <div className="info-row">
            <span className="info-label">📊 Status:</span>
            <span className="info-value">
              <span className={`status-badge status-${member.status || 'live'}`}>
                {member.status || 'live'}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render members modal
  const renderMembersModal = () => {
    if (!showMembersModal || !selectedItem) return null;
    
    const members = selectedItem.members || [];
    
    return (
      <div className="modal-overlay">
        <div className="members-modal-content">
          <div className="modal-header">
            <h2>Family Members</h2>
            <button className="close-btn" onClick={() => setShowMembersModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="family-info">
              <h3>{selectedItem.familyName || selectedItem.family_name || 'Unknown Family'}</h3>
              <p>House: {selectedItem.houseName || selectedItem.house_name || 'N/A'}</p>
            </div>
            <div className="members-list-container">
              {members.length > 0 ? (
                members.map((member, index) => (
                  <div key={index} className="member-card">
                    {renderMemberDetails(member)}
                  </div>
                ))
              ) : (
                <div className="no-members">No members found for this family</div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={() => setShowMembersModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="data-section">
      <div className="section-header">
        <h2>🔥 Member Requests</h2>
        <div className="header-actions">
          <button onClick={loadFirebaseData} disabled={loading} className="reload-btn">
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
      
      {firebaseConfig ? (
        renderData()
      ) : (
        <div className="no-firebase-config">
          <p>Firebase is not configured. Please add Firebase configuration in Settings.</p>
        </div>
      )}

      {/* Modal for processing Firebase data */}
      {isModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-wide">
            <div className="modal-header">
              <h2>Process Family Data</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Tab Navigation */}
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'house' ? 'active' : ''}`}
                  onClick={() => setActiveTab('house')}
                  disabled={!houseAdded}
                >
                  Step 1: House Details
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveTab('members')}
                  disabled={!houseAdded}
                >
                  Step 2: Add Members
                </button>
              </div>
              
              {/* House Tab */}
              {activeTab === 'house' && (
                <div className="house-section">
                  <h3>House Details</h3>
                  <div className="house-details-grid">
                    <div className="form-group">
                      <label>House Name *</label>
                      <input
                        type="text"
                        value={houseData.house_name}
                        onChange={(e) => handleHouseDataChange('house_name', e.target.value)}
                        className="form-input"
                        disabled={houseAdded}
                        placeholder="Enter house name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Family Name *</label>
                      <input
                        type="text"
                        value={houseData.family_name}
                        onChange={(e) => handleHouseDataChange('family_name', e.target.value)}
                        className="form-input"
                        disabled={houseAdded}
                        placeholder="Enter family name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Location Name</label>
                      <input
                        type="text"
                        value={houseData.location_name}
                        onChange={(e) => handleHouseDataChange('location_name', e.target.value)}
                        className="form-input"
                        disabled={houseAdded}
                        placeholder="Enter location name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Area</label>
                      <select
                        value={houseData.area}
                        onChange={(e) => handleHouseDataChange('area', e.target.value)}
                        className="form-input"
                        disabled={houseAdded}
                      >
                        <option value="">Select Area</option>
                        {areas.map(area => (
                          <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Road Name</label>
                      <input
                        type="text"
                        value={houseData.road_name}
                        onChange={(e) => handleHouseDataChange('road_name', e.target.value)}
                        className="form-input"
                        disabled={houseAdded}
                        placeholder="Enter road name"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        value={houseData.address}
                        onChange={(e) => handleHouseDataChange('address', e.target.value)}
                        className="form-input"
                        rows="3"
                        disabled={houseAdded}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                  
                  {houseAdded ? (
                    <div className="house-added-status">
                      <span className="added-badge">House Added</span>
                    </div>
                  ) : (
                    <div className="house-actions">
                      <button 
                        className="save-btn full-width-btn" 
                        onClick={saveHouse}
                        disabled={saving || !houseData.house_name || !houseData.family_name || !houseData.area}
                      >
                        {saving ? 'Adding...' : 'Add House & Continue to Members'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Members Tab */}
              {activeTab === 'members' && (
                <div className="members-section">
                  <div className="members-header">
                    <h3>Add Family Members</h3>
                  </div>
                  
                  {/* Search for members */}
                  <div className="members-search">
                    <input
                      type="text"
                      placeholder="Search members by name or surname..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input search-input"
                    />
                    <p className="helper-text">Search and select members to add to the household. All members are pre-selected by default.</p>
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className="members-action-row">
                    <div className="selection-buttons">
                      <button className="select-all-btn small-btn" onClick={selectAllMembers}>
                        Select All
                      </button>
                      <button className="deselect-all-btn small-btn" onClick={deselectAllMembers}>
                        Deselect All
                      </button>
                    </div>
                    <div className="add-member-container">
                      <button className="add-member-btn" onClick={addMember}>
                        + Add New Member
                      </button>
                    </div>
                  </div>
                  <p className="helper-text">Use the checkboxes to select members to add. Click "Set as Guardian" to designate the primary household member.</p>
                  
                  <div className="members-list-container">
                    <div className="members-list">
                      {filteredMembers.map((member, index) => (
                        <div 
                          key={member.id} 
                          className={`member-card ${selectedMembers.has(member.id) ? 'selected' : ''}`}
                          onClick={(e) => {
                            // Prevent selection when clicking on form elements
                            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
                              toggleMemberSelection(member.id);
                            }
                          }}
                        >
                          <div className="member-header">
                            <div className="member-select-checkbox">
                              <input
                                type="checkbox"
                                checked={selectedMembers.has(member.id)}
                                onChange={() => toggleMemberSelection(member.id)}
                              />
                              <span>Member {index + 1}</span>
                            </div>
                            <div className="member-actions">
                              <button 
                                className={`guardian-btn ${guardianId === member.id ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGuardian(member.id);
                                }}
                              >
                                {guardianId === member.id ? '✓ Guardian' : 'Set as Guardian'}
                              </button>
                              <button 
                                className="remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMember(member.id);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          
                          <div className="member-details-grid">
                            {/* Name, Surname, Status, and Date of Birth */}
                            <div className="form-row">
                              <div className="form-group">
                                <label className="required">Full Name</label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter member's full name"
                                />
                                <span className="helper-text">Enter the member's complete given name(s)</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Family Surname</label>
                                <input
                                  type="text"
                                  value={member.surname}
                                  onChange={(e) => updateMember(member.id, 'surname', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter family surname"
                                />
                                <span className="helper-text">Enter the family's shared surname</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Status</label>
                                <select
                                  value={member.status}
                                  onChange={(e) => updateMember(member.id, 'status', e.target.value)}
                                  className="form-input select-input"
                                >
                                  <option value="live">Live</option>
                                  <option value="dead">Deceased</option>
                                  <option value="terminated">Terminated</option>
                                </select>
                                <span className="helper-text">Select the current status of the member</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                  type="date"
                                  value={member.date_of_birth}
                                  onChange={(e) => updateMember(member.id, 'date_of_birth', e.target.value)}
                                  className="form-input"
                                />
                                <span className="helper-text">Select the member's date of birth</span>
                              </div>
                            </div>
                            
                            {/* Aadhar, Phone, and WhatsApp */}
                            <div className="form-row">
                              <div className="form-group">
                                <label>Aadhar Number</label>
                                <input
                                  type="text"
                                  value={member.aadhar}
                                  onChange={(e) => updateMember(member.id, 'aadhar', e.target.value)}
                                  className="form-input"
                                  placeholder="12-digit Aadhar number"
                                />
                                <span className="helper-text">Enter 12-digit Aadhar card number</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                  type="tel"
                                  value={member.phone}
                                  onChange={(e) => updateMember(member.id, 'phone', e.target.value)}
                                  className="form-input"
                                  placeholder="10-digit phone number"
                                />
                                <span className="helper-text">Enter 10-digit mobile number</span>
                              </div>
                              
                              <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input
                                  type="tel"
                                  value={member.whatsapp}
                                  onChange={(e) => updateMember(member.id, 'whatsapp', e.target.value)}
                                  className="form-input"
                                  placeholder="10-digit WhatsApp number"
                                />
                                <span className="helper-text">Enter 10-digit WhatsApp number (if different)</span>
                              </div>
                              
                              <div className="form-group">
                                {/* Empty placeholder to maintain grid */}
                              </div>
                            </div>
                            
                            {/* Father and Mother Information */}
                            <div className="form-row">
                              <div className="form-group">
                                <label>Father's Full Name</label>
                                <input
                                  type="text"
                                  value={member.father_name}
                                  onChange={(e) => updateMember(member.id, 'father_name', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter father's full name"
                                />
                                <span className="helper-text">Enter father's complete given name(s)</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Father's Surname</label>
                                <input
                                  type="text"
                                  value={member.father_surname}
                                  onChange={(e) => updateMember(member.id, 'father_surname', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter father's family surname"
                                />
                                <span className="helper-text">Enter father's family surname</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Mother's Full Name</label>
                                <input
                                  type="text"
                                  value={member.mother_name}
                                  onChange={(e) => updateMember(member.id, 'mother_name', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter mother's full name"
                                />
                                <span className="helper-text">Enter mother's complete given name(s)</span>
                              </div>
                              
                              <div className="form-group">
                                <label>Mother's Surname</label>
                                <input
                                  type="text"
                                  value={member.mother_surname}
                                  onChange={(e) => updateMember(member.id, 'mother_surname', e.target.value)}
                                  className="form-input"
                                  placeholder="Enter mother's family surname"
                                />
                                <span className="helper-text">Enter mother's family surname</span>
                              </div>
                            </div>
                            
                            {/* Father Selection with Search */}
                            <div className="form-group">
                              <label>Link to Father (Optional)</label>
                              <div className="searchable-select">
                                <div className="select-display">
                                  {member.father_id ? (
                                    <span>
                                      {allMembers.find(m => m.id === member.father_id)?.name || 'Unknown Member'} 
                                      (#{member.father_id})
                                    </span>
                                  ) : (
                                    <span>Select a father</span>
                                  )}
                                  <button 
                                    type="button" 
                                    className="search-btn"
                                    onClick={() => setShowFatherSearch(prev => ({ ...prev, [member.id]: true }))}
                                  >
                                    <FaSearch />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Father Search Modal */}
                            {showFatherSearch[member.id] && (
                              <div className="search-modal-overlay">
                                <div className="search-modal">
                                  <div className="search-modal-header">
                                    <h3>Select Father</h3>
                                    <button 
                                      className="close-btn" 
                                      onClick={() => setShowFatherSearch(prev => ({ ...prev, [member.id]: false }))}
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                  <div className="search-modal-content">
                                    <input
                                      type="text"
                                      placeholder="Search by name or ID..."
                                      value={fatherSearchTerm[member.id] || ''}
                                      onChange={(e) => handleFatherSearch(member.id, e.target.value)}
                                      className="search-input"
                                    />
                                    <div className="search-results">
                                      {(fatherSearchResults[member.id] && fatherSearchResults[member.id].length > 0) ? (
                                        fatherSearchResults[member.id].map(father => (
                                          <div 
                                            key={father.member_id} 
                                            className="search-result-item"
                                            onClick={() => selectFather(member.id, father)}
                                          >
                                            <div className="search-result-title">{father.name || 'Unknown Member'}</div>
                                            <div className="search-result-subtitle">ID: #{father.member_id} {father.surname ? `(${father.surname})` : ''}</div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="no-results">No members found</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Mother Selection with Search */}
                            <div className="form-group">
                              <label>Link to Mother (Optional)</label>
                              <div className="searchable-select">
                                <div className="select-display">
                                  {member.mother_id ? (
                                    <span>
                                      {allMembers.find(m => m.id === member.mother_id)?.name || 'Unknown Member'} 
                                      (#{member.mother_id})
                                    </span>
                                  ) : (
                                    <span>Select a mother</span>
                                  )}
                                  <button 
                                    type="button" 
                                    className="search-btn"
                                    onClick={() => setShowMotherSearch(prev => ({ ...prev, [member.id]: true }))}
                                  >
                                    <FaSearch />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Mother Search Modal */}
                            {showMotherSearch[member.id] && (
                              <div className="search-modal-overlay">
                                <div className="search-modal">
                                  <div className="search-modal-header">
                                    <h3>Select Mother</h3>
                                    <button 
                                      className="close-btn" 
                                      onClick={() => setShowMotherSearch(prev => ({ ...prev, [member.id]: false }))}
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                  <div className="search-modal-content">
                                    <input
                                      type="text"
                                      placeholder="Search by name or ID..."
                                      value={motherSearchTerm[member.id] || ''}
                                      onChange={(e) => handleMotherSearch(member.id, e.target.value)}
                                      className="search-input"
                                    />
                                    <div className="search-results">
                                      {(motherSearchResults[member.id] && motherSearchResults[member.id].length > 0) ? (
                                        motherSearchResults[member.id].map(mother => (
                                          <div 
                                            key={mother.member_id} 
                                            className="search-result-item"
                                            onClick={() => selectMother(member.id, mother)}
                                          >
                                            <div className="search-result-title">{mother.name || 'Unknown Member'}</div>
                                            <div className="search-result-subtitle">ID: #{mother.member_id} {mother.surname ? `(${mother.surname})` : ''}</div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="no-results">No members found</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selected Members Count */}
                  <div className="selected-members-info">
                    {selectedMembers.size > 0 ? (
                      <p>{selectedMembers.size} member(s) selected for addition</p>
                    ) : (
                      <p>No members selected</p>
                    )}
                  </div>
                  
                  {/* Add Selected Members Button */}
                  <div className="add-selected-button-container">
                    <button 
                      className="save-btn full-width-btn" 
                      onClick={saveSelectedMembers}
                      disabled={saving || selectedMembers.size === 0}
                    >
                      {saving ? 'Adding Members...' : `Add ${selectedMembers.size} Selected Member(s)`}
                    </button>
                  </div>
                </div>
              )}
              
              {saveMessage && (
                <div className={`message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Members Modal */}
      {renderMembersModal()}
    </div>
  );
};

export default FirebaseDataImproved;