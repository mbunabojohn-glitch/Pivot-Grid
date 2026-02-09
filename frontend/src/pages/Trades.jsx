import React from 'react'
import { useStore } from '../state/store.jsx'
import TradesTable from '../components/TradesTable.jsx'

export default function Trades() {
  const { state } = useStore()
  return (
    <div className="card">
      <div className="card-title">Trade History</div>
      <TradesTable trades={state.trades} />
    </div>
  )
}
