import React from 'react'
import { Link, Route, Routes, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Trades from './pages/Trades.jsx'
import Transparency from './pages/Transparency.jsx'
import AccountLink from './pages/AccountLink.jsx'
import AIExplanation from './components/AIExplanation.jsx'
import { useStore } from './state/store.jsx'

function App() {
  const { state } = useStore()
  const connected = state.connection.status === 'connected'
  return (
    <div className="app-shell">
      <div className="header">
        <div className="brand">
          <div className="brand-badge" />
          <div>Pivot Grid</div>
        </div>
        <div className="nav">
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/" end>Dashboard</NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/trades">Trade History</NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/transparency">Transparency</NavLink>
          <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/account-link">Account Linking</NavLink>
        </div>
        <div className="status">
          <div className="status-dot" style={{ background: connected ? 'var(--success)' : 'var(--danger)' }} />
          <div>{connected ? 'WS Connected' : 'WS Disconnected'}</div>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/account-link" element={<AccountLink />} />
      </Routes>
      <div className="section">
        <AIExplanation />
      </div>
    </div>
  )
}

export default App
