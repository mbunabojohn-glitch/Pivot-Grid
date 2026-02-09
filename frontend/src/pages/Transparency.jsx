import React from 'react'
import { useStore } from '../state/store.jsx'
import WeeklySummaryCard from '../components/WeeklySummaryCard.jsx'

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
      <div style={{ width: 160, color: '#666' }}>{label}</div>
      <div>{value}</div>
    </div>
  )
}

export default function Transparency() {
  const { state } = useStore()
  const latest = state.trades[0] || {}
  return (
    <div>
      <div style={{ marginBottom: 8 }}>Trade Transparency</div>
      <Row label="Entry reason" value={latest.entryReason || 'N/A'} />
      <Row label="Risk %" value={latest.riskPct ?? 'N/A'} />
      <Row label="SL / TP" value={`${latest.sl ?? 'N/A'} / ${latest.tp ?? 'N/A'}`} />
      <Row label="Outcome" value={latest.result?.pnl ?? 'N/A'} />
      <Row label="Invalidation" value={latest.invalidationReason || 'N/A'} />
      <div style={{ marginTop: 16 }}>
        <WeeklySummaryCard weekly={state.weekly} />
      </div>
    </div>
  )
}
