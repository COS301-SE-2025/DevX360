import React from 'react';


const PeriodSelectorButton = ({ selectedPeriod, onPeriodChange, availablePeriods }) => {
  const periodLabels = {
    '7d': '7D',
    '30d': '30D',
    '90d': '90D'
  };

  return (
      <div className="flex items-center gap-1">
        {availablePeriods.map((period) => (
            <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    selectedPeriod === period
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg)] text-[var(--text-light)] border border-[var(--border)] hover:bg-[var(--bg-container)]'
                }`}
            >
              {periodLabels[period]}
            </button>
        ))}
      </div>
  );
};

export default PeriodSelectorButton;