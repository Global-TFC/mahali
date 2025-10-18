import React, { useState } from 'react'
import { FaHome, FaRedo, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import HouseModal from './HouseModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const Houses = ({ houses, areas, setEditing, deleteItem, loadDataForTab, onViewHouse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentHouse, setCurrentHouse] = useState(null)
  const [houseToDelete, setHouseToDelete] = useState(null)
  const [houseToView, setHouseToView] = useState(null)

  const handleAddHouse = () => {
    setCurrentHouse(null)
    setIsModalOpen(true)
  }

  const handleEditHouse = (house) => {
    setCurrentHouse(house)
    setIsModalOpen(true)
  }

  const handleDeleteHouse = (house) => {
    setHouseToDelete(house)
    setIsDeleteModalOpen(true)
  }

  const handleViewHouse = (house) => {
    if (onViewHouse) {
      onViewHouse(house);
    }
  }

  const confirmDelete = async () => {
    if (houseToDelete) {
      await deleteItem('houses', houseToDelete.home_id)
      setIsDeleteModalOpen(false)
      setHouseToDelete(null)
      // Reload house data after deletion
      if (loadDataForTab) {
        loadDataForTab('houses', true) // Force reload
      }
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setCurrentHouse(null)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setHouseToDelete(null)
  }

  const handleReloadData = () => {
    if (loadDataForTab) {
      loadDataForTab('houses', true) // Force reload
    }
  }

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaHome /> Houses</h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={handleAddHouse} className="add-btn">
            <FaPlus /> Add New House
          </button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>House Name</th>
              <th>Family Name</th>
              <th>Location</th>
              <th>Area</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {houses.map(house => (
              <tr key={house.home_id}>
                <td>#{house.home_id}</td>
                <td>{house.house_name}</td>
                <td>{house.family_name}</td>
                <td>{house.location_name}</td>
                <td>{house.area?.name || 'N/A'}</td>
                <td>
                  <button onClick={() => handleViewHouse(house)} className="view-btn">
                    <FaEye /> View
                  </button>
                  <button onClick={() => handleEditHouse(house)} className="edit-btn">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDeleteHouse(house)} className="delete-btn">
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {houses.length === 0 && (
          <div className="empty-state">
            <p>No houses found. Add a new house to get started.</p>
          </div>
        )}
      </div>
      
      <HouseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={currentHouse}
        loadDataForTab={loadDataForTab}
      />
      
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        item={houseToDelete}
        itemType="houses"
      />
    </div>
  )
}

export default Houses