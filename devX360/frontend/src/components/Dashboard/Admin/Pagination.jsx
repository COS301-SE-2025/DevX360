import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminPagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-[var(--bg-container)] rounded-xl border border-[var(--border)]">
        <div className="text-sm text-[var(--text-light)]">
          Showing <span className="font-medium text-[var(--text)]">{startItem}</span> to{' '}
          <span className="font-medium text-[var(--text)]">{endItem}</span> of{' '}
          <span className="font-medium text-[var(--text)]">{totalItems}</span> items
        </div>

        <div className="flex items-center gap-1">
          <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-light)] hover:bg-[var(--bg-container)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, index) => (
              <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={page === '...'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                          ? 'bg-[var(--primary)] text-white'
                          : page === '...'
                              ? 'text-[var(--text-light)] cursor-default'
                              : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--bg-container)]'
                  }`}
              >
                {page}
              </button>
          ))}

          <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text-light)] hover:bg-[var(--bg-container)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
};

export default AdminPagination;