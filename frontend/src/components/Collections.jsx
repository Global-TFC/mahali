import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFolder, FaPlus, FaEdit, FaTrash, FaRedo } from 'react-icons/fa'

const Collections = ({ 
  collections, 
  setEditing, 
  deleteItem, 
  setSelectedCollection,
  handleEditCollection,
  handleAddCollection,
  loadDataForTab
}) => {
  const navigate = useNavigate()

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

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaFolder /> Collections</h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn">
            <FaRedo /> Reload
          </button>
          <button onClick={handleAddCollection} className="add-btn">
            <FaPlus /> Add New Collection
          </button>
        </div>
      </div>
      
      <div className="collection-cards-container">
        {collections.map(collection => (
          <div 
            key={collection.id} 
            className="collection-card"
          >
            <div className="collection-card-icon">
              <FaFolder />
            </div>
            <div className="collection-card-name">
              {collection.name}
            </div>
            <div className="collection-card-actions">
              <button 
                className="open-btn"
                onClick={(e) => handleOpenCollection(collection, e)}
              >
                Open
              </button>
              <button 
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditCollection(collection)
                }}
              >
                <FaEdit /> Edit
              </button>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCollection(collection)
                }}
              >
                <FaTrash /> Delete
              </button>
            </div>
            <div 
              className="collection-card-overlay"
              onClick={() => handleCollectionClick(collection)}
            ></div>
          </div>
        ))}
        
        {/* Add New Collection Card */}
        <div 
          className="add-btn-card"
          onClick={handleAddCollection}
        >
          <div className="add-btn-card-icon">
            <FaPlus />
          </div>
          <div className="add-btn-card-text">
            Add New Collection
          </div>
        </div>
      </div>
      
      {collections.length === 0 && (
        <div className="empty-state">
          <p>No collections found. Add a new collection to get started.</p>
        </div>
      )}
    </div>
  )
}

export default Collections