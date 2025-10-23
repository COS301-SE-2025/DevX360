import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

function RevokeTokenModal({ token, user, onRevoke, onClose, isRevoking, type = 'single' }) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      return;
    }
    onRevoke(reason.trim());
  };

  const modalRef = React.useRef(null);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div 
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-container)] rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">
                {type === 'all' ? 'Revoke All Tokens' : 'Revoke Token'}
              </h3>
              <p className="text-sm text-[var(--text-light)]">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRevoking}
            className="text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {type === 'all' ? (
              <>
                You are about to revoke <strong>all MCP tokens</strong> for user{' '}
                <strong>{user?.email}</strong>. This will immediately invalidate all their tokens.
              </>
            ) : (
              <>
                You are about to revoke the token <strong>{token?.name}</strong> for user{' '}
                <strong>{user?.email}</strong>. This will immediately invalidate the token.
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Reason for Revocation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Suspicious activity detected, token compromise suspected, security violation..."
              rows={4}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              disabled={isRevoking}
              required
            />
            <p className="text-xs text-[var(--text-light)] mt-1">
              This reason will be logged and visible in security alerts
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isRevoking}
              className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRevoking || !reason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRevoking ? 'Revoking...' : `Revoke ${type === 'all' ? 'All Tokens' : 'Token'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RevokeTokenModal;

