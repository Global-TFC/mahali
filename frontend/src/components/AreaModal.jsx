import React, { useState, useEffect } from 'react';
import { areaAPI } from '../api';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const AreaModal = ({ isOpen, onClose, onSubmit, initialData, loadDataForTab }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    // Reset status messages when modal opens
    setError(null);
    setSuccess(null);
  }, [initialData, isOpen]);

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
      if (initialData) {
        // Update existing area
        await areaAPI.update(initialData.id, formData);
        setSuccess('Area updated successfully!');
      } else {
        // Create new area
        await areaAPI.create(formData);
        setSuccess('Area created successfully!');
      }

      // Reload area data
      if (loadDataForTab) {
        loadDataForTab('areas', true); // Force reload
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save area');
      console.error('Error saving area:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in">
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper">
              <FaMapMarkerAlt />
            </div>
            {initialData ? 'Edit Area Profile' : 'Register New Area'}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>


        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Area Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. North Sector, Hill Top..."
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <small className="form-help">Enter a unique name for this zone.</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <div className="input-wrapper">
              <textarea
                id="description"
                name="description"
                placeholder="Key landmarks or geographical details..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              />
            </div>
          </div>

          {(error || success) && (
            <div className={`status-banner ${error ? 'error' : 'success'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{error ? '⚠️' : '✅'}</span>
                <span>{error || success}</span>
              </div>
            </div>
          )}


          <div className="modal-footer">
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
                <div className="btn-content">
                  <span className="spinner-small"></span>
                  <span>{initialData ? 'Syncing...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="btn-content">
                  {initialData ? 'Save Changes' : 'Confirm Registration'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaModal;