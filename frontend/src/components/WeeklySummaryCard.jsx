import React from 'react'
export default function WeeklySummaryCard({ weekly }) {
  const items = [
    { label: 'Gross PnL', value: weekly.grossPnL ?? 0 },
    { label: 'Net PnL', value: weekly.netPnL ?? 0 },
    { label: 'Client Share', value: weekly.clientShare ?? 0 },
    { label: 'Platform Share', value: weekly.platformShare ?? 0 }
  ]
  return (
    <div className="card">
      <div className="card-title">Weekly Performance Summary</div>
      <div className="summary-grid">
        {items.map((i) => (
          <div key={i.label} className="summary-item">
            <div className="card-title">{i.label}</div>
            <div className="card-value">{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
