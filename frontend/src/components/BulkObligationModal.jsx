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
      <div className="modal-content modal-content-wide animate-in">
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper">
              <FaMoneyBill />
            </div>
            Create Bulk Obligations
          </h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            {/* Member Selection - Full Height with Scroll */}
            <div className="input-wrapper member-selection-section">
              <div className="input-wrapper">
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
                <div className="input-wrapper">
                  <label htmlFor="area-filter">Area</label>
                  <select
                    id="area-filter"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All Areas</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>

                <div className="input-wrapper">
                  <label htmlFor="guardian-filter">Guardian</label>
                  <select
                    id="guardian-filter"
                    value={guardianFilter}
                    onChange={(e) => setGuardianFilter(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleSelectAllFiltered}
                  disabled={availableCount === 0 || loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {selectAllFiltered ? 'Deselect All Filtered' : 'Select All Filtered'} ({availableCount} available)
                </button>
              </div>

              <div className="member-list-scrollable" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '24px', textAlign: 'center' }}><span className="spinner"></span></div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map(member => {
                    const isExisting = existingMemberIds.includes(member.member_id);
                    const isSelected = selectedMembers.includes(member.member_id);
                    const isDisabled = isExisting;

                    return (
                      <div
                        key={member.member_id}
                        className={`member-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && handleMemberSelect(member.member_id)}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          marginBottom: '4px',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                          background: isSelected ? 'var(--primary-glass)' : 'var(--header-bg)',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div className="member-info">
                          <div style={{ fontWeight: 600 }}>{member.name || 'Unknown'} {member.surname ? member.surname : ''}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ID: #{member.member_id} | House: {member.house?.house_name || 'N/A'}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          {isExisting ? <span className="badge-primary success">Added</span> :
                            isSelected ? <span className="badge-primary">Selected</span> :
                              <span style={{ color: 'var(--text-muted)' }}>Select</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</div>
                )}
              </div>
            </div>

            {/* Selected Members and Submit Section */}
            <div className="input-wrapper obligation-details-section" style={{ background: 'var(--header-bg)', padding: '24px', borderRadius: '16px' }}>
              <div className="input-wrapper">
                <label htmlFor="amount">Amount per Person (₹) *</label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={loading}
                  style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                />
              </div>

              <div className="input-wrapper">
                <label>Recipients ({selectedMembers.length})</label>
                <div className="selected-members-list" style={{ maxHeight: '180px', overflowY: 'auto', background: 'var(--body-bg)', borderRadius: '12px', padding: '8px' }}>
                  {selectedMembers.length > 0 ? (
                    selectedMembers.map(memberId => {
                      const member = members.find(m => m.member_id === memberId);
                      return (
                        <div key={memberId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--header-bg)', borderRadius: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem' }}>{member ? member.name : memberId}</span>
                          <button
                            type="button"
                            onClick={() => handleMemberSelect(memberId)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                          >
                            <FaMinus />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>None selected</div>
                  )}
                </div>
              </div>

              <div style={{ margin: '20px 0', padding: '16px', background: 'var(--surface-glass)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Target Subcollection</div>
                <div style={{ fontWeight: 600 }}>{selectedSubcollection?.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Year: {selectedSubcollection?.year}</div>
              </div>

              {(error || success) && (
                <div className={`status-banner ${error ? 'error' : 'success'}`} style={{ marginBottom: '16px' }}>
                  {error || success}
                </div>
              )}

              <div className="form-actions" style={{ flexDirection: 'column' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || selectedMembers.length === 0 || !amount}
                  style={{ width: '100%', height: '48px' }}
                >
                  {loading ? <span className="spinner"></span> : `Generate ${selectedMembers.length} Obligations`}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  Cancel
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