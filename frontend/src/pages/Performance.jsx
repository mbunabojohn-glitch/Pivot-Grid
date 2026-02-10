import React from 'react'
import { useStore } from '../state/store.jsx'
import WeeklySummaryCard from '../components/WeeklySummaryCard.jsx'

export default function Performance() {
  const { state } = useStore()
  return (
    <div className="card">
      <div className="card-title">Performance Summary</div>
      <WeeklySummaryCard weekly={state.weekly} />
    </div>
  )
}
