import React, { useMemo, useRef, useEffect, useState } from 'react'
function scaleSeries(data, width, height, m) {
  if (!data.length) return { pts: [], xScale: () => 0, yScale: () => 0, domainY: [0, 0] }
  const xs = data.map((d) => d.t || Date.now())
  const ys = data.map((d) => Number(d.equity) || 0)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys, 0)
  const maxY = Math.max(...ys)
  const iw = Math.max(1, width - m.left - m.right)
  const ih = Math.max(1, height - m.top - m.bottom)
  const xScale = (t) => m.left + ((t - minX) / Math.max(1, maxX - minX)) * iw
  const yScale = (v) => m.top + ih - ((v - minY) / Math.max(1, maxY - minY)) * ih
  const pts = data.map((d) => [xScale(d.t), yScale(Number(d.equity) || 0)])
  return { pts, xScale, yScale, domainY: [minY, maxY] }
}
function toPath(pts) {
  if (!pts.length) return ''
  let p = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) p += ` L ${pts[i][0]} ${pts[i][1]}`
  return p
}
function formatY(v) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`
  return `${Number(v).toFixed(0)}`
}
function formatX(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
export default function EquityChart({ data }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(800)
  const height = 260
  const m = { top: 10, right: 20, bottom: 24, left: 48 }
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      setWidth(Math.max(360, Math.floor(w)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const { pts, xScale, yScale, domainY } = useMemo(() => scaleSeries(data || [], width, height, m), [data, width])
  const path = useMemo(() => toPath(pts), [pts])
  const areaPath = useMemo(() => {
    if (!pts.length) return ''
    const baseY = yScale(Math.min(domainY[0], 0))
    let p = `M ${pts[0][0]} ${baseY} L ${pts[0][0]} ${pts[0][1]}`
    for (let i = 1; i < pts.length; i++) p += ` L ${pts[i][0]} ${pts[i][1]}`
    p += ` L ${pts[pts.length - 1][0]} ${baseY} Z`
    return p
  }, [pts, yScale, domainY])
  const yTicks = useMemo(() => {
    const minY = Math.min(domainY[0], 0)
    const maxY = domainY[1]
    const steps = 4
    const arr = []
    for (let i = 0; i <= steps; i++) {
      const v = minY + (i / steps) * (maxY - minY)
      arr.push({ v, y: yScale(v) })
    }
    return arr
  }, [domainY, yScale])
  const xTicks = useMemo(() => {
    if (!data || !data.length) return []
    const steps = Math.min(6, Math.max(3, Math.floor(width / 160)))
    const arr = []
    for (let i = 0; i < steps; i++) {
      const idx = Math.floor((i / (steps - 1)) * (data.length - 1))
      const t = data[idx].t
      arr.push({ t, x: xScale(t) })
    }
    return arr
  }, [data, width, xScale])
  const [hover, setHover] = useState(null)
  function onMove(e) {
    if (!pts.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = e.clientX - rect.left
    let nearest = 0
    let best = Infinity
    for (let i = 0; i < pts.length; i++) {
      const dx = Math.abs(pts[i][0] - mx)
      if (dx < best) {
        best = dx
        nearest = i
      }
    }
    const p = pts[nearest]
    const d = data[nearest]
    setHover({ x: p[0], y: p[1], equity: d.equity, t: d.t })
  }
  function onLeave() {
    setHover(null)
  }
  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={width} height={height} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {yTicks.map((t, i) => (
          <g key={`y-${i}`}>
            <line x1={m.left} x2={width - m.right} y1={t.y} y2={t.y} stroke="var(--border)" strokeDasharray="4 6" />
            <text x={m.left - 8} y={t.y + 4} fill="var(--muted)" fontSize="11" textAnchor="end">{formatY(t.v)}</text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={`x-${i}`} x={t.x} y={height - 6} fill="var(--muted)" fontSize="11" textAnchor="middle">{formatX(t.t)}</text>
        ))}
        <path d={areaPath} fill="url(#areaGrad)" stroke="none" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
        {hover && (
          <g>
            <circle cx={hover.x} cy={hover.y} r="4" fill="var(--primary)" stroke="white" strokeWidth="1" />
            <rect x={Math.min(hover.x + 10, width - 140)} y={m.top + 8} width="130" height="44" rx="8" fill="rgba(27,63,44,.85)" stroke="var(--border)" />
            <text x={Math.min(hover.x + 18, width - 132)} y={m.top + 26} fill="var(--text)" fontSize="12">{`Equity: ${formatY(hover.equity)}`}</text>
            <text x={Math.min(hover.x + 18, width - 132)} y={m.top + 42} fill="var(--muted)" fontSize="11">{formatX(hover.t)}</text>
          </g>
        )}
      </svg>
    </div>
  )
}
