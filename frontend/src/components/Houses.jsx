import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaHome, FaEdit, FaTrash } from 'react-icons/fa'
import HouseModal from './HouseModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { houseAPI, areaAPI } from '../api'

const Houses = ({ areas, setEditing, deleteItem, loadDataForTab }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentHouse, setCurrentHouse] = useState(null)
  const [houseToDelete, setHouseToDelete] = useState(null)
  const [houseList, setHouseList] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [localAreas, setLocalAreas] = useState([])
  const hasLoadedInitialData = useRef(false);
  const searchParamsRef = useRef({ searchTerm: '', selectedArea: '' });

  // Load areas for filtering
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await areaAPI.getAll();
        setLocalAreas(response.data);
      } catch (error) {
        console.error('Failed to load areas:', error);
      }
    };

    loadAreas();
  }, []);

  // Load houses data with pagination
  const loadHouses = useCallback(async (page = 1) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: 15
      };

      // Add search and filter parameters
      if (searchParamsRef.current.searchTerm) {
        params.search = searchParamsRef.current.searchTerm;
      }

      if (searchParamsRef.current.selectedArea) {
        params.area = searchParamsRef.current.selectedArea;
      }

      const response = await houseAPI.search(params);
      const newHouses = response.data.results || response.data;

      setHouseList(newHouses);

      // Set pagination info
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 15));
      }

    } catch (error) {
      console.error('Failed to load houses:', error);
      setHouseList([]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Load houses when component mounts - only once
  useEffect(() => {
    if (!hasLoadedInitialData.current) {
      loadHouses(1);
      setCurrentPage(1);
      hasLoadedInitialData.current = true;
    }
  }, [loadHouses]);

  // Handle search with debouncing - only call API when user stops typing for 1 second
  useEffect(() => {
    // Update the ref with current search params
    searchParamsRef.current = { searchTerm, selectedArea };

    // Only proceed if initial data has been loaded
    if (!hasLoadedInitialData.current) return;

    const handler = setTimeout(() => {
      loadHouses(1);
      setCurrentPage(1);
    }, 1000); // 1 second delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, selectedArea]); // Correct dependency array - only depend on search params

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
      loadHouses(currentPage);
    }
  }

  const handleReloadData = () => {
    loadHouses(currentPage);
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setCurrentHouse(null)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setHouseToDelete(null)
  }

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      loadHouses(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      loadHouses(currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <h2>
          <div className="header-icon-wrapper">
            <FaHome />
          </div>
          Houses
        </h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            Reload
          </button>
          <button onClick={handleAddHouse} className="btn-primary">
            + Add New House
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="house-search">Search Houses</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="house-search"
                placeholder="Name, family, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="house-area">Filter by Area</label>
            <div className="input-wrapper">
              <select
                id="house-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="filter-select"
              >
                <option value="">All Areas</option>
                {localAreas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </div>
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
              <th className="text-center">Members</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {houseList.length > 0 ? (
              houseList.map(house => (
                <tr key={house.home_id}>
                  <td className="text-muted font-mono">#{house.home_id}</td>
                  <td className="font-semibold">{house.house_name}</td>
                  <td>{house.family_name}</td>
                  <td>
                    <span className="badge-outline">{house.area_name || 'N/A'}</span>
                  </td>
                  <td className="text-muted">{house.location_name}</td>
                  <td className="text-center">
                    <span className="badge-primary">{house.member_count || 0}</span>
                  </td>
                  <td className="text-right">
                    <div className="action-btn-group">
                      <button onClick={() => handleViewHouse(house)} className="view-btn" title="View Details">
                        View
                      </button>
                      <button onClick={() => handleEditHouse(house)} className="edit-btn" title="Edit House">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteHouse(house)} className="delete-btn" title="Delete House">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : !loading && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  <div className="empty-state">
                    <p>No houses found. Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="loading-overlay-inline">
            <div className="spinner-small"></div>
            <p>Syncing houses...</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="btn-secondary"
          >
            Previous
          </button>

          <span className="pagination-info">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      <HouseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={currentHouse}
        areas={localAreas}
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