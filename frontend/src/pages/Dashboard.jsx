import React from 'react'
import { useStore } from '../state/store.jsx'
import EquityChart from '../components/EquityChart.jsx'
import { formatCurrency } from '../utils/format.js'
import { dashboardMock } from '../mocks/dashboard.mock.js'

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="card-title">{label}</div>
      <div className="card-value">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { state } = useStore()
  const equitySeriesLatest = state.equity.length ? state.equity[state.equity.length - 1].equity : 0
  const openTradesComputed = state.trades.filter((t) => t.state === 'open' || t.state === 'pending').length
  const balanceCard = dashboardMock?.balance ?? state.balance
  const equityCard = dashboardMock?.equity ?? equitySeriesLatest
  const drawdownPercent = dashboardMock?.drawdown ?? state.drawdownPct * 100
  const openTrades = dashboardMock?.openTrades ?? openTradesComputed
  return (
    <div>
      <div className="grid" style={{ marginBottom: 16 }}>
        <Stat label="Balance" value={formatCurrency(balanceCard)} />
        <Stat label="Equity" value={formatCurrency(equityCard)} />
        <Stat label="Drawdown %" value={Number(drawdownPercent).toFixed(2)} />
        <Stat label="Open trades" value={openTrades} />
      </div>
      <div className="card chart-card">
        <div className="card-title">Growth Curve</div>
        <EquityChart data={state.equity} />
      </div>
    </div>
  )
}
