import React, { useState } from 'react'

export default function AccountLink() {
  const [mt5, setMt5] = useState('')
  function submit(e) {
    e.preventDefault()
    // Placeholder only: Linking stores MT5 account number client-side or via simple backend stub.
    alert(`MT5 account set: ${mt5}`)
  }
  return (
    <div className="card">
      <div className="card-title">Account Linking (MT5)</div>
      <form onSubmit={submit} className="form-row">
        <input
          value={mt5}
          onChange={(e) => setMt5(e.target.value)}
          placeholder="Enter MT5 account number"
          style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8 }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Save</button>
      </form>
      <div style={{ marginTop: 12, color: 'var(--muted)' }}>
        This platform is non-custodial. Funding and withdrawals occur at your broker.
      </div>
    </div>
  )
}
