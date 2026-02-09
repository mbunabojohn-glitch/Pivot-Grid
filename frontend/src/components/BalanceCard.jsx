import React from 'react'

export default function BalanceCard({ label, value }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="card-value">{value}</div>
    </div>
  )
}
