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
        <h2>
          <div className="header-icon-wrapper">
            <FaMapMarkerAlt />
          </div>
          Areas
        </h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={handleAddArea} className="btn-primary">
            <FaPlus /> Add New Area
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Area Name</th>
              <th>Description</th>
              <th className="text-center">Houses</th>
              <th className="text-center">Live Members</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.length > 0 ? (
              areas.map(area => (
                <tr key={area.id}>
                  <td className="font-semibold">{area.name}</td>
                  <td className="text-muted">{area.description || 'No description'}</td>
                  <td className="text-center">
                    <span className="badge-outline">{area.total_houses || area.houses?.length || 0}</span>
                  </td>
                  <td className="text-center">
                    <span className="badge-primary">{area.total_live_members || 0}</span>
                  </td>
                  <td className="text-right">
                    <div className="action-btn-group">
                      <button onClick={() => handleEditArea(area)} className="edit-btn" title="Edit Area">
                        <FaEdit /> <span>Edit</span>
                      </button>
                      <button onClick={() => handleDeleteArea(area)} className="delete-btn" title="Delete Area">
                        <FaTrash /> <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  <div className="empty-state">
                    <p>No areas found. Create your first area to get started.</p>
                  </div>
                </td>
              </tr>
            )}
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