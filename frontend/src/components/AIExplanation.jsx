import { useStore } from '../state/store.jsx'

export default function AIExplanation() {
  const { state } = useStore()
  const connected = state.connection.status === 'connected'
  const title = state.ai.title || 'AI Explanation'
  const text =
    state.ai.text ||
    'Trades and drawdowns are explained deterministically based on logged rule-based events.'
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>{title}</div>
        <div style={{ color: connected ? '#16a34a' : '#ef4444' }}>{connected ? 'WS Connected' : 'WS Disconnected'}</div>
      </div>
      <div style={{ marginTop: 8 }}>{text}</div>
    </div>
  )
}
