import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaRupeeSign, FaEdit, FaTrash, FaRedo } from 'react-icons/fa'

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
  const navigate = useNavigate()

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

  return (
    <div className="data-section">
      <div className="section-header">
        <h2>Subcollections - {selectedCollection?.name}</h2>
        <div className="header-actions">
          <button onClick={handleBack} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          <button onClick={handleReloadData} className="reload-btn">
            <FaRedo /> Reload
          </button>
          <button onClick={handleAddSubcollection} className="add-btn">
            <FaPlus /> Add New Subcollection
          </button>
        </div>
      </div>
      
      <div className="subcollection-cards-container">
        {subcollections
          .filter(sc => sc.collection === selectedCollection?.id)
          .map(subcollection => (
            <div 
              key={subcollection.id} 
              className="subcollection-card"
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
                  <FaRupeeSign /> {subcollection.amount}
                </div>
              </div>
              <div className="subcollection-card-actions">
                <button 
                  className="open-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSubcollection(subcollection)
                    navigate('/obligations')
                  }}
                >
                  Open
                </button>
                <button 
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditSubcollection(subcollection)
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSubcollection(subcollection)
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
              <div 
                className="subcollection-card-overlay"
                onClick={() => handleSubcollectionClick(subcollection)}
              ></div>
            </div>
          ))}
        
        {/* Add New Subcollection Card */}
        <div 
          className="add-btn-card"
          onClick={handleAddSubcollection}
        >
          <div className="add-btn-card-icon">
            <FaPlus />
          </div>
          <div className="add-btn-card-text">
            Add New Subcollection
          </div>
        </div>
      </div>
      
      {subcollections.filter(sc => sc.collection === selectedCollection?.id).length === 0 && (
        <div className="empty-state">
          <p>No subcollections found for this collection.</p>
        </div>
      )}
    </div>
  )
}

export default Subcollections