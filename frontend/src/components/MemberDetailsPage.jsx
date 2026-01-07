import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { memberAPI, houseAPI, areaAPI, obligationAPI, subcollectionAPI } from '../api';
import { FaUser, FaHome, FaMapMarkerAlt, FaPhone, FaBirthdayCake, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

import DeleteConfirmModal from './DeleteConfirmModal';
import './App.css';

const MemberDetailsPage = ({ members, houses, areas, setEditing, deleteItem, loadDataForTab }) => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [house, setHouse] = useState(null);
  const [area, setArea] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const [obligations, setObligations] = useState([]);
  const [subcollections, setSubcollections] = useState([]);

  // Use useMemo to ensure we have a stable reference to memberId
  const stableMemberId = useMemo(() => memberId, [memberId]);

  useEffect(() => {
    const loadMemberData = async () => {
      try {
        setLoading(true);
        // Always fetch from API to get the latest data
        const memberResponse = await memberAPI.get(stableMemberId);
        setMember(memberResponse.data);

        // Fetch house and area data
        if (memberResponse.data.house) {
          const houseResponse = await houseAPI.get(memberResponse.data.house);
          setHouse(houseResponse.data);

          if (houseResponse.data.area) {
            const areaResponse = await areaAPI.get(houseResponse.data.area);
            setArea(areaResponse.data);
          }
        }

        // Fetch obligations for this member
        const obligationsResponse = await obligationAPI.getAll();
        const memberObligations = obligationsResponse.data.filter(obligation =>
          obligation.member === memberResponse.data.member_id ||
          (typeof obligation.member === 'object' && obligation.member.member_id === memberResponse.data.member_id)
        );
        setObligations(memberObligations);

        // Fetch subcollections
        const subcollectionsResponse = await subcollectionAPI.getAll();
        setSubcollections(subcollectionsResponse.data);
      } catch (error) {
        console.error('Failed to load member data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stableMemberId) {
      loadMemberData();
    }
  }, [stableMemberId]); // Only depend on stableMemberId

  const handleEditMember = () => {
    navigate(`/members/edit/${member.member_id}`);
  };

  const handleDeleteMember = () => {
    if (member) {
      setMemberToDelete(member);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteItem('members', memberToDelete.member_id);
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
        // Navigate back to members list
        navigate('/members');
        // Reload member data after deletion
        if (loadDataForTab) {
          loadDataForTab('members', true);
        }
      } catch (error) {
        console.error('Failed to delete member:', error);
      }
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handleViewHouse = () => {
    if (house) {
      navigate(`/houses/${house.home_id}`);
    }
  };

  const handleBack = () => {
    navigate('/members');
  };



  if (loading) {
    return (
      <div className="data-section">
        <div className="tab-loading">
          <div className="spinner"></div>
          <p>Loading member details...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="data-section">
        <div className="error-container">
          <h2>Member not found</h2>
          <p>Could not find member with ID: {stableMemberId}</p>
          <button onClick={handleBack} className="back-btn">
            <FaArrowLeft /> Back to Members
          </button>
        </div>
      </div>
    );
  }

  // Find the area for this house
  const houseArea = area || (house?.area ?
    (typeof house.area === 'object' ? house.area : null) :
    null);

  // Prepare member data for table display (excluding fields already shown in ATM cards)
  const memberData = [
    { label: 'Member ID', value: `#${member?.member_id || 'N/A'}` },
    { label: 'Gender', value: member?.gender ? (member.gender.charAt(0).toUpperCase() + member.gender.slice(1)) : 'N/A' },
    { label: 'Married To', value: member?.married_to_name ? `${member.married_to_name} ${member.married_to_surname || ''}` + (member.married_to ? ` (#${member.married_to})` : '') : 'N/A' },
    { label: 'General Body Member', value: member?.general_body_member ? 'Yes' : 'No' },
    { label: 'Aadhar Number', value: member?.adhar || 'N/A' },
    { label: 'WhatsApp', value: member?.whatsapp || 'N/A' },
    { label: 'House ID', value: `#${house?.home_id || 'N/A'}` },
    { label: 'Father\'s Name', value: member?.father_name ? `${member.father_name} ${member.father_surname || ''}` : 'N/A' },
    { label: 'Mother\'s Name', value: member?.mother_name ? `${member.mother_name} ${member.mother_surname || ''}` : 'N/A' },
    { label: 'Guardian', value: member?.isGuardian ? 'Yes' : 'No' },
    { label: 'Date of Death', value: member?.date_of_death ? new Date(member.date_of_death).toLocaleDateString() : 'N/A' },
    { label: 'Address', value: house?.address || 'N/A' }
  ];

  return (
    <div className="data-section animate-in">
      <div className="section-header">
        <div className="header-content-wrapper">
          <button onClick={handleBack} className="back-btn" title="Back to Members">
            <FaArrowLeft />
          </button>
          <h2>
            <div className="header-icon-wrapper" style={{ background: 'var(--accent-gradient)' }}>
              <FaUser />
            </div>
            Member Certificate: {member?.name}
          </h2>
        </div>
        <div className="header-actions">
          <button onClick={handleEditMember} className="btn-secondary">
            <FaEdit /> Edit Profile
          </button>
          <button onClick={handleDeleteMember} className="delete-btn" style={{ padding: '10px 20px' }}>
            <FaTrash /> Remove
          </button>
        </div>
      </div>

      <div className="member-details-container">
        {/* ATM Style Cards */}
        <div className="atm-cards-row">
          {/* Member ATM Card - Green Gradient */}
          <div className="atm-card member-atm-card animate-in" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="atm-card-header">
              <div className="atm-card-title">Member Identity</div>
              <div className="atm-card-id">#{member?.member_id}</div>
            </div>

            <div className="atm-card-number">
              {member?.name?.toUpperCase() || 'RESIDENT'} {member?.surname?.toUpperCase() || ''}
            </div>

            <div className="atm-card-footer">
              <div className="atm-card-holder">
                <div className="atm-card-label">Primary Contact</div>
                <div className="atm-card-value">{member?.phone || 'N/A'}</div>
              </div>
              <div className="atm-card-expiry">
                <div className="atm-card-label">Member Status</div>
                <div className="atm-card-value" style={{ textTransform: 'capitalize' }}>{member?.status}</div>
              </div>
            </div>

            <div className="atm-chip" style={{ background: 'rgba(255,255,255,0.4)' }}></div>
          </div>

          {/* House ATM Card - Blue Gradient */}
          {house && (
            <div className="atm-card house-atm-card animate-in" style={{ animationDelay: '0.2s' }}>
              <div className="atm-card-header">
                <div className="atm-card-title">Residential Link</div>
                <div className="atm-card-id">#{house?.home_id}</div>
              </div>

              <div className="atm-card-number">
                {house?.house_name?.toUpperCase() || 'RESIDENTIAL UNIT'}
              </div>

              <div className="atm-card-footer">
                <div className="atm-card-holder">
                  <div className="atm-card-label">Family Reference</div>
                  <div className="atm-card-value">{house?.family_name || 'N/A'}</div>
                </div>
                <div className="atm-card-button">
                  <button onClick={handleViewHouse} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                    Show House
                  </button>
                </div>
              </div>

              <div className="atm-chip"></div>
            </div>
          )}
        </div>

        {/* Member Full Details Section in Grid Format */}
        <div className="dashboard-grid" style={{ marginTop: '32px' }}>
          <div className="data-section" style={{ padding: '24px' }}>
            <div className="section-header">
              <h3><FaBirthdayCake style={{ marginRight: '8px', color: 'var(--primary)' }} /> Core Information</h3>
            </div>

            <div className="member-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {memberData.map((item, index) => (
                <div className="detail-item" key={index} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                  <div className="font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Obligations Section */}
          <div className="data-section" style={{ padding: '24px' }}>
            <div className="section-header">
              <h3>💰 Member Ledger</h3>
              <span className="badge-primary">{obligations.length} Entries</span>
            </div>

            <div className="table-container-no-bg">
              {obligations.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {obligations.slice(0, 10).map(obligation => {
                      const subcollection = subcollections.find(sc => sc.id === (typeof obligation.subcollection === 'object' ? obligation.subcollection.id : obligation.subcollection));
                      return (
                        <tr key={obligation.id}>
                          <td className="font-mono" style={{ fontSize: '0.85rem' }}>{subcollection?.name || 'Item'}</td>
                          <td className="font-semibold">₹{obligation.amount}</td>
                          <td>
                            <span className={`status-badge ${obligation.paid_status === 'paid' ? 'active' : 'pending'}`}>
                              {obligation.paid_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <p className="text-muted">No financial obligations recorded for this member.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        item={memberToDelete}
        itemType="members"
      />
    </div>
  );
};

export default MemberDetailsPage;