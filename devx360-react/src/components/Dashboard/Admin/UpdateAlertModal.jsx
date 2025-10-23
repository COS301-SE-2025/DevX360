import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

function UpdateAlertModal({ alert, onUpdate, onClose, isUpdating }) {
  const [status, setStatus] = useState(alert?.status || 'new');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'investigating', label: 'Investigating', color: 'yellow' },
    { value: 'resolved', label: 'Resolved', color: 'green' },
    { value: 'false_positive', label: 'False Positive', color: 'gray' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(status, notes.trim() || undefined);
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">
                Update Security Alert
              </h3>
              <p className="text-sm text-[var(--text-light)]">
                Alert ID: {alert?._id?.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-[var(--text-light)] hover:text-[var(--text)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
          <div className="text-sm">
            <div className="font-medium text-[var(--text)] mb-1">
              {alert?.type?.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-[var(--text-light)] text-xs">
              {alert?.details?.message || 'Security event detected'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    status === option.value
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--primary)]'
                  }`}
                  disabled={isUpdating}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the investigation or resolution..."
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] placeholder-[var(--text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] resize-none"
              disabled={isUpdating}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || status === alert?.status}
              className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateAlertModal;

