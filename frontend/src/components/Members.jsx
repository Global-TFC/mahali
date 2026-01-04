import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEdit, FaTrash, FaEye, FaRedo } from 'react-icons/fa'
import MemberModal from './MemberModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { memberAPI, areaAPI } from '../api'

const Members = ({ members, setEditing, deleteItem, loadDataForTab }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [areas, setAreas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isGuardianFilter, setIsGuardianFilter] = useState('')
  const [filteredMembers, setFilteredMembers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isThrottling, setIsThrottling] = useState(false)

  // Load areas for filtering
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await areaAPI.getAll();
        setAreas(response.data);
      } catch (error) {
        console.error('Failed to load areas:', error);
      }
    };

    loadAreas();
  }, []);

  // Throttle function to prevent excessive API calls
  const throttle = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (isThrottling) return;
      setIsThrottling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        setIsThrottling(false);
      }, delay);
    };
  };

  // Load members data with pagination
  const loadMembers = useCallback(async (page = 1, append = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        page: page,
        page_size: 15
      };

      // Add search and filter parameters
      if (searchTerm) {
        params.search = searchTerm;
      }

      if (selectedArea) {
        params.area = selectedArea;
      }

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      if (isGuardianFilter !== '') {
        params.is_guardian = isGuardianFilter === 'true';
      }

      const response = await memberAPI.search(params);
      const newMembers = response.data.results || response.data;

      if (append) {
        setFilteredMembers(prev => [...prev, ...newMembers]);
      } else {
        setFilteredMembers(newMembers);
      }

      // Check if there are more pages
      if (response.data.next) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }

      setInitialLoad(false);
    } catch (error) {
      console.error('Failed to load members:', error);
      if (!append) {
        setFilteredMembers([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedArea, selectedStatus, isGuardianFilter, loading]);

  // Load members when filters change (throttled)
  const throttledLoadMembers = useCallback(throttle(() => {
    loadMembers(1, false);
    setCurrentPage(1);
  }, 500), [loadMembers]);

  // Load members when filters or page changes
  useEffect(() => {
    throttledLoadMembers();
  }, [searchTerm, selectedArea, selectedStatus, isGuardianFilter, throttledLoadMembers]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!hasMore || loading || initialLoad) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Check if user has scrolled to bottom (with 100px threshold)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMembers(currentPage + 1, true);
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading, initialLoad, currentPage, loadMembers]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleAddMember = () => {
    setCurrentMember(null)
    setIsModalOpen(true)
  }

  const handleEditMember = (member) => {
    // Transform member data to match the expected format for the modal
    const transformedMember = {
      ...member,
      house: member.house?.home_id || member.house || '',
      father: member.father?.member_id || member.father || '',
      mother: member.mother?.member_id || member.mother || '',
      isGuardian: member.isGuardian || member.isguardian || false
    };

    setCurrentMember(transformedMember);
    setIsModalOpen(true);
  }

  const handleDeleteMember = (member) => {
    setMemberToDelete(member)
    setIsDeleteModalOpen(true)
  }

  const handleViewMember = (member) => {
    // Navigate to member details page
    navigate(`/members/${member.member_id}`);
  }

  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteItem('members', memberToDelete.member_id)
      setIsDeleteModalOpen(false)
      setMemberToDelete(null)
      // Reload member data after deletion
      loadMembers(1, false);
    }
  }

  const handleReloadData = () => {
    loadMembers(1, false);
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setCurrentMember(null)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
    setMemberToDelete(null)
  }

  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <h2>
          <div className="header-icon-wrapper">
            <FaUser />
          </div>
          Members
        </h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn" title="Reload Data">
            <FaRedo />
          </button>
          <button onClick={handleAddMember} className="btn-primary">
            + New Member
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-section">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="member-search">Global Search</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="member-search"
                placeholder="Name, surname, or house..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="member-area">Area</label>
            <div className="input-wrapper">
              <select
                id="member-area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="filter-select"
              >
                <option value="">All Areas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="member-status">Vital Status</label>
            <div className="input-wrapper">
              <select
                id="member-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="live">Live</option>
                <option value="dead">Deceased</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="member-guardian">Role</label>
            <div className="input-wrapper">
              <select
                id="member-guardian"
                value={isGuardianFilter}
                onChange={(e) => setIsGuardianFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                <option value="true">Guardians Only</option>
                <option value="false">Non-Guardians</option>
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
              <th>Full Name</th>
              <th>Area / House</th>
              <th className="text-center">Status</th>
              <th className="text-center">Role</th>
              <th>Contact Info</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <tr key={member.member_id}>
                  <td className="text-muted font-mono">#{member.member_id}</td>
                  <td>
                    <div className="font-semibold">{member.name} {member.surname}</div>
                  </td>
                  <td>
                    <div className="badge-outline" style={{ display: 'block', textAlign: 'center', marginBottom: '4px' }}>
                      {member.house?.area?.name || member.house?.area_name || 'N/A'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {member.house?.house_name || 'No House'}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${member.status === 'live' ? 'active' : member.status === 'dead' ? 'inactive' : 'terminated'}`}>
                      {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                    </span>
                  </td>
                  <td className="text-center">
                    {member.isGuardian ? (
                      <span className="badge-primary" style={{ fontSize: '0.7rem' }}>Guardian</span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '1.2rem' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>{member.phone || 'No Phone'}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{member.whatsapp || ''}</div>
                  </td>
                  <td className="text-right">
                    <div className="action-btn-group">
                      <button onClick={() => handleViewMember(member)} className="view-btn" title="View Profile">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEditMember(member)} className="edit-btn" title="Edit Member">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteMember(member)} className="delete-btn" title="Delete">
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
                    <p>No members found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="loading-overlay-inline">
            <div className="spinner-small"></div>
            <p>Fetching members...</p>
          </div>
        )}
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={currentMember}
        loadDataForTab={loadDataForTab}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        item={memberToDelete}
        itemType="members"
      />
    </div>
  )
}

export default Members