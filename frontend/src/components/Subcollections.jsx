import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subcollectionAPI } from '../api'
import { FaArrowLeft, FaPlus, FaRupeeSign, FaEdit, FaTrash, FaRedo, FaTimes } from 'react-icons/fa'

const Subcollections = ({
  subcollections,
  selectedCollection,
  setEditing,
  deleteItem,
  setSelectedSubcollection,
  handleEditSubcollection,
  handleAddSubcollection,
  loadDataForTab
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    amount: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load subcollections data on initial mount
  useEffect(() => {
    loadDataForTab('subcollections', false)
  }, [loadDataForTab])

  const handleSubcollectionClick = (subcollection) => {
    setSelectedSubcollection(subcollection)
    navigate('/obligations')
  }

  const handleReloadData = () => {
    loadDataForTab('subcollections', true) // Force reload
  }

  const handleBack = () => {
    navigate('/collections')
  }

  const handleDeleteSubcollection = async (subcollection) => {
    if (window.confirm(`Are you sure you want to delete the subcollection "${subcollection.name}"?`)) {
      try {
        await deleteItem('subcollections', subcollection.id)
      } catch (error) {
        console.error('Failed to delete subcollection:', error)
        alert('Failed to delete subcollection. Please try again.')
      }
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Subcollection name is required');
      }
      if (!formData.amount) {
        throw new Error('Amount is required');
      }

      if (editingSubcollection) {
        // Update existing subcollection
        await subcollectionAPI.update(editingSubcollection.id, {
          ...formData,
          collection: selectedCollection?.id
        });
        setSuccess('Subcollection updated successfully!');
      } else {
        // Create new subcollection
        await subcollectionAPI.create({
          ...formData,
          collection: selectedCollection?.id
        });
        setSuccess('Subcollection created successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        amount: '',
        due_date: ''
      });
      setEditingSubcollection(null);
      setShowAddForm(false);

      // Reload subcollections
      loadDataForTab('subcollections', true);
    } catch (err) {
      setError(err.message || 'Failed to save subcollection');
      console.error('Error saving subcollection:', err);
    } finally {
      setLoading(false);
    }
  };

  const [editingSubcollection, setEditingSubcollection] = useState(null);

  const navigate = useNavigate();

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingSubcollection(null);
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      amount: '',
      due_date: ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (subcollection) => {
    setEditingSubcollection(subcollection);
    setFormData({
      name: subcollection.name,
      year: subcollection.year,
      amount: subcollection.amount,
      due_date: subcollection.due_date || ''
    });
    setShowAddForm(true); // Show the form
    setError(null);
    setSuccess(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Subcollection name is required');
      }
      if (!formData.amount) {
        throw new Error('Amount is required');
      }

      // Update the subcollection
      await subcollectionAPI.update(editingSubcollection.id, {
        ...formData,
        collection: selectedCollection?.id
      });

      // Reset form
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        amount: '',
        due_date: ''
      });
      setEditingSubcollection(null);
      setShowAddForm(false);
      setSuccess('Subcollection updated successfully!');

      // Reload subcollections
      loadDataForTab('subcollections', true);
    } catch (err) {
      setError(err.message || 'Failed to update subcollection');
      console.error('Error updating subcollection:', err);
    } finally {
      setLoading(false);
    }
  };

  // This function is now redundant since handleFormSubmit handles both create and update
  // Keeping it for consistency but it's not used directly now

  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <div className="header-content-wrapper">
          <button onClick={handleBack} className="back-btn" title="Back to Collections">
            <FaArrowLeft />
          </button>
          <h2>
            <div className="header-icon-wrapper">
              <FaRupeeSign />
            </div>
            Sub-vaults: {selectedCollection?.name}
          </h2>
        </div>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            + New Subcollection
          </button>
        </div>

        {/* Subcollection Form Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content animate-in">
              <div className="modal-header">
                <h2>{editingSubcollection ? 'Edit Period Entry' : 'New Period Entry'}</h2>
                <button className="close-btn" onClick={handleFormClose}>×</button>
              </div>
              <form onSubmit={handleFormSubmit} className="modal-body">
                <div className="form-group">
                  <label htmlFor="subcollectionName">Entry Label</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="subcollectionName"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      disabled={loading}
                      placeholder="e.g. Monthly Dues Jan"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="subcollectionYear">Fiscal Year</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        id="subcollectionYear"
                        name="year"
                        value={formData.year}
                        onChange={handleFormChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subcollectionAmount">Base Amount (₹)</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        id="subcollectionAmount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleFormChange}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subcollectionDueDate">Settlement Deadline</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      id="subcollectionDueDate"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleFormChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {(error || success) && (
                  <div className={`status-banner ${error ? 'error' : 'success'}`}>
                    <div className="status-icon">{error ? '⚠️' : '✅'}</div>
                    <p>{error || success}</p>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleFormClose}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="subcollection-cards-container">
        {subcollections
          .filter(sc => sc.collection === selectedCollection?.id)
          .map(subcollection => (
            <div
              key={subcollection.id}
              className="subcollection-card"
              onClick={() => handleSubcollectionClick(subcollection)}
            >
              <div className="subcollection-card-icon">
                <FaRupeeSign />
              </div>
              <div className="subcollection-card-name">
                {subcollection.name}
              </div>
              <div className="subcollection-card-details">
                <div className="subcollection-card-year">
                  {subcollection.year}
                </div>
                <div className="subcollection-card-amount">
                  ₹ {subcollection.amount}
                </div>
              </div>
              <div className="subcollection-card-actions">
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick(subcollection)
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSubcollection(subcollection)
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

        {/* Add New Subcollection Card */}
        <div className="add-btn-card" onClick={() => setShowAddForm(true)}>
          <div className="add-btn-card-icon"><FaPlus /></div>
          <div className="add-btn-card-text">New Period</div>
        </div>
      </div>

      {subcollections.filter(sc => sc.collection === selectedCollection?.id).length === 0 && (
        <div className="empty-state">
          <p>This vault is currently empty.</p>
        </div>
      )}
    </div>
  )
}

export default Subcollections