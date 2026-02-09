import React from 'react'
import { useStore } from '../state/store.jsx'

export default function AIExplanation() {
  const { state } = useStore()
  const connected = state.connection.status === 'connected'
  const title = state.ai.title || 'AI Explanation'
  const text =
    state.ai.text ||
    'Trades and drawdowns are explained deterministically based on logged rule-based events.'
  return (
    <div className="card">
      <div className="ai-header">
        <div className="ai-title">{title}</div>
        <div className="status">
          <div className="status-dot" style={{ background: connected ? 'var(--success)' : 'var(--danger)' }} />
          <div>{connected ? 'WS Connected' : 'WS Disconnected'}</div>
        </div>
      </div>
      <div className="ai-text">{text}</div>
    </div>
  )
}
