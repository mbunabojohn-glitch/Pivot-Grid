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
  const grossProfit = Number(state.weekly?.grossPnL ?? 0)
  const platformFee = Number(state.weekly?.platformShare ?? grossProfit * 0.2)
  const netWithdrawable = Number(state.weekly?.clientShare ?? grossProfit * 0.8)
  return (
    <div>
      <div className="grid" style={{ marginBottom: 16 }}>
        <BalanceCard label="Balance" value={formatCurrency(balanceCard)} />
        <BalanceCard label="Equity" value={formatCurrency(equityCard)} />
        <BalanceCard label="Drawdown %" value={Number(drawdownPercent).toFixed(2)} />
        <BalanceCard label="Open trades" value={openTrades} />
      </div>
      <div className="grid" style={{ marginBottom: 16 }}>
        <BalanceCard label="Total profit" value={formatCurrency(grossProfit)} />
        <BalanceCard label="Estimated platform fee (20%)" value={formatCurrency(platformFee)} />
        <BalanceCard label="Net withdrawable amount" value={formatCurrency(netWithdrawable)} />
        <BalanceCard label="Current balance" value={formatCurrency(balanceCard)} />
      </div>
      <GrowthChart data={state.equity} />
    </div>
  )
}
