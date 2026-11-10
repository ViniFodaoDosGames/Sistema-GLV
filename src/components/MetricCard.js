import React from 'react';

function MetricCard({ label, value, note, Icon, tone = 'blue' }) {
  return (
    <article className="metric-card panel">
      <div className={`metric-icon metric-icon--${tone}`}><Icon fontSize="small" /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
    </article>
  );
}

export default MetricCard;
