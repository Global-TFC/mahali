import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaEdit, FaTrash } from 'react-icons/fa'
import HouseModal from './HouseModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const Houses = ({ houses, areas, setEditing, deleteItem, loadDataForTab }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentHouse, setCurrentHouse] = useState(null)
  const [houseToDelete, setHouseToDelete] = useState(null)

  // Load houses data when component mounts
  useEffect(() => {
    if (loadDataForTab) {
      loadDataForTab('houses', false); // Load only once, not forced
    }
  }, [loadDataForTab]);

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
    // Navigate to house details page
    navigate(`/houses/${house.home_id}`);
  }

  const confirmDelete = async () => {
    if (houseToDelete) {
      await deleteItem('houses', houseToDelete.home_id)
      setIsDeleteModalOpen(false)
      setHouseToDelete(null)
      // Reload house data after deletion
      if (loadDataForTab) {
        loadDataForTab('houses', true) // Force reload only after deletion
      }
    }
  }

  const handleReloadData = () => {
    if (loadDataForTab) {
      loadDataForTab('houses', true) // Force reload when user clicks reload
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

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaHome /> Houses</h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn">Reload</button>
          <button onClick={handleAddHouse} className="add-btn">+ Add New House</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>House Name</th>
              <th>Family Name</th>
              <th>Area</th>
              <th>Location</th>
              <th>Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {houses.map(house => (
              <tr key={house.home_id}>
                <td>#{house.home_id}</td>
                <td>{house.house_name}</td>
                <td>{house.family_name}</td>
                <td>{house.area?.name || 'N/A'}</td>
                <td>{house.location_name}</td>
                <td>{house.member_count || 0}</td>
                <td>
                  <button onClick={() => handleViewHouse(house)} className="view-btn">
                    View
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
        areas={areas}
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