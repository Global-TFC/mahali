import React, { useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PaymentConfirmModal = ({ isOpen, onClose, onConfirm, obligation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      console.error('Error processing payment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-confirm-modal">
        <div className="modal-header">
          <h2><FaCheck /> Confirm Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="payment-details">
            <h3>Payment Details</h3>
            <div className="detail-row">
              <span className="label">Member:</span>
              <span className="value">{obligation?.member?.name || 'Unknown Member'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Subcollection:</span>
              <span className="value">{obligation?.subcollection?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount:</span>
              <span className="value">₹{obligation?.amount || '0.00'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Current Status:</span>
              <span className={`value status-badge ${obligation?.paid_status || 'pending'}`}>
                {obligation?.paid_status || 'pending'}
              </span>
            </div>
          </div>
          
          <p className="confirmation-text">
            Are you sure you want to mark this obligation as paid?
          </p>
          
          {error && (
            <div className="status-message error">
              {error}
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes /> Cancel
            </button>
            <button 
              type="button" 
              className="save-btn" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck /> Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmModal;