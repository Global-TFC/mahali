import React, { useState, useEffect } from 'react';
import { memberAPI, houseAPI } from '../api';
import { FaUser, FaSearch, FaTimes, FaUpload } from 'react-icons/fa';

const MemberModal = ({ isOpen, onClose, onSubmit, initialData, loadDataForTab }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    house: '',
    status: 'live',
    date_of_birth: '',
    date_of_death: '',
    mother_name: '',
    mother_surname: '',
    mother: '',
    father_name: '',
    father_surname: '',
    father: '',
    adhar: '',
    phone: '',
    whatsapp: '',
    isGuardian: false,
    photo: null
  });

  const [houses, setHouses] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  const [showHouseSearch, setShowHouseSearch] = useState(false);
  const [showFatherSearch, setShowFatherSearch] = useState(false);
  const [showMotherSearch, setShowMotherSearch] = useState(false);

  const [houseSearchTerm, setHouseSearchTerm] = useState('');
  const [fatherSearchTerm, setFatherSearchTerm] = useState('');
  const [motherSearchTerm, setMotherSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false); // For houses/members loading
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDataLoading(true);
      setError(null);
      setSuccess(null);

      // Reset search states
      setHouseSearchTerm('');
      setFatherSearchTerm('');
      setMotherSearchTerm('');
      setFilteredHouses([]);
      setFilteredMembers([]);

      // Load data
      Promise.all([loadHouses(), loadMembers()])
        .finally(() => setDataLoading(false));

      // Set form data from initialData (if editing)
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          surname: initialData.surname || initialData.sur_name || '',
          house: initialData.house?.home_id || initialData.house?.id || initialData.house || '',
          status: initialData.status || initialData.member_status || 'live',
          date_of_birth: initialData.date_of_birth || '',
          date_of_death: initialData.date_of_death || '',
          mother_name: initialData.mother_name || '',
          mother_surname: initialData.mother_surname || '',
          mother: initialData.mother?.member_id || initialData.mother?.id || initialData.mother || '',
          father_name: initialData.father_name || '',
          father_surname: initialData.father_surname || '',
          father: initialData.father?.member_id || initialData.father?.id || initialData.father || '',
          adhar: initialData.adhar || '',
          phone: initialData.phone || '',
          whatsapp: initialData.whatsapp || '',
          isGuardian: initialData.isGuardian || initialData.isguardian || initialData.is_guardian || false,
          photo: null
        });
      } else {
        // Reset form for new member
        setFormData({
          name: '',
          surname: '',
          house: '',
          status: 'live',
          date_of_birth: '',
          date_of_death: '',
          mother_name: '',
          mother_surname: '',
          mother: '',
          father_name: '',
          father_surname: '',
          father: '',
          adhar: '',
          phone: '',
          whatsapp: '',
          isGuardian: false,
          photo: null
        });
      }
    }
  }, [initialData, isOpen]);

  const loadHouses = async () => {
    try {
      const response = await houseAPI.getAll();
      const houseList = response.data || [];
      setHouses(houseList);
      setFilteredHouses(houseList);
    } catch (err) {
      console.error('Failed to load houses:', err);
      setHouses([]);
      setFilteredHouses([]);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      const memberList = response.data || [];
      setAllMembers(memberList);
      setFilteredMembers(memberList);
    } catch (err) {
      console.error('Failed to load members:', err);
      setAllMembers([]);
      setFilteredMembers([]);
    }
  };

  const handleHouseSearch = (term) => {
    setHouseSearchTerm(term);
    if (!term.trim()) {
      setFilteredHouses(houses);
    } else {
      const filtered = houses.filter(house =>
        house.house_name?.toLowerCase().includes(term.toLowerCase()) ||
        house.home_id?.includes(term)
      );
      setFilteredHouses(filtered);
    }
  };

  const handleFatherSearch = (term) => {
    setFatherSearchTerm(term);
    filterMembers(term, setFilteredMembers);
  };

  const handleMotherSearch = (term) => {
    setMotherSearchTerm(term);
    filterMembers(term, setFilteredMembers);
  };

  const filterMembers = (term, setter) => {
    if (!term.trim()) {
      setter(allMembers);
    } else {
      const filtered = allMembers.filter(member =>
        member.name?.toLowerCase().includes(term.toLowerCase()) ||
        member.member_id?.includes(term)
      );
      setter(filtered);
    }
  };

  const selectHouse = (house) => {
    setFormData(prev => ({ ...prev, house: house.home_id }));
    setShowHouseSearch(false);
    setHouseSearchTerm('');
  };

  const selectFather = (member) => {
    setFormData(prev => ({
      ...prev,
      father: member.member_id,
      father_name: member.name || '',
      father_surname: member.surname || ''
    }));
    setShowFatherSearch(false);
    setFatherSearchTerm('');
  };

  const selectMother = (member) => {
    setFormData(prev => ({
      ...prev,
      mother: member.member_id,
      mother_name: member.name || '',
      mother_surname: member.surname || ''
    }));
    setShowMotherSearch(false);
    setMotherSearchTerm('');
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files[0] }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const submitData = { ...formData };

      if (submitData.status !== 'dead') {
        delete submitData.date_of_death;
      }
      if (!submitData.photo) delete submitData.photo;
      if (!submitData.father) delete submitData.father;
      if (!submitData.mother) delete submitData.mother;
      if (!submitData.house) delete submitData.house;

      // Field compatibility fixes
      if (submitData.sur_name && !submitData.surname) {
        submitData.surname = submitData.sur_name;
        delete submitData.sur_name;
      }
      if (submitData.member_status && !submitData.status) {
        submitData.status = submitData.member_status;
        delete submitData.member_status;
      }
      if (submitData.is_guardian !== undefined) {
        submitData.isGuardian = submitData.is_guardian;
        delete submitData.is_guardian;
      }
      if (submitData.isguardian !== undefined) {
        submitData.isGuardian = submitData.isguardian;
        delete submitData.isguardian;
      }

      if (initialData) {
        await memberAPI.update(initialData.member_id, submitData);
        setSuccess('Member updated successfully!');
      } else {
        await memberAPI.create(submitData);
        setSuccess('Member created successfully!');
      }

      if (loadDataForTab) {
        loadDataForTab('members', true);
      }

      setTimeout(() => {
        onClose();
        onSubmit && onSubmit(submitData);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Helper to get house name safely
  const getHouseName = (houseId) => {
    return houses?.find?.(h => h.home_id === houseId)?.house_name || 'Unknown House';
  };

  // Helper to get member name safely
  const getMemberName = (memberId) => {
    return allMembers?.find?.(m => m.member_id === memberId)?.name || 'Unknown Member';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide animate-in">
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper">
              <FaUser />
            </div>
            {initialData ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {dataLoading && <div className="status-banner info">Loading data...</div>}


        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading || dataLoading}
                placeholder="Enter full name"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="surname">Surname</label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Enter surname (optional)"
              />
            </div>
          </div>


          <div className="input-wrapper">
            <label htmlFor="photo">Photo (Optional)</label>
            <div className="photo-upload-container">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={loading || dataLoading}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <FaUpload /> {formData.photo ? 'Change Photo' : 'Choose Photo'}
              </label>
              {formData.photo && <span className="badge-primary" style={{ marginLeft: '12px' }}>{formData.photo.name}</span>}
            </div>
          </div>


          <div className="input-wrapper">
            <label>House</label>
            <div className="searchable-select">
              <div className="select-display" title="Click to search house">
                {formData.house ? (
                  <span>
                    {getHouseName(formData.house)} (#{formData.house})
                  </span>
                ) : (
                  <span style={{ opacity: 0.6 }}>Select a house</span>
                )}
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setShowHouseSearch(true)}
                  disabled={loading || dataLoading}
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>


          {showHouseSearch && (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <div className="modal-content animate-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h3>Select House</h3>
                  <button className="close-btn" onClick={() => setShowHouseSearch(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by house name or ID..."
                      value={houseSearchTerm}
                      onChange={(e) => handleHouseSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="search-results" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '16px' }}>
                    {filteredHouses.length > 0 ? (
                      filteredHouses.map(house => (
                        <div
                          key={house.home_id}
                          className="search-result-item"
                          onClick={() => selectHouse(house)}
                          style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <div style={{ fontWeight: 600 }}>{house.house_name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: #{house.home_id}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No houses found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={loading || dataLoading}
              >
                <option value="live">Live</option>
                <option value="dead">Dead</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="input-wrapper">
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                disabled={loading || dataLoading}
              />
            </div>
          </div>

          {formData.status === 'dead' && (
            <div className="input-wrapper">
              <label htmlFor="date_of_death">Date of Death</label>
              <input
                type="date"
                id="date_of_death"
                name="date_of_death"
                value={formData.date_of_death}
                onChange={handleChange}
                disabled={loading || dataLoading}
              />
            </div>
          )}


          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="father_name">Father's Name</label>
              <input
                type="text"
                id="father_name"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Father's first name"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="father_surname">Father's Surname</label>
              <input
                type="text"
                id="father_surname"
                name="father_surname"
                value={formData.father_surname}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Father's surname"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label>Link to Father (Optional)</label>
            <div className="searchable-select">
              <div className="select-display" title="Click to search member">
                {formData.father ? (
                  <span>
                    {getMemberName(formData.father)} (#{formData.father})
                  </span>
                ) : (
                  <span style={{ opacity: 0.6 }}>Select a father</span>
                )}
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setShowFatherSearch(true)}
                  disabled={loading || dataLoading}
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>


          {showFatherSearch && (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <div className="modal-content animate-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h3>Select Father</h3>
                  <button className="close-btn" onClick={() => setShowFatherSearch(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={fatherSearchTerm}
                      onChange={(e) => handleFatherSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="search-results" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '16px' }}>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(member => (
                        <div
                          key={member.member_id}
                          className="search-result-item"
                          onClick={() => selectFather(member)}
                          style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        >
                          <div style={{ fontWeight: 600 }}>{member.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: #{member.member_id}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="mother_name">Mother's Name</label>
              <input
                type="text"
                id="mother_name"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Mother's first name"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="mother_surname">Mother's Surname</label>
              <input
                type="text"
                id="mother_surname"
                name="mother_surname"
                value={formData.mother_surname}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Mother's surname"
              />
            </div>
          </div>

          <div className="input-wrapper">
            <label>Link to Mother (Optional)</label>
            <div className="searchable-select">
              <div className="select-display" title="Click to search member">
                {formData.mother ? (
                  <span>
                    {getMemberName(formData.mother)} (#{formData.mother})
                  </span>
                ) : (
                  <span style={{ opacity: 0.6 }}>Select a mother</span>
                )}
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => setShowMotherSearch(true)}
                  disabled={loading || dataLoading}
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>


          {showMotherSearch && (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <div className="modal-content animate-in" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <h3>Select Mother</h3>
                  <button className="close-btn" onClick={() => setShowMotherSearch(false)}>
                    <FaTimes />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={motherSearchTerm}
                      onChange={(e) => handleMotherSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="search-results" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '16px' }}>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(member => (
                        <div
                          key={member.member_id}
                          className="search-result-item"
                          onClick={() => selectMother(member)}
                          style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        >
                          <div style={{ fontWeight: 600 }}>{member.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: #{member.member_id}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          <div className="input-wrapper">
            <label htmlFor="adhar">Aadhar Number</label>
            <input
              type="text"
              id="adhar"
              name="adhar"
              value={formData.adhar}
              onChange={handleChange}
              disabled={loading || dataLoading}
              placeholder="12-digit Aadhar number"
              maxLength="12"
            />
          </div>


          <div className="form-row">
            <div className="input-wrapper">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="Phone number"
              />
            </div>
            <div className="input-wrapper">
              <label htmlFor="whatsapp">WhatsApp Number</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                disabled={loading || dataLoading}
                placeholder="WhatsApp number"
              />
            </div>
          </div>


          <div className="checkbox-group" style={{ marginBottom: '24px' }}>
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isGuardian"
                checked={formData.isGuardian}
                onChange={handleChange}
                disabled={loading || dataLoading}
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
              />
              <span className="checkbox-text" style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Is Guardian of the Family</span>
            </label>
          </div>

          {(error || success) && (
            <div className={`status-banner ${error ? 'error' : 'success'}`}>
              {error || success}
            </div>
          )}


          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading || dataLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || dataLoading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Member' : 'Create Member'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MemberModal;