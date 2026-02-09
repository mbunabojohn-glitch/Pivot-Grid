import React from 'react'
import { useStore } from '../state/store.jsx'
import TradesTable from '../components/TradesTable.jsx'

export default function Trades() {
  const { state } = useStore()
  return (
    <div>
      <div style={{ marginBottom: 8 }}>Trade History</div>
      <TradesTable trades={state.trades} />
    </div>
  )
}
