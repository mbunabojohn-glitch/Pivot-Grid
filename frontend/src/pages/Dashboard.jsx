import { useStore } from '../state/store.jsx'
import EquityChart from '../components/EquityChart.jsx'

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
  const equity = state.equity.length ? state.equity[state.equity.length - 1].equity : 0
  const openTrades = state.trades.filter((t) => t.state === 'open' || t.state === 'pending').length
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Stat label="Balance" value={state.balance.toFixed(2)} />
        <Stat label="Equity" value={equity.toFixed(2)} />
        <Stat label="Drawdown %" value={(state.drawdownPct * 100).toFixed(2)} />
        <Stat label="Open trades" value={openTrades} />
      </div>
      <EquityChart data={state.equity} />
    </div>
  )
}
