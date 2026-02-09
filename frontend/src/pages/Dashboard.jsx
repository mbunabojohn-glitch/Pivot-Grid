import { useStore } from '../state/store.jsx'
import EquityChart from '../components/EquityChart.jsx'
import { formatCurrency } from '../utils/format.js'
import { dashboardMock } from '../mocks/dashboard.mock.js'

function Stat({ label, value }) {
  return (
    <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, minWidth: 160 }}>
      <div style={{ color: '#666' }}>{label}</div>
      <div style={{ fontSize: 20 }}>{value}</div>
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
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Stat label="Balance" value={formatCurrency(balanceCard)} />
        <Stat label="Equity" value={formatCurrency(equityCard)} />
        <Stat label="Drawdown %" value={Number(drawdownPercent).toFixed(2)} />
        <Stat label="Open trades" value={openTrades} />
      </div>
      <EquityChart data={state.equity} />
    </div>
  )
}
