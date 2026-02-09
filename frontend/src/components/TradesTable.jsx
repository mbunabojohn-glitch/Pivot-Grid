function Cell({ children }) {
  return <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{children}</td>
}

export default function TradesTable({ trades }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Symbol</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Direction</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Entry Reason</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Entry</th>
          <th style={{ textAlign: 'left', padding: 8 }}>SL</th>
          <th style={{ textAlign: 'left', padding: 8 }}>TP</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Risk %</th>
          <th style={{ textAlign: 'left', padding: 8 }}>State</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Outcome</th>
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
