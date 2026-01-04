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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Load members when modal opens
      loadMembers();

      if (initialData) {
        // When editing, ensure we get the amount from initialData
        const amountValue = initialData.amount !== undefined && initialData.amount !== null
          ? initialData.amount
          : selectedSubcollection?.amount || '';

        setFormData({
          member: initialData.member?.member_id || initialData.member || '',
          amount: amountValue,
          paid_status: initialData.paid_status || 'pending'
        });

        console.log('ObligationModal: Editing obligation with data:', {
          initialData,
          amountValue,
          formData: {
            member: initialData.member?.member_id || initialData.member || '',
            amount: amountValue,
            paid_status: initialData.paid_status || 'pending'
          }
        });
      } else {
        setFormData({
          member: '',
          amount: selectedSubcollection?.amount || '',
          paid_status: 'pending'
        });
      }

      // Reset status messages when modal opens
      setError(null);
      setSuccess(null);
      setSearchTerm('');
    }
  }, [initialData, selectedSubcollection, isOpen]);

  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const applyFilters = () => {
    let filtered = members;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, members, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberSelect = (memberId) => {
    setFormData(prev => ({
      ...prev,
      member: memberId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!selectedSubcollection) {
        throw new Error('No subcollection selected. Please navigate from a subcollection to create obligations.');
      }

      if (!formData.member) {
        throw new Error('Please select a member');
      }

      if (!formData.amount || formData.amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        subcollection: selectedSubcollection.id
      };

      // Call the onSubmit function
      await onSubmit(submitData, initialData);

      setSuccess('Obligation saved successfully!');

      // Close modal after a short delay
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

  // If no subcollection is selected, show an error message
  if (!selectedSubcollection) {
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-content-wide">
          <div className="modal-header">
            <h2><FaMoneyBill /> Error</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="status-message error">
              No subcollection selected. Please navigate to obligations from a specific subcollection.
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide animate-in">
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

          {initialData ? (
            // Simplified form for editing - focus on amount and status
            <div className="modal-body animate-in">
              <div className="input-wrapper">
                <label htmlFor="edit-member">Member</label>
                <input
                  type="text"
                  id="edit-member"
                  value={initialData.member?.name || 'Unknown Member'}
                  disabled
                />
                <small className="form-help">
                  ID: #{initialData.member?.member_id || 'N/A'} |
                  House: {initialData.member?.house?.house_name || 'N/A'}
                </small>
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
                  placeholder="Enter amount"
                  style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}
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
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {(error || success) && (
                <div className={`status-banner ${error ? 'error' : 'success'}`}>
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
                      Updating...
                    </>
                  ) : (
                    'Update Obligation'
                  )}
                </button>
              </div>
            </div>

          ) : (
            // Full form for creating new obligation
            <div className="form-row">
              {/* Member Selection - Full Height with Scroll */}
              <div className="input-wrapper member-selection-section">
                <label>Select Member *</label>
                <div className="member-search-container" style={{ background: 'var(--header-bg)', borderRadius: '12px', padding: '16px' }}>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search member by name..."
                      disabled={loading}
                    />
                  </div>

                  <div className="member-list-scrollable" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(member => (
                        <div
                          key={member.member_id}
                          className={`member-item ${formData.member === member.member_id ? 'selected' : ''}`}
                          onClick={() => handleMemberSelect(member.member_id)}
                          style={{
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            background: formData.member === member.member_id ? 'var(--primary-glass)' : 'transparent',
                            border: formData.member === member.member_id ? '1px solid var(--primary)' : '1px solid transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div className="member-info">
                            <div className="member-name" style={{ fontWeight: 600 }}>{member.name || 'Unknown Member'}</div>
                            <div className="member-details" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              ID: #{member.member_id} | House: {member.house?.house_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-members" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount and Status Section */}
              <div className="input-wrapper obligation-details-section">
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
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>

                {(error || success) && (
                  <div className={`status-banner ${error ? 'error' : 'success'}`} style={{ margin: '16px 0' }}>
                    {error || success}
                  </div>
                )}

                <div className="form-actions" style={{ marginTop: 'auto' }}>
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
                        Creating...
                      </>
                    ) : (
                      'Create Obligation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ObligationModal;