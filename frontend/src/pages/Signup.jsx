import React, { useState } from 'react'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('')
    try {
      const res = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || 'signup_failed')
        return
      }
      localStorage.setItem('token', data.token || '')
      setStatus('ok')
      window.location.href = '/'
    } catch {
      setStatus('network_error')
    }
  }

  return (
    <div className="card">
      <div className="card-title">Sign Up</div>
      <form onSubmit={handleSubmit} className="form-col">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Create account</button>
      </form>
      <div style={{ marginTop: 12 }}>
        <a href="/api/auth/google">
          <button style={{ padding: '8px 12px' }}>Sign up with Google</button>
        </a>
      </div>
      {status && (
        <div style={{ marginTop: 8, color: status === 'ok' ? 'var(--success)' : 'var(--danger)' }}>
          {status === 'ok' ? 'Account created' : status}
        </div>
      )}
    </div>
  )
}
