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
        <div className="flex flex-col gap-1">
          <span>This will permanently delete the user account:</span>
          <div className="flex flex-col ml-2">
            {userId && <span>• ID: {userId}</span>}
            {email && <span>• Email: {email}</span>}
          </div>
          <span>All associated data will be removed.</span>
        </div>
    );
  };

  return (
      <div
          ref={modalRef}
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-container)] rounded-xl shadow-[var(--shadow)] w-full max-w-[420px] mx-4 border border-[var(--border)]"
        >
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-start gap-4">
              <AlertTriangle size={22} className="text-[#DC2626] flex-shrink-0" />
              <h2 className="text-[19px] font-semibold text-[var(--text)]">
                {getTitle()}
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4 mb-1">
              <div className="text-[var(--text-light)] text-base leading-relaxed">
                {getDescription()}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                  onClick={onCloseDelete}
                  className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
                  disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-white hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isDeleting}
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