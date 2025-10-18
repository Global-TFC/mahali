import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { houseAPI, memberAPI, areaAPI } from '../api';
import { FaHome, FaUser, FaArrowLeft, FaCrown, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import HouseModal from './HouseModal';
import './App.css';

const HouseDetailsPage = ({ houses, members, areas, setEditing }) => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [houseMembers, setHouseMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Use useMemo to ensure we have a stable reference to houseId
  const stableHouseId = useMemo(() => houseId, [houseId]);

  useEffect(() => {
    const loadHouseData = async () => {
      try {
        setLoading(true);
        // Always fetch from API to get the latest data
        const houseResponse = await houseAPI.get(stableHouseId);
        setHouse(houseResponse.data);
        
        // Fetch area data from API
        if (houseResponse.data.area) {
          try {
            const areaResponse = await areaAPI.get(houseResponse.data.area);
            setArea(areaResponse.data);
          } catch (areaError) {
            console.error('Failed to load area data:', areaError);
          }
        }
        
        // Fetch members for this house
        const membersResponse = await memberAPI.getAll();
        const filteredMembers = membersResponse.data.filter(member => 
          member.house && member.house === houseResponse.data.home_id
        );
        setHouseMembers(filteredMembers);
      } catch (error) {
        console.error('Failed to load house data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stableHouseId) {
      loadHouseData();
    }
  }, [stableHouseId]); // Only depend on stableHouseId

  const getGuardian = () => {
    // Find the member marked as guardian
    return houseMembers.find(member => member.isGuardian) || 
           houseMembers.find(member => member.status === 'live');
  };

  const guardian = getGuardian();

  const handleBack = () => {
    navigate('/houses');
  };

  const handleViewMember = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const handleEditHouse = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    // Reload the house data after successful edit
    if (stableHouseId) {
      loadHouseData();
    }
  };

  if (loading) {
    return (
      <div className="data-section">
        <div className="tab-loading">
          <div className="spinner"></div>
          <p>Loading house details...</p>
        </div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="data-section">
        <div className="error-container">
          <h2>House not found</h2>
          <p>Could not find house with ID: {stableHouseId}</p>
          <button onClick={handleBack} className="back-btn">
            <FaArrowLeft /> Back to Houses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaHome /> House Details</h2>
        <div className="header-actions">
          <button onClick={handleEditHouse} className="edit-btn">
            <FaEdit /> Edit House
          </button>
          <button onClick={handleBack} className="back-btn">
            <FaArrowLeft /> Back to Houses
          </button>
        </div>
      </div>
      
      {/* ATM Style Cards */}
      <div className="atm-cards-row">
        {/* House ATM Card - Blue Gradient */}
        <div className="atm-card house-atm-card">
          <div className="atm-card-header">
            <div className="atm-card-icon">
              <FaHome />
            </div>
            <div className="atm-card-title">House Details</div>
            <div className="atm-card-id">#{house?.home_id || 'N/A'}</div>
          </div>
          
          <div className="atm-card-content">
            <div className="atm-card-field">
              <div className="atm-card-label">House Name</div>
              <div className="atm-card-value">{house?.house_name || 'N/A'}</div>
            </div>
            
            <div className="atm-card-field">
              <div className="atm-card-label">Family Name</div>
              <div className="atm-card-value">{house?.family_name || 'N/A'}</div>
            </div>
            
            <div className="atm-card-field">
              <div className="atm-card-label">Area</div>
              <div className="atm-card-value">{area?.name || 'N/A'}</div>
            </div>
            
            <div className="atm-card-field">
              <div className="atm-card-label">Location</div>
              <div className="atm-card-value">
                <FaMapMarkerAlt /> {house?.location_name || 'N/A'}
              </div>
            </div>
            
            <div className="atm-card-field">
              <div className="atm-card-label">Address</div>
              <div className="atm-card-value">{house?.address || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        {/* Guardian ATM Card - Orange Gradient */}
        {guardian && (
          <div className="atm-card" style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' }}>
            <div className="atm-card-header">
              <div className="atm-card-icon">
                <FaCrown />
              </div>
              <div className="atm-card-title">Family Guardian</div>
              <div className="atm-card-id">#{guardian?.member_id || 'N/A'}</div>
            </div>
            
            <div className="atm-card-content">
              <div className="atm-card-field">
                <div className="atm-card-label">Name</div>
                <div className="atm-card-value">{guardian?.name || 'Unknown Member'}</div>
              </div>
              
              <div className="atm-card-field">
                <div className="atm-card-label">Status</div>
                <div className="atm-card-value">
                  <span className={`status-badge ${guardian?.status === 'live' ? 'active' : guardian?.status === 'dead' ? 'inactive' : 'terminated'}`}>
                    {guardian?.status?.charAt(0).toUpperCase() + (guardian?.status?.slice(1) || '')}
                  </span>
                </div>
              </div>
              
              <div className="atm-card-field">
                <div className="atm-card-label">Phone</div>
                <div className="atm-card-value">
                  {guardian?.phone || guardian?.whatsapp || 'N/A'}
                </div>
              </div>
              
              <div className="atm-card-field">
                <button 
                  onClick={() => handleViewMember(guardian.member_id)}
                  className="view-house-btn"
                >
                  View Member Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Family Members Section - Designed like Obligations section */}
      <div className="dues-section">
        <h3><FaUser /> Family Members</h3>
        <div className="dues-content">
          {houseMembers.length > 0 ? (
            <div className="table-container-no-bg">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Date of Birth</th>
                    <th>Guardian</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {houseMembers.map(member => (
                    <tr key={member.member_id}>
                      <td>#{member.member_id}</td>
                      <td>{member.name || 'Unknown Member'}</td>
                      <td>{member.status}</td>
                      <td>{member.date_of_birth || 'N/A'}</td>
                      <td>{member.isGuardian ? 'Yes' : 'No'}</td>
                      <td>
                        <button 
                          onClick={() => handleViewMember(member.member_id)}
                          className="view-btn"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No members found for this house</p>
          )}
        </div>
      </div>
      
      {/* Obligations Section with margin top */}
      <div className="dues-section" style={{ marginTop: '30px' }}>
        <h3>Obligations</h3>
        <div className="dues-content">
          <p>No obligations found</p>
        </div>
      </div>
      
      {/* Edit House Modal */}
      <HouseModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSuccess}
        initialData={house}
      />
    </div>
  );
};

export default HouseDetailsPage;