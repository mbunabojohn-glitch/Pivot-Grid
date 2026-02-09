import React from 'react'
function Cell({ children }) {
  return <td>{children}</td>
}

export default function TradesTable({ trades }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Direction</th>
          <th>Entry Reason</th>
          <th>Entry</th>
          <th>SL</th>
          <th>TP</th>
          <th>Risk %</th>
          <th>State</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
        {(trades || []).map((t) => (
          <tr key={t.tradeId || t._id || Math.random()}>
            <Cell>{t.symbol}</Cell>
            <Cell>{t.direction}</Cell>
            <Cell>{t.entryReason}</Cell>
            <Cell>{t.entryLimit}</Cell>
            <Cell>{t.sl}</Cell>
            <Cell>{t.tp}</Cell>
            <Cell>{t.riskPct}</Cell>
            <Cell>{t.state}</Cell>
            <Cell>{t.result?.pnl}</Cell>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
