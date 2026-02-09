import React from 'react'
import EquityChart from './EquityChart.jsx'

export default function GrowthChart({ data }) {
  return (
    <div className="card chart-card">
      <div className="card-title">Growth Curve</div>
      <EquityChart data={data} />
    </div>
  )
}
