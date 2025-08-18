import React from 'react';
import { AlertTriangle } from 'lucide-react';

function DeleteConfirmationModal({
                                   type = 'team', // 'team' or 'user'
                                   name,
                                   onConfirm,
                                   onCloseDelete,
                                   isDeleting,
                                   email, // Only for user type
                                   userId, // Only for user type
                                 }) {
  const modalRef = React.useRef(null);

  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      onCloseDelete();
    }
  };

  const getTitle = () => {
    return type === 'team'
        ? `Delete team "${name}"?`
        : `Delete user "${name}"?`;
  };

  const getDescription = () => {
    if (type === 'team') {
      return 'This action cannot be undone. All team data and metrics will be permanently deleted.';
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>This will permanently delete the user account:</span>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '8px' }}>
            {userId && <span>• ID: {userId}</span>}
            {email && <span>• Email: {email}</span>}
          </div>
          <span>All associated data will be removed.</span>
        </div>
    );
  };

  return (
      <div ref={modalRef} onClick={closeModal} className="modal-section" style={{ backdropFilter: 'none' }}>
        <div onClick={(e) => e.stopPropagation()} className="modal" style={{ maxWidth: '420px' }}>
          <div className="modal-header">
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '10px'
            }}>
              <AlertTriangle size={22} style={{ color: '#DC2626', flexShrink: 0 }} />
              <h2 className="metric-title" style={{ margin: '0 0 8px 0', fontSize: '19px' }}>
                {getTitle()}
              </h2>
            </div>
          </div>
          <div className="modal-body" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '3px'
            }}>
              <div style={{ margin: 0, color: '#6b7280', fontSize: '16px', lineHeight: '1.5' }}>
                {getDescription()}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}>
              <button
                  onClick={onCloseDelete}
                  className="btn btn-secondary edit-actions-btn"
                  disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                  onClick={onConfirm}
                  className="btn btn-danger"
                  disabled={isDeleting}
                  style={{
                    width: 'auto',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1
                  }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default DeleteConfirmationModal;