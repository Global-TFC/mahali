import React, { useState, useEffect } from 'react';
import { memberAPI, areaAPI } from '../api';
import { FaClipboard, FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const SubcollectionModal = ({ isOpen, onClose, onSubmit, initialData, selectedCollection, collections }) => {
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    amount: '',
    due_date: '',
    collection: selectedCollection?.id || ''
  });

  const [members, setMembers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [guardianFilter, setGuardianFilter] = useState(''); // '' for all, 'true' for guardian, 'false' for non-guardian

  useEffect(() => {
    if (isOpen) {
      // Load members and areas when modal opens
      loadMembers();
      loadAreas();

      if (initialData) {
        setFormData({
          name: initialData.name || '',
          year: initialData.year || new Date().getFullYear(),
          amount: initialData.amount || '',
          due_date: initialData.due_date || '',
          collection: initialData.collection?.id || selectedCollection?.id || ''
        });

        // If editing, load existing member obligations
        if (initialData.obligations) {
          setSelectedMembers(initialData.obligations.map(ob => ob.member?.member_id || ob.member));
        }
      } else {
        setFormData({
          name: '',
          year: new Date().getFullYear(),
          amount: '',
          due_date: '',
          collection: selectedCollection?.id || ''
        });
        setSelectedMembers([]);
      }

      // Reset status messages when modal opens
      setError(null);
      setSuccess(null);
      setSearchTerm('');
      setSelectedArea('');
      setBirthYear('');
    }
  }, [initialData, selectedCollection, isOpen]);

  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (err) {
      console.error('Failed to load members:', err);
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
    let filtered = members;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        (member.name && member.name.toLowerCase().includes(term)) ||
        (member.surname && member.surname.toLowerCase().includes(term)) ||
        (member.member_id && member.member_id.toString().includes(term))
      );
    }

    // Apply area filter
    if (selectedArea) {
      filtered = filtered.filter(member =>
        member.house && member.house.area && member.house.area.id === selectedArea
      );
    }

    // Apply birth year filter
    if (birthYear) {
      filtered = filtered.filter(member =>
        member.date_of_birth && new Date(member.date_of_birth).getFullYear() == birthYear
      );
    }

    // Apply guardian filter
    if (guardianFilter !== '') {
      filtered = filtered.filter(member =>
        String(member.isGuardian) === guardianFilter
      );
    }

    // Only show live members
    filtered = filtered.filter(member => member.status === 'live');

    setFilteredMembers(filtered);
  };

  useEffect(() => {
    if (isOpen) {
      applyFilters();
    }
  }, [searchTerm, selectedArea, birthYear, guardianFilter, members, isOpen]);

  const handleMemberSelect = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  // Select all filtered members
  const handleSelectAllFiltered = () => {
    const filteredMemberIds = filteredMembers.map(member => member.member_id);
    setSelectedMembers(filteredMemberIds);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data for submission
      const submitData = { ...formData };

      // Ensure collection is included
      if (!submitData.collection && selectedCollection?.id) {
        submitData.collection = selectedCollection.id;
      }

      // Call the onSubmit function with both subcollection data and selected members
      await onSubmit(submitData, selectedMembers, initialData);

      setSuccess('Subcollection saved successfully!');

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.response?.data || 'Failed to save subcollection');
      console.error('Error saving subcollection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide animate-in">
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper">
              <FaClipboard />
            </div>
            {initialData ? 'Edit Subcollection' : 'Add New Subcollection'}
          </h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-wrapper">
            <label htmlFor="name">Subcollection Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter subcollection name"
            />
          </div>


          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                disabled={loading}
                min="2000"
                max="2100"
              />
            </div>

            <div className="input-wrapper">
              <label htmlFor="amount">Amount (₹) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="due_date">Due Date</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              disabled={loading}
            />
          </div>


          {/* Member Selection Section */}
          <div className="section-header">
            <h3>Select Members for this Subcollection</h3>
          </div>

          {/* Filters */}
          <div className="filter-section animate-in" style={{ animationDelay: '0.1s', background: 'var(--header-bg)', padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
            <div className="form-row">
              <div className="input-wrapper">
                <label htmlFor="search"><FaSearch /> Search</label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, Name or Surname..."
                  disabled={loading}
                />
              </div>

              <div className="input-wrapper">
                <label htmlFor="area"><FaFilter /> Area</label>
                <select
                  id="area"
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
                <label htmlFor="birthYear"><FaFilter /> Birth Year</label>
                <input
                  type="number"
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="YYYY"
                  disabled={loading}
                  min="1900"
                  max={new Date().getFullYear()}
                />
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

            {/* Select All Filtered Button */}
            <div style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleSelectAllFiltered}
                disabled={loading || filteredMembers.length === 0}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Select All Filtered Members ({filteredMembers.length})
              </button>
            </div>
          </div>


          {/* Member List */}
          <div className="member-selection-container animate-in" style={{ animationDelay: '0.2s', background: 'var(--header-bg)', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="member-list-header" style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-glass)' }}>
              <div style={{ fontWeight: 600 }}>Selected: {selectedMembers.length} members</div>
            </div>

            <div className="member-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <div
                    key={member.member_id}
                    className={`member-item ${selectedMembers.includes(member.member_id) ? 'selected' : ''}`}
                    onClick={() => handleMemberSelect(member.member_id)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selectedMembers.includes(member.member_id) ? 'var(--primary-glass)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div className="member-info">
                      <div className="member-name" style={{ fontWeight: 600 }}>
                        {`${member.member_id} - ${member.name} ${member.surname || ''}`}
                      </div>
                      <div className="member-details" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        House: {member.house?.house_name || 'N/A'} | Area: {member.house?.area?.name || 'N/A'}
                      </div>
                    </div>
                    <div className="selection-indicator">
                      {selectedMembers.includes(member.member_id) ?
                        <span className="badge-primary">Selected</span> :
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select</span>
                      }
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-members" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No members found matching the current filters</div>
              )}
            </div>
          </div>


          {(error || success) && (
            <div className={`status-banner ${error ? 'error' : 'success'}`} style={{ marginBottom: '24px' }}>
              {error || success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Subcollection' : 'Create Subcollection'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SubcollectionModal;