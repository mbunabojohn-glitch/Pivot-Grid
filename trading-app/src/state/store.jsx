import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { connectWS } from '../services/ws.js'

const initialState = {
  connection: { status: 'disconnected' },
  equity: [],
  balance: 0,
  drawdownPct: 0,
  trades: [],
  weekly: { grossPnL: 0, netPnL: 0, clientShare: 0, platformShare: 0 },
  ai: { title: 'AI Explanation', text: 'Deterministic placeholder explanation' }
}

function reducer(state, action) {
  switch (action.type) {
    case 'connection_open':
      return { ...state, connection: { status: 'connected' } }
    case 'connection_close':
      return { ...state, connection: { status: 'disconnected' } }
    case 'equity_update':
      return {
        ...state,
        equity: [...state.equity, { t: action.payload.timestamp, equity: action.payload.equity }],
        balance: action.payload.balance ?? state.balance
      }
    case 'drawdown_update':
      return { ...state, drawdownPct: action.payload.drawdownPct }
    case 'trade_opened':
      return { ...state, trades: [action.payload, ...state.trades] }
    case 'trade_updated':
      return {
        ...state,
        trades: state.trades.map((t) => (t.tradeId === action.payload.tradeId ? { ...t, ...action.payload } : t))
      }
    case 'trade_closed':
      return {
        ...state,
        trades: state.trades.map((t) => (t.tradeId === action.payload.tradeId ? { ...t, ...action.payload } : t))
      }
    case 'profit_split_ready':
      return { ...state, weekly: action.payload }
    case 'audit_event':
      return state
    case 'ai_explanation':
      return { ...state, ai: action.payload }
    default:
      return state
  }
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    const stop = connectWS(dispatch)
    return () => stop()
  }, [])
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
