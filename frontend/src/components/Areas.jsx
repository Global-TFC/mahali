import React, { useState } from 'react'
import { FaMapMarkerAlt, FaRedo, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import AreaModal from './AreaModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const Areas = ({ areas, setEditing, deleteItem, loadDataForTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentArea, setCurrentArea] = useState(null)
  const [areaToDelete, setAreaToDelete] = useState(null)

  const handleAddArea = () => {
    setCurrentArea(null)
    setIsModalOpen(true)
  }

  const handleEditArea = (area) => {
    setCurrentArea(area)
    setIsModalOpen(true)
  }

  const handleDeleteArea = (area) => {
    setAreaToDelete(area)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (areaToDelete) {
      await deleteItem('areas', areaToDelete.id)
      setIsDeleteModalOpen(false)
      setAreaToDelete(null)
      // Reload area data after deletion
      if (loadDataForTab) {
        loadDataForTab('areas', true) // Force reload
      }
    }
  }

  const handleModalSubmit = (formData) => {
    setEditing({ 
      type: 'areas', 
      data: currentArea ? { ...currentArea, ...formData } : formData 
    })
    setIsModalOpen(false)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setCurrentArea(null)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setAreaToDelete(null)
  }

  const handleReloadData = () => {
    if (loadDataForTab) {
      loadDataForTab('areas', true) // Force reload
    }
  }

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaMapMarkerAlt /> Areas</h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={handleAddArea} className="add-btn">
            <FaPlus /> Add New Area
          </button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Houses</th>
              <th>Live Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id}>
                <td>{area.name}</td>
                <td>{area.description || 'N/A'}</td>
                <td>{area.total_houses || area.houses?.length || 0}</td>
                <td>{area.total_live_members || 0}</td>
                <td>
                  <button onClick={() => handleEditArea(area)} className="edit-btn">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDeleteArea(area)} className="delete-btn">
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <AreaModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={currentArea}
        loadDataForTab={loadDataForTab}
      />
      
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        item={areaToDelete}
        itemType="areas"
      />
    </div>
  )
}

export default Areas