import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, item, itemType }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

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

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to delete item');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal-content animate-in">
        <div className="modal-header">
          <h2>Delete {itemType?.slice(0, -1)}?</h2>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="modal-body">
          <div className="delete-simple-message">
            <FaTrash className="delete-simple-icon" />
            <h3>Confirm permanent deletion</h3>
            <p>Are you sure you want to delete <strong>{getItemDisplay()}</strong>? This action cannot be undone and all associated data will be lost.</p>
          </div>

          {error && (
            <div className="status-banner error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div className="delete-actions-simple">
            <button
              type="button"
              className="cancel-btn-simple"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="delete-btn-simple"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;