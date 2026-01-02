import React, { useState, useEffect } from 'react';
import { memberAPI, obligationAPI, areaAPI } from '../api';
import { FaMoneyBill, FaSearch, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';

const BulkObligationModal = ({ isOpen, onClose, onSubmit, selectedSubcollection, existingObligations = [] }) => {
  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [guardianFilter, setGuardianFilter] = useState(''); // '' for all, 'true' for guardian, 'false' for non-guardian
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectAllFiltered, setSelectAllFiltered] = useState(false);
  const [existingMemberIds, setExistingMemberIds] = useState([]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Always load members and areas when modal opens
      loadMembers();
      loadAreas();
      
      // Set existing member IDs from existing obligations
      const existingIds = existingObligations.map(ob => {
        // Handle both member object and member_id string
        if (ob.member?.member_id) {
          return ob.member.member_id;
        } else if (typeof ob.member === 'string') {
          return ob.member;
        }
        return null;
      }).filter(id => id);
      setExistingMemberIds(existingIds);
      setSelectedMembers([]);
      setSearchTerm('');
      setSelectedArea('');
      setGuardianFilter('');
      setSelectAllFiltered(false);
      setError(null);
      setSuccess(null);
      // Set default amount from subcollection
      setAmount(selectedSubcollection?.amount || '');
    } else {
      // Reset when modal closes
      setMembers([]);
      setFilteredMembers([]);
    }
  }, [isOpen, existingObligations, selectedSubcollection]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await memberAPI.getAll();
      console.log('BulkObligationModal: Members response:', response);
      console.log('BulkObligationModal: Members data:', response.data);
      
      // Handle paginated response
      let membersArray = [];
      if (Array.isArray(response.data)) {
        membersArray = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        membersArray = response.data.results;
      } else if (response.data && Array.isArray(response.data.data)) {
        membersArray = response.data.data;
      }
      
      console.log('BulkObligationModal: Members array length:', membersArray.length);
      console.log('BulkObligationModal: First member sample:', membersArray[0]);
      
      setMembers(membersArray);
      // Initially set filtered members to all members (will be filtered by applyFilters)
      setFilteredMembers(membersArray);
    } catch (err) {
      console.error('Failed to load members:', err);
      setError('Failed to load members: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const response = await areaAPI.getAll();
      setAreas(response.data);
    } catch (err) {
      console.error('Failed to load areas:', err);
    }
  };

  const applyFilters = () => {
    if (!members || members.length === 0) {
      console.log('BulkObligationModal: No members to filter');
      setFilteredMembers([]);
      return;
    }
    
    let filtered = [...members]; // Create a copy to avoid mutating original
    
    console.log('BulkObligationModal: Applying filters. Total members:', filtered.length);
    
    // Only show live members (but don't filter if no status field exists)
    filtered = filtered.filter(member => {
      // If member has no status field, include it
      if (!member.hasOwnProperty('status')) {
        return true;
      }
      // Otherwise, only include live members
      return member.status === 'live';
    });
    
    console.log('BulkObligationModal: After status filter:', filtered.length);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        (member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.surname && member.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.member_id && member.member_id.toString().includes(searchTerm))
      );
      console.log('BulkObligationModal: After search filter:', filtered.length);
    }
    
    // Apply area filter
    if (selectedArea) {
      filtered = filtered.filter(member => {
        // Handle different area data structures
        if (member.house?.area?.id) {
          return member.house.area.id === parseInt(selectedArea);
        } else if (member.house?.area) {
          // If area is just an ID
          return member.house.area === parseInt(selectedArea);
        } else if (member.house && typeof member.house === 'string') {
          // If house is just an ID, we can't filter by area
          return false;
        }
        // If no house or area info, exclude from filtered results when area filter is active
        return false;
      });
      console.log('BulkObligationModal: After area filter:', filtered.length);
    }
    
    // Apply guardian filter
    if (guardianFilter !== '') {
      filtered = filtered.filter(member => {
        const isGuardian = member.isGuardian === true || member.isGuardian === 'true';
        return String(isGuardian) === guardianFilter;
      });
      console.log('BulkObligationModal: After guardian filter:', filtered.length);
    }
    
    console.log('BulkObligationModal: Final filtered count:', filtered.length);
    setFilteredMembers(filtered);
  };

  // Apply filters when search terms, area, guardian filter, or members change
  useEffect(() => {
    if (isOpen && members.length > 0) {
      applyFilters();
    } else if (isOpen && members.length === 0 && !loading) {
      // If no members and not loading, show empty state
      setFilteredMembers([]);
    }
  }, [searchTerm, selectedArea, guardianFilter, members, isOpen, loading]);

  const handleMemberSelect = (memberId) => {
    // Don't allow selection of already added members
    if (existingMemberIds.includes(memberId)) {
      return;
    }
    
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSelectAllFiltered = () => {
    if (selectAllFiltered) {
      // Deselect all filtered members
      const newSelected = selectedMembers.filter(id => 
        !filteredMembers.some(member => member.member_id === id)
      );
      setSelectedMembers(newSelected);
    } else {
      // Select all filtered members (avoid duplicates and exclude existing members)
      const newSelected = [...selectedMembers];
      filteredMembers.forEach(member => {
        // Skip if already selected, already exists, or not live
        if (!newSelected.includes(member.member_id) && 
            !existingMemberIds.includes(member.member_id) && 
            member.status === 'live') {
          newSelected.push(member.member_id);
        }
      });
      setSelectedMembers(newSelected);
    }
    setSelectAllFiltered(!selectAllFiltered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (selectedMembers.length === 0) {
        throw new Error('Please select at least one member');
      }
      
      if (!selectedSubcollection) {
        throw new Error('No subcollection selected');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Prepare data for bulk submission
      const obligationsData = selectedMembers.map(memberId => ({
        member: memberId,
        subcollection: selectedSubcollection.id,
        amount: parseFloat(amount),
        paid_status: 'pending'
      }));
      
      // Call the onSubmit function
      await onSubmit({ obligations: obligationsData });
      
      setSuccess(`Successfully created ${selectedMembers.length} obligations!`);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create obligations');
      console.error('Error creating obligations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get available count (filtered members excluding existing)
  const availableCount = filteredMembers.filter(m => 
    !existingMemberIds.includes(m.member_id)
  ).length;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide">
        <div className="modal-header">
          <h2><FaMoneyBill /> Create Bulk Obligations</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {/* Member Selection - Full Height with Scroll */}
            <div className="form-group member-selection-section">
              <div className="form-group">
                <label htmlFor="search"><FaSearch /> Search Members</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, surname, or ID..."
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="area-filter">Area Filter</label>
                  <select
                    id="area-filter"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="filter-select"
                    disabled={loading}
                  >
                    <option value="">All Areas</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="guardian-filter">Guardian Filter</label>
                  <select
                    id="guardian-filter"
                    value={guardianFilter}
                    onChange={(e) => setGuardianFilter(e.target.value)}
                    className="filter-select"
                    disabled={loading}
                  >
                    <option value="">All Members</option>
                    <option value="true">Guardians Only</option>
                    <option value="false">Non-Guardians Only</option>
                  </select>
                </div>
              </div>
              
              <div className="bulk-selection-controls">
                <button 
                  type="button" 
                  className="select-all-btn"
                  onClick={handleSelectAllFiltered}
                  disabled={availableCount === 0 || loading}
                >
                  {selectAllFiltered ? 'Deselect All Filtered' : 'Select All Filtered'} ({availableCount} available)
                </button>
              </div>
              
              <div className="member-list-scrollable">
                {loading ? (
                  <div className="no-members">Loading members...</div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map(member => {
                    const isExisting = existingMemberIds.includes(member.member_id);
                    const isSelected = selectedMembers.includes(member.member_id);
                    // Only disable if existing, not based on status
                    const isDisabled = isExisting;
                    
                    // Get area name
                    let areaName = 'N/A';
                    if (member.house?.area?.name) {
                      areaName = member.house.area.name;
                    } else if (member.house?.area && typeof member.house.area === 'object') {
                      areaName = member.house.area.name || 'N/A';
                    } else if (member.house?.area_name) {
                      areaName = member.house.area_name;
                    }
                    
                    return (
                      <div 
                        key={member.member_id} 
                        className={`member-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleMemberSelect(member.member_id)}
                      >
                        <div className="member-info">
                          <div className="member-name">
                            {member.name || 'Unknown Member'} {member.surname ? member.surname : ''}
                          </div>
                          <div className="member-details">
                            ID: #{member.member_id} | 
                            House: {member.house?.house_name || 'N/A'} | 
                            Area: {areaName} |
                            Status: {member.status || 'N/A'} |
                            Guardian: {member.isGuardian ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="selection-indicator">
                          {isExisting ? '✓ Already Added' : 
                           isSelected ? '✓ Selected' : 
                           isDisabled ? '○ Disabled' : '○ Click to Select'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-members">
                    {members.length === 0 
                      ? 'No members found. Please add members first.' 
                      : searchTerm || selectedArea || guardianFilter 
                        ? 'No members found matching the current filters' 
                        : 'No members available'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Members and Submit Section */}
            <div className="form-group obligation-details-section">
              <div className="form-group">
                <label htmlFor="amount">Amount (₹) *</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount for each obligation"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Selected Members ({selectedMembers.length})</label>
                <div className="selected-members-list">
                  {selectedMembers.length > 0 ? (
                    selectedMembers.map(memberId => {
                      const member = members.find(m => m.member_id === memberId);
                      return (
                        <div key={memberId} className="selected-member-item">
                          <span>{member ? `${member.name}${member.surname ? ' ' + member.surname : ''} (#${member.member_id})` : memberId}</span>
                          <button 
                            type="button" 
                            className="remove-member-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMemberSelect(memberId);
                            }}
                            disabled={loading}
                          >
                            <FaMinus />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-selected-members">No members selected</div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Subcollection Details</label>
                <div className="subcollection-info">
                  <div><strong>Name:</strong> {selectedSubcollection?.name}</div>
                  <div><strong>Year:</strong> {selectedSubcollection?.year}</div>
                  <div><strong>Default Amount:</strong> ₹{selectedSubcollection?.amount}</div>
                </div>
              </div>
              
              {(error || success) && (
                <div className={`status-message ${error ? 'error' : 'success'}`}>
                  {error || success}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading || selectedMembers.length === 0 || !amount}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating {selectedMembers.length} Obligations...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Create {selectedMembers.length} Obligations
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkObligationModal;