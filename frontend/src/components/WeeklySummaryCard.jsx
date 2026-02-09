export default function WeeklySummaryCard({ weekly }) {
  const items = [
    { label: 'Gross PnL', value: weekly.grossPnL ?? 0 },
    { label: 'Net PnL', value: weekly.netPnL ?? 0 },
    { label: 'Client Share', value: weekly.clientShare ?? 0 },
    { label: 'Platform Share', value: weekly.platformShare ?? 0 }
  ]
  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ marginBottom: 8 }}>Weekly Performance Summary</div>
      <div style={{ display: 'flex', gap: 12 }}>
        {items.map((i) => (
          <div key={i.label} style={{ padding: 8, minWidth: 140, background: '#fafafa', borderRadius: 8 }}>
            <div style={{ color: '#666' }}>{i.label}</div>
            <div style={{ fontSize: 18 }}>{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
