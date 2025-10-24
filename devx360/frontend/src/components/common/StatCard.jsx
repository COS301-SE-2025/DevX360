import React from 'react';

function StatCard({ title, value, trend, trendType }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <div className="stat-value">{value}</div>
      <div className={`stat-trend ${trendType}`}>{trend}</div>
    </div>
  );
}

export default StatCard;