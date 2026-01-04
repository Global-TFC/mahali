import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, item, itemType }) => {
  if (!isOpen) return null;

  const getItemDisplay = () => {
    if (!item) return 'this item';

    if (itemType === 'areas') {
      return `area "${item.name}"`;
    } else if (itemType === 'houses') {
      return `house "${item.house_name}"`;
    } else if (itemType === 'members') {
      return `member "${item.name}"`;
    } else if (itemType === 'collections') {
      return `collection "${item.name}"`;
    } else if (itemType === 'subcollections') {
      return `subcollection "${item.name}"`;
    } else if (itemType === 'obligations') {
      return `obligation for member ${item.member?.name || 'Unknown'}`;
    }

    return 'this item';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2>
            <div className="header-icon-wrapper" style={{ background: 'var(--success-gradient)' }}>
              <FaCheck />
            </div>
            Confirm Payment
          </h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          <div className="payment-details" style={{ background: 'var(--header-bg)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Summary</h3>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="label" style={{ color: 'var(--text-muted)' }}>Member:</span>
              <span className="value" style={{ fontWeight: 600 }}>{obligation?.member?.name || 'Unknown Member'}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="label" style={{ color: 'var(--text-muted)' }}>Collection:</span>
              <span className="value" style={{ fontWeight: 600 }}>{obligation?.subcollection?.name || 'N/A'}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className="label" style={{ color: 'var(--text-muted)' }}>Amount:</span>
              <span className="value" style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>₹{obligation?.amount || '0.00'}</span>
            </div>
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="label" style={{ color: 'var(--text-muted)' }}>Current Status:</span>
              <span className={`status-badge ${obligation?.paid_status || 'pending'}`}>
                {obligation?.paid_status || 'pending'}
              </span>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text)', marginBottom: '24px' }}>
            Are you sure you want to mark this obligation as <strong>fully paid</strong>?
          </p>

          {error && (
            <div className="status-banner error" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <div className="form-actions" style={{ gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirm}
              disabled={loading}
              style={{ flex: 2 }}
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

export default DeleteConfirmModal;