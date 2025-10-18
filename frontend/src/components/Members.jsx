import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import MemberModal from './MemberModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const Members = ({ members, setEditing, deleteItem, loadDataForTab }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)

  // Load members data when component mounts
  useEffect(() => {
    if (loadDataForTab) {
      loadDataForTab('members', false); // Load only once, not forced
    }
  }, [loadDataForTab]);

  const handleAddMember = () => {
    setCurrentMember(null)
    setIsModalOpen(true)
  }

  const handleEditMember = (member) => {
    setCurrentMember(member)
    setIsModalOpen(true)
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
      if (loadDataForTab) {
        loadDataForTab('members', true) // Force reload only after deletion
      }
    }
  }

  const handleReloadData = () => {
    if (loadDataForTab) {
      loadDataForTab('members', true) // Force reload when user clicks reload
    }
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
    <div className="data-section">
      <div className="section-header">
        <h2><FaUser /> Members</h2>
        <div className="header-actions">
          <button onClick={handleReloadData} className="reload-btn">Reload</button>
          <button onClick={handleAddMember} className="add-btn">+ Add New Member</button>
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>House</th>
              <th>Status</th>
              <th>Date of Birth</th>
              <th>Guardian</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.member_id}>
                <td>#{member.member_id}</td>
                <td>{member.name || 'Unknown Member'}</td>
                <td>{member.house?.house_name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${member.status === 'live' ? 'active' : member.status === 'dead' ? 'inactive' : 'terminated'}`}>
                    {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                  </span>
                </td>
                <td>{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                <td>{member.isGuardian ? 'Yes' : 'No'}</td>
                <td>{member.phone || member.whatsapp || 'N/A'}</td>
                <td>
                  <button onClick={() => handleViewMember(member)} className="view-btn">
                    <FaEye /> View
                  </button>
                  <button onClick={() => handleEditMember(member)} className="edit-btn">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDeleteMember(member)} className="delete-btn">
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="empty-state">
            <p>No members found. Add a new member to get started.</p>
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