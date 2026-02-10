import React from 'react'
import { useStore } from '../state/store.jsx'
import GrowthChart from '../components/GrowthChart.jsx'
import BalanceCard from '../components/BalanceCard.jsx'
import { formatCurrency } from '../utils/format.js'
import { dashboardMock } from '../mocks/dashboard.mock.js'

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
        <BalanceCard label="Balance" value={formatCurrency(balanceCard)} />
        <BalanceCard label="Equity" value={formatCurrency(equityCard)} />
        <BalanceCard label="Drawdown %" value={Number(drawdownPercent).toFixed(2)} />
        <BalanceCard label="Open trades" value={openTrades} />
      </div>
      <GrowthChart data={state.equity} />
    </div>
  )
}
