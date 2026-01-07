import React, { useState, useEffect } from 'react';
import { memberAPI } from '../api';
import { FaMoneyBill, FaSearch, FaTimes } from 'react-icons/fa';

const ObligationModal = ({ isOpen, onClose, onSubmit, initialData, selectedSubcollection }) => {
  const [formData, setFormData] = useState({
    member: '',
    amount: selectedSubcollection?.amount || '',
    paid_status: 'pending'
  });

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMembers();

      if (initialData) {
        const amountValue = initialData.amount !== undefined && initialData.amount !== null
          ? initialData.amount
          : selectedSubcollection?.amount || '';

        setFormData({
          member: initialData.member?.member_id || initialData.member || '',
          amount: amountValue,
          paid_status: initialData.paid_status || 'pending'
        });

        const memberData = initialData.member;
        if (memberData) {
          setSearchTerm(`${memberData.member_id} - ${memberData.name} ${memberData.surname || ''}`);
        }
      } else {
        setFormData({
          member: '',
          amount: selectedSubcollection?.amount || '',
          paid_status: 'pending'
        });
        setSearchTerm('');
      }

      setError(null);
      setSuccess(null);
      setShowSearch(false);
    }
  }, [initialData, selectedSubcollection, isOpen]);

  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      const liveMembers = (response.data || []).filter(m => m.status === 'live');
      setMembers(liveMembers);
      setFilteredMembers(liveMembers);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredMembers(members);
      setFormData(prev => ({ ...prev, member: '' }));
    } else {
      const filtered = members.filter(member =>
        member.name?.toLowerCase().includes(term.toLowerCase()) ||
        member.surname?.toLowerCase().includes(term.toLowerCase()) ||
        member.member_id?.toString().includes(term.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
    setShowSearch(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberSelect = (member) => {
    setFormData(prev => ({
      ...prev,
      member: member.member_id
    }));
    setSearchTerm(`${member.member_id} - ${member.name} ${member.surname || ''}`);
    setShowSearch(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!selectedSubcollection) {
        throw new Error('No subcollection selected.');
      }

      if (!formData.member) {
        throw new Error('Please select a member');
      }

      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const submitData = {
        ...formData,
        subcollection: selectedSubcollection.id
      };

      await onSubmit(submitData, initialData);

      setSuccess('Obligation saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save obligation');
      console.error('Error saving obligation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Dropdown results sub-component (consistent with MemberForm)
  const DropdownResults = ({ results, onSelect, show }) => {
    if (!show) return null;
    return (
      <div className="inline-dropdown-results animate-in" style={{ top: 'calc(100% + 4px)', maxHeight: '200px' }}>
        {results.length > 0 ? results.map(item => (
          <div key={item.member_id} className="dropdown-item" onClick={() => onSelect(item)}>
            <div className="item-name">
              {`${item.member_id} - ${item.name} ${item.surname || ''}`}
            </div>
          </div>
        )) : <div className="no-results-item">No members found</div>}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (!e.target.closest('.searchable-input-wrapper')) setShowSearch(false);
    }}>
      <div className="modal-content animate-in">
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper">
              <FaMoneyBill />
            </div>
            {initialData ? 'Edit Obligation' : 'Add New Obligation'}
          </h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">

          {/* Member Selection - Now Inline Search */}
          <div className="input-wrapper searchable-input-wrapper">
            <label>Select Member *</label>
            <div className="search-input-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder="Type name or ID..."
                disabled={loading || !!initialData}
                required
                className="form-input"
              />
              <FaSearch className="search-field-icon" />
              <DropdownResults results={filteredMembers} onSelect={handleMemberSelect} show={showSearch} />
            </div>
            {initialData && <small className="form-help">Member cannot be changed during edit</small>}
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
              placeholder="0.00"
              className="form-input"
              style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="paid_status">Payment Status *</label>
            <select
              id="paid_status"
              name="paid_status"
              value={formData.paid_status}
              onChange={handleChange}
              required
              disabled={loading}
              className="form-input"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {(error || success) && (
            <div className={`status-banner ${error ? 'error' : 'success'}`} style={{ marginTop: '16px' }}>
              {error || success}
            </div>
          )}

          <div className="form-actions" style={{ marginTop: '24px' }}>
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
                initialData ? 'Update Obligation' : 'Create Obligation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ObligationModal;