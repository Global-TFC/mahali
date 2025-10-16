import React from 'react';

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
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete {getItemDisplay()}?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;