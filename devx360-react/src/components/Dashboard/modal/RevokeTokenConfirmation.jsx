import React from 'react';
import { AlertTriangle } from 'lucide-react';

function RevokeTokenConfirmation({
  tokenName,
  onConfirm,
  onClose,
  isRevoking,
}) {
  const modalRef = React.useRef(null);

  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
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
              Revoke API Token?
            </h2>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-1">
            <div className="text-[var(--text-light)] text-base leading-relaxed">
              <p className="mb-3">
                Are you sure you want to revoke <span className="font-semibold text-[var(--text)]">"{tokenName}"</span>?
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-2">
                <p className="text-sm text-[var(--text)]">
                    This action cannot be undone. Any applications using this token will immediately lose access.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
              disabled={isRevoking}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-[var(--secondary)] text-white hover:brightness-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke Token'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevokeTokenConfirmation;

