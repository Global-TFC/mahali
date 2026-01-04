import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { houseAPI, memberAPI, areaAPI, obligationAPI } from '../api';
import { FaHome, FaUser, FaArrowLeft, FaCrown, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import HouseModal from './HouseModal';
import './App.css';

const HouseDetailsPage = ({ houses, members, areas, subcollections, setEditing, loadDataForTab }) => {
  const { houseId } = useParams();
  const navigate = useNavigate();
  const [house, setHouse] = useState(null);
  const [houseMembers, setHouseMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [obligations, setObligations] = useState([]);

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

        console.log('Full members response:', membersResponse);

        console.log('Full members data:', membersResponse.data);

        // Check if membersResponse.data is an array, if not, try to access the actual array
        let membersArray = [];
        if (Array.isArray(membersResponse.data)) {
          membersArray = membersResponse.data;
          console.log('Using membersResponse.data array, length:', membersArray.length);
        } else if (membersResponse.data && Array.isArray(membersResponse.data.results)) {
          // Handle paginated response
          membersArray = membersResponse.data.results;
          console.log('Using membersResponse.data.results array, length:', membersArray.length);
        } else if (Array.isArray(membersResponse)) {
          // If the response itself is an array
          membersArray = membersResponse;
          console.log('Using membersResponse as array, length:', membersArray.length);
        }

        console.log('Expected house ID:', houseResponse.data.home_id, 'Type:', typeof houseResponse.data.home_id);
        console.log('Members array to filter:', membersArray);

        const filteredMembers = membersArray.filter(member => {
          const memberHouse = member.house;
          const expectedHouseId = houseResponse.data.home_id;

          console.log('Checking member:', member.name || member.member_id, 'Member house field:', memberHouse, 'Type:', typeof memberHouse);

          // Handle different formats of house reference
          if (!memberHouse) {
            console.log('Member has no house field');
            return false;
          }

          // Convert both to strings for comparison to handle type differences
          const expectedHouseIdStr = String(expectedHouseId);

          console.log('Comparing member.house (raw):', memberHouse, 'with expected:', expectedHouseIdStr);

          // Check if member.house is a string representation of a number that equals expected ID
          if (String(memberHouse) === expectedHouseIdStr) {
            console.log('Direct string match found for member:', member.name || member.member_id);
            return true;
          }

          // Check if member.house is a number that equals expected ID
          if (Number(memberHouse) === Number(expectedHouseId)) {
            console.log('Number match found for member:', member.name || member.member_id);
            return true;
          }

          // Case 2: member.house is an object with a home_id property
          if (typeof memberHouse === 'object' && memberHouse.home_id != undefined) {
            if (String(memberHouse.home_id) === expectedHouseIdStr) {
              console.log('Object with home_id match found for member:', member.name || member.member_id);
              return true;
            }
          }

          // Case 3: member.house is an object with an id property
          if (typeof memberHouse === 'object' && memberHouse.id != undefined) {
            if (String(memberHouse.id) === expectedHouseIdStr) {
              console.log('Object with id match found for member:', member.name || member.member_id);
              return true;
            }
          }

          // Case 4: member.house is an object with a pk property (Django primary key)
          if (typeof memberHouse === 'object' && memberHouse.pk != undefined) {
            if (String(memberHouse.pk) === expectedHouseIdStr) {
              console.log('Object with pk match found for member:', member.name || member.member_id);
              return true;
            }
          }

          // Case 5: member.house is an object with a home property
          if (typeof memberHouse === 'object' && memberHouse.home != undefined) {
            if (String(memberHouse.home) === expectedHouseIdStr) {
              console.log('Object with home property match found for member:', member.name || member.member_id);
              return true;
            }
          }

          console.log('No match for member:', member.name || member.member_id, 'with house value:', memberHouse);
          return false;
        });

        console.log('Filtered members result:', filteredMembers);
        setHouseMembers(filteredMembers);

        // Fetch obligations for all members in this house
        const obligationsResponse = await obligationAPI.getAll();
        const houseMemberIds = filteredMembers.map(member => member.member_id);
        const houseObligations = obligationsResponse.data.filter(obligation =>
          houseMemberIds.includes(obligation.member) ||
          houseMemberIds.includes(obligation.member?.member_id)
        );
        setObligations(houseObligations);
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

  const handleEditSuccess = async () => {
    // Reload the house data after successful edit
    if (stableHouseId) {
      await loadHouseData();
    }
    // Close the modal
    setIsEditModalOpen(false);
    // Reload data for houses tab
    if (loadDataForTab) {
      loadDataForTab('houses', true);
    }
  };

  // Function to reload house data (for use in handleEditSuccess)
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

      console.log('Full members response:', membersResponse);

      console.log('Full members data:', membersResponse.data);

      // Check if membersResponse.data is an array, if not, try to access the actual array
      let membersArray = [];
      if (Array.isArray(membersResponse.data)) {
        membersArray = membersResponse.data;
        console.log('Using membersResponse.data array, length:', membersArray.length);
      } else if (membersResponse.data && Array.isArray(membersResponse.data.results)) {
        // Handle paginated response
        membersArray = membersResponse.data.results;
        console.log('Using membersResponse.data.results array, length:', membersArray.length);
      } else if (Array.isArray(membersResponse)) {
        // If the response itself is an array
        membersArray = membersResponse;
        console.log('Using membersResponse as array, length:', membersArray.length);
      }

      console.log('Expected house ID:', houseResponse.data.home_id, 'Type:', typeof houseResponse.data.home_id);
      console.log('Members array to filter:', membersArray);

      const filteredMembers = membersArray.filter(member => {
        const memberHouse = member.house;
        const expectedHouseId = houseResponse.data.home_id;

        console.log('Checking member:', member.name || member.member_id, 'Member house field:', memberHouse, 'Type:', typeof memberHouse);

        // Handle different formats of house reference
        if (!memberHouse) {
          console.log('Member has no house field');
          return false;
        }

        // Convert both to strings for comparison to handle type differences
        const expectedHouseIdStr = String(expectedHouseId);

        console.log('Comparing member.house (raw):', memberHouse, 'with expected:', expectedHouseIdStr);

        // Check if member.house is a string representation of a number that equals expected ID
        if (String(memberHouse) === expectedHouseIdStr) {
          console.log('Direct string match found for member:', member.name || member.member_id);
          return true;
        }

        // Check if member.house is a number that equals expected ID
        if (Number(memberHouse) === Number(expectedHouseId)) {
          console.log('Number match found for member:', member.name || member.member_id);
          return true;
        }

        // Case 2: member.house is an object with a home_id property
        if (typeof memberHouse === 'object' && memberHouse.home_id != undefined) {
          if (String(memberHouse.home_id) === expectedHouseIdStr) {
            console.log('Object with home_id match found for member:', member.name || member.member_id);
            return true;
          }
        }

        // Case 3: member.house is an object with an id property
        if (typeof memberHouse === 'object' && memberHouse.id != undefined) {
          if (String(memberHouse.id) === expectedHouseIdStr) {
            console.log('Object with id match found for member:', member.name || member.member_id);
            return true;
          }
        }

        // Case 4: member.house is an object with a pk property (Django primary key)
        if (typeof memberHouse === 'object' && memberHouse.pk != undefined) {
          if (String(memberHouse.pk) === expectedHouseIdStr) {
            console.log('Object with pk match found for member:', member.name || member.member_id);
            return true;
          }
        }

        // Case 5: member.house is an object with a home property
        if (typeof memberHouse === 'object' && memberHouse.home != undefined) {
          if (String(memberHouse.home) === expectedHouseIdStr) {
            console.log('Object with home property match found for member:', member.name || member.member_id);
            return true;
          }
        }

        console.log('No match for member:', member.name || member.member_id, 'with house value:', memberHouse);
        return false;
      });

      console.log('Filtered members result:', filteredMembers);
      setHouseMembers(filteredMembers);

      // Fetch obligations for all members in this house
      const obligationsResponse = await obligationAPI.getAll();
      const houseMemberIds = filteredMembers.map(member => member.member_id);
      const houseObligations = obligationsResponse.data.filter(obligation =>
        houseMemberIds.includes(obligation.member) ||
        houseMemberIds.includes(obligation.member?.member_id)
      );
      setObligations(houseObligations);
    } catch (error) {
      console.error('Failed to load house data:', error);
    } finally {
      setLoading(false);
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
    <div className="data-section animate-in">
      <div className="section-header">
        <div className="header-content-wrapper">
          <button onClick={handleBack} className="back-btn" title="Back to Houses">
            <FaArrowLeft />
          </button>
          <h2>
            <div className="header-icon-wrapper">
              <FaHome />
            </div>
            House Profile: {house?.house_name}
          </h2>
        </div>
        <div className="header-actions">
          <button onClick={handleEditHouse} className="btn-secondary">
            <FaEdit /> Edit Details
          </button>
        </div>
      </div>

      {/* ATM Style Cards */}
      <div className="atm-cards-row">
        {/* House ATM Card - Blue Gradient */}
        <div className="atm-card house-atm-card animate-in" style={{ animationDelay: '0.1s' }}>
          <div className="atm-card-header">
            <div className="atm-card-title">House Index</div>
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
            <div className="atm-card-expiry">
              <div className="atm-card-label">Regional Area</div>
              <div className="atm-card-value">{area?.name || 'N/A'}</div>
            </div>
          </div>

          <div className="atm-chip"></div>
        </div>

        {/* Guardian ATM Card - Orange Gradient */}
        {guardian && (
          <div className="atm-card guardian-atm-card animate-in" style={{ animationDelay: '0.2s', background: 'var(--accent-gradient)' }}>
            <div className="atm-card-header">
              <div className="atm-card-title">Head of Household</div>
              <div className="atm-card-id">#{guardian?.member_id}</div>
            </div>

            <div className="atm-card-number">
              {guardian?.name?.toUpperCase() || 'UNASSIGNED'}
            </div>

            <div className="atm-card-footer">
              <div className="atm-card-holder">
                <div className="atm-card-label">Contact Link</div>
                <div className="atm-card-value">{guardian?.phone || guardian?.whatsapp || 'N/A'}</div>
              </div>
              <div className="atm-card-expiry">
                <div className="atm-card-label">Vital Status</div>
                <div className="atm-card-value" style={{ textTransform: 'capitalize' }}>{guardian?.status}</div>
              </div>
            </div>

            <div className="atm-chip" style={{ background: 'rgba(255,255,255,0.4)' }}></div>
          </div>
        )}
      </div>

      <div className="dashboard-grid" style={{ marginTop: '32px' }}>
        {/* Family Members Section */}
        <div className="data-section" style={{ padding: '24px' }}>
          <div className="section-header">
            <h3><FaUser style={{ marginRight: '8px' }} /> Residents</h3>
            <span className="badge-primary">{houseMembers.length} Total</span>
          </div>

          <div className="table-container-no-bg">
            <table>
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Relationship</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {houseMembers.map(member => (
                  <tr key={member.member_id}>
                    <td>
                      <div className="font-semibold">{member.name} {member.surname}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>#{member.member_id}</div>
                    </td>
                    <td>{member.isGuardian ? 'Guardian' : 'Dependent'}</td>
                    <td>
                      <span className={`status-badge ${member.status === 'live' ? 'active' : member.status === 'dead' ? 'inactive' : 'terminated'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleViewMember(member.member_id)} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Obligations Section */}
        <div className="data-section" style={{ padding: '24px' }}>
          <div className="section-header">
            <h3>💰 Financial Dues</h3>
            <span className="badge-outline">{obligations.length} Tracked</span>
          </div>

          <div className="table-container-no-bg">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Settlement</th>
                </tr>
              </thead>
              <tbody>
                {obligations.slice(0, 10).map(obligation => {
                  const subcollection = subcollections?.find(sc => sc.id === obligation.subcollection);
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
            {obligations.length > 10 && <p className="text-muted text-center" style={{ fontSize: '0.8rem', padding: '12px' }}>+ {obligations.length - 10} more records</p>}
          </div>
        </div>
      </div>

      {/* Edit House Modal */}
      <HouseModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSuccess}
        initialData={house}
        loadDataForTab={loadDataForTab}
      />
    </div>
  );
};

export default HouseDetailsPage;