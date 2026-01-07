import React, { useState } from 'react'
import { FaMapMarkerAlt, FaRedo, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import DeleteConfirmModal from './DeleteConfirmModal'

const Areas = ({ areas, setEditing, deleteItem, loadDataForTab }) => {
  const navigate = useNavigate()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [areaToDelete, setAreaToDelete] = useState(null)

  const handleAddArea = () => {
    navigate('/areas/add')
  }

  const handleEditArea = (area) => {
    navigate(`/areas/edit/${area.id}`)
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