import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collectionAPI } from '../api'
import { FaFolder, FaPlus, FaEdit, FaTrash, FaRedo, FaTimes } from 'react-icons/fa'

const Collections = ({
  collections,
  setEditing,
  deleteItem,
  setSelectedCollection,
  loadDataForTab
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  // Load collections data on initial mount
  useEffect(() => {
    loadDataForTab('collections', false)
  }, [loadDataForTab])

  const handleCollectionClick = (collection) => {
    setSelectedCollection(collection)
    navigate('/subcollections')
  }

  const handleOpenCollection = (collection, e) => {
    e.stopPropagation()
    setSelectedCollection(collection)
    navigate('/subcollections')
  }

  const handleReloadData = () => {
    loadDataForTab('collections', true) // Force reload
  }

  const handleDeleteCollection = async (collection) => {
    if (window.confirm(`Are you sure you want to delete the collection "${collection.name}"? This will also delete all associated subcollections and obligations.`)) {
      try {
        await deleteItem('collections', collection.id)
      } catch (error) {
        console.error('Failed to delete collection:', error)
        alert('Failed to delete collection. Please try again.')
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
        throw new Error('Collection name is required');
      }

      if (editingCollection) {
        // Update existing collection
        await collectionAPI.update(editingCollection.id, formData);
        setSuccess('Collection updated successfully!');
      } else {
        // Create new collection
        await collectionAPI.create(formData);
        setSuccess('Collection created successfully!');
      }

      // Reset form
      setFormData({ name: '', description: '' });
      setEditingCollection(null);
      setShowAddForm(false);

      // Reload collections
      loadDataForTab('collections', true);
    } catch (err) {
      setError(err.message || 'Failed to save collection');
      console.error('Error saving collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const [editingCollection, setEditingCollection] = useState(null);

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingCollection(null);
    setFormData({ name: '', description: '' });
    setError(null);
    setSuccess(null);
  };

  const handleEditClick = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || ''
    });
    setShowAddForm(true);
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
        throw new Error('Collection name is required');
      }

      // Update the collection
      await collectionAPI.update(editingCollection.id, formData);

      // Reset form
      setFormData({ name: '', description: '' });
      setEditingCollection(null);
      setShowAddForm(false);
      setSuccess('Collection updated successfully!');

      // Reload collections
      loadDataForTab('collections', true);
    } catch (err) {
      setError(err.message || 'Failed to update collection');
      console.error('Error updating collection:', err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <h2>
          <div className="header-icon-wrapper">
            <FaFolder />
          </div>
          Collections
        </h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            + Create New Collection
          </button>
        </div>

        {/* Collection Form Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content animate-in">
              <div className="modal-header">
                <h2>{editingCollection ? 'Modify Collection' : 'Register Collection'}</h2>
                <button className="close-btn" onClick={handleFormClose}>×</button>
              </div>
              <form onSubmit={handleFormSubmit} className="modal-body">
                <div className="form-group">
                  <label htmlFor="collectionName">Internal Unique Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="collectionName"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      disabled={loading}
                      placeholder="e.g. Annual Fund 2024"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="collectionDescription">Public Description</label>
                  <div className="input-wrapper">
                    <textarea
                      id="collectionDescription"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      disabled={loading}
                      placeholder="Details about intended usage..."
                      rows="3"
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
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleFormClose}
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
                        <span>Saving...</span>
                      </div>
                    ) : (
                      editingCollection ? 'Update' : 'Confirm'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="collection-cards-container">
        {collections.map(collection => (
          <div
            key={collection.id}
            className="collection-card"
            onClick={() => handleCollectionClick(collection)}
          >
            <div className="collection-card-icon">
              <FaFolder />
            </div>
            <div className="collection-card-name">
              {collection.name}
            </div>
            <div className="collection-card-actions">
              <button
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditClick(collection)
                }}
              >
                <FaEdit />
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCollection(collection)
                }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Collection Card */}
        <div
          className="add-btn-card"
          onClick={() => setShowAddForm(true)}
        >
          <div className="add-btn-card-icon">
            <FaPlus />
          </div>
          <div className="add-btn-card-text">
            Register Collection
          </div>
        </div>
      </div>

      {collections.length === 0 && (
        <div className="empty-state">
          <p>The collection vault is empty. Start by registering a new one.</p>
        </div>
      )}
    </div>
  )
}

export default Collections