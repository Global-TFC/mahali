import React, { useState, useEffect } from 'react';
import { FaHome, FaUser, FaMoneyBill, FaArrowLeft, FaCrown } from 'react-icons/fa';
import { memberAPI } from '../api';

const HouseDetail = ({ house, onBack, members }) => {
  const [houseMembers, setHouseMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  
  useEffect(() => {
    // Filter members for this house
    const filteredMembers = members.filter(member => 
      member.house && member.house.home_id === house.home_id
    );
    setHouseMembers(filteredMembers);
    
    // Mock payment data - in a real app, this would come from the API
    setPayments([
      { id: 1, name: 'Eid Collection 2025', amount: 500, status: 'paid', date: '2025-06-15' },
      { id: 2, name: 'Monthly Maintenance', amount: 100, status: 'pending', date: '2025-07-01' },
      { id: 3, name: 'Festival Fund', amount: 200, status: 'overdue', date: '2025-05-20' }
    ]);
  }, [house, members]);

  const getGuardian = () => {
    // Find the member marked as guardian
    return houseMembers.find(member => member.isGuardian) || 
           houseMembers.find(member => member.status === 'live');
  };

  const guardian = getGuardian();

  return (
    <div className="data-section">
      <div className="section-header">
        <h2><FaHome /> House Details</h2>
        <button onClick={onBack} className="back-btn">
          <FaArrowLeft /> Back to Houses
        </button>
      </div>
      
      <div className="house-detail-card">
        <div className="house-info">
          <h3>#{house.home_id} - {house.house_name}</h3>
          <p><strong>Family Name:</strong> {house.family_name}</p>
          <p><strong>Location:</strong> {house.location_name}</p>
          <p><strong>Area:</strong> {house.area?.name || 'N/A'}</p>
          <p><strong>Address:</strong> {house.address || 'N/A'}</p>
        </div>
        
        {guardian && (
          <div className="guardian-section">
            <h3><FaCrown /> Family Guardian</h3>
            <div className="guardian-card">
              <div className="member-info">
                <p><strong>Name:</strong> {guardian.name || 'Unknown Member'}</p>
                <p><strong>ID:</strong> #{guardian.member_id}</p>
                <p><strong>Status:</strong> {guardian.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="section-header">
        <h3><FaUser /> Family Members</h3>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Date of Birth</th>
              <th>Guardian</th>
            </tr>
          </thead>
          <tbody>
            {houseMembers.length > 0 ? (
              houseMembers.map(member => (
                <tr key={member.member_id}>
                  <td>#{member.member_id}</td>
                  <td>{member.name || 'Unknown Member'}</td>
                  <td>{member.status}</td>
                  <td>{member.date_of_birth || 'N/A'}</td>
                  <td>{member.isGuardian ? 'Yes' : 'No'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No members found for this house</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="section-header">
        <h3><FaMoneyBill /> Payment Dues</h3>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Collection</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.name}</td>
                  <td>₹{payment.amount}</td>
                  <td className={`status-${payment.status}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </td>
                  <td>{payment.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HouseDetail;