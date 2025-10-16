import React, { useState, useEffect } from 'react';
import { areaAPI } from '../api';

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
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Edit Area' : 'Add New Area'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Area Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              disabled={loading}
            />
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Area' : 'Create Area'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaModal;