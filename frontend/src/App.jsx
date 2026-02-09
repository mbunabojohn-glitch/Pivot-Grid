import { Link, Route, Routes, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Trades from './pages/Trades.jsx'
import Transparency from './pages/Transparency.jsx'
import AccountLink from './pages/AccountLink.jsx'
import AIExplanation from './components/AIExplanation.jsx'

function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/trades">Trade History</NavLink>
        <NavLink to="/transparency">Trade Transparency</NavLink>
        <NavLink to="/account-link">Account Linking</NavLink>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/account-link" element={<AccountLink />} />
      </Routes>
      <div style={{ marginTop: 24 }}>
        <AIExplanation />
      </div>
    </div>
  )
}

export default App
