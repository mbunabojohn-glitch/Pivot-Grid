import React, { useMemo, useState } from "react";

function toLine(series) {
  const pts = Array.isArray(series) ? series : [];
  if (pts.length === 0) return { equity: [], balance: [], profit: [], yMin: 0, yMax: 1, xTicks: [], leftPad: 0, rightPad: 0 };
  const leftPad = 8;
  const rightPad = 3;
  const xs = pts.map((p) => Number(p.t || p.timestamp || 0));
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const equityVals = pts.map((p) => Number(p.equity || 0));
  const balanceVals = pts.map((p) => Number((p.balance ?? p.equity ?? 0)));
  const profitVals = pts.map((p, i) => equityVals[i] - balanceVals[i]);
  const minY = Math.min(...equityVals);
  const maxY = Math.max(...equityVals);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const toPoint = (valArr) =>
    pts.map((p, i) => {
      const t = Number(p.t || p.timestamp || 0);
      const v = Number(valArr[i] || 0);
      const x = leftPad + ((t - minX) / spanX) * (100 - leftPad - rightPad);
      const y = 100 - ((v - minY) / spanY) * 100;
      return { x, y, t, v };
    });
  const idxs = [0, Math.floor(pts.length * 0.25), Math.floor(pts.length * 0.5), Math.floor(pts.length * 0.75), pts.length - 1];
  const xTicks = Array.from(new Set(idxs)).map(i => ({ x: toPoint(equityVals)[i].x, t: toPoint(equityVals)[i].t }));
  return {
    equity: toPoint(equityVals),
    balance: toPoint(balanceVals),
    profit: toPoint(profitVals),
    yMin: minY,
    yMax: maxY,
    xTicks,
    leftPad,
    rightPad
  };
}

export default function PnlChart({ equity = [] }) {
  const { equity: eqPts, balance: balPts, profit: profPts, yMin, yMax, xTicks, leftPad, rightPad } = useMemo(() => toLine(equity), [equity]);
  const hasData = eqPts.length > 1;
  const [hoverIdx, setHoverIdx] = useState(-1);
  const hover = hoverIdx >= 0 ? eqPts[hoverIdx] : null;
  const yTicks = useMemo(() => {
    if (!hasData) return [];
    const count = 5;
    const span = Math.max(1, (yMax - yMin) || 1);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const val = yMin + (span * i) / (count - 1);
      const y = 100 - ((val - yMin) / span) * 100;
      arr.push({ y, val });
    }
    return arr;
  }, [hasData, yMin, yMax]);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < eqPts.length; i++) {
      const d = Math.abs(eqPts[i].x - x);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    setHoverIdx(best);
  };
  const onLeave = () => setHoverIdx(-1);
  const stepSegments = useMemo(() => buildStepSegments(eqPts), [eqPts]);
  const areaPath = useMemo(() => {
    if (!eqPts || eqPts.length < 2) return '';
    let d = `M ${eqPts[0].x},${eqPts[0].y}`;
    for (let i = 0; i < eqPts.length - 1; i++) {
      const a = eqPts[i];
      const b = eqPts[i + 1];
      d += ` H ${b.x} V ${b.y}`;
    }
    d += ` L ${eqPts[eqPts.length-1].x},100 L ${eqPts[0].x},100 Z`;
    return d;
  }, [eqPts]);
  return (
    <div className="w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <defs>
          <linearGradient id="pnlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="none" />
        <line x1={leftPad} y1="0" x2={leftPad} y2="100" stroke="#334155" strokeWidth="0.6" />
        {[20,40,60,80].map((y) => (
          <line key={y} x1={leftPad} y1={y} x2={100 - rightPad} y2={y} stroke="#1f2937" strokeWidth="0.4" />
        ))}
        <line x1={leftPad} y1="100" x2={100 - rightPad} y2="100" stroke="#334155" strokeWidth="0.6" />
        {yTicks.map((t, i) => (
          <text key={i} x={leftPad + 1.5} y={t.y - 0.5} textAnchor="start" fill="#9ca3af" fontSize="2.8">
            {formatMoney(Math.round(t.val))}
          </text>
        ))}
        {hasData ? (
          <>
            <path d={areaPath} fill="url(#pnlFill)" />
            {stepSegments.map((s, i) => (
              <path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            ))}
            <polyline
              points={eqPts.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={balPts.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#64748b"
              strokeWidth="0.8"
              strokeDasharray="2 2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {eqPts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === hoverIdx ? 1.2 : 0.9} fill="#f97316" />
            ))}
            {xTicks.map((t,i) => (
              <text key={i} x={t.x} y="98" textAnchor="middle" fill="#9ca3af" fontSize="2.8">
                {new Date(t.t).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              </text>
            ))}
            {hover ? (
              <>
                <line x1={hover.x} y1="0" x2={hover.x} y2="100" stroke="#94a3b8" strokeDasharray="1 2" strokeWidth="0.5" />
                <rect x={Math.min(hover.x + 2, 52)} y="4" width="46" height="22" rx="2" fill="#0b1220" stroke="#334155" strokeWidth="0.4" />
                <text x={Math.min(hover.x + 4, 65)} y="11" fill="#e5e7eb" fontSize="4.2">
                  Equity: {formatMoney(hover.v)}
                </text>
                <text x={Math.min(hover.x + 4, 65)} y="16" fill="#9ca3af" fontSize="3.6">
                  Balance: {formatMoney(balPts[hoverIdx]?.v ?? 0)}  Profit: {formatSigned((eqPts[hoverIdx]?.v ?? 0) - (balPts[hoverIdx]?.v ?? 0))}
                </text>
                <text x={Math.min(hover.x + 4, 65)} y="20.5" fill="#9ca3af" fontSize="3.2">
                  {new Date(hover.t).toLocaleDateString()}
                </text>
              </>
            ) : null}
          </>
        ) : (
          <text x="50" y="50" textAnchor="middle" fill="#9ca3af" fontSize="6">
            No data
          </text>
        )}
      </svg>
    </div>
  );
}

function formatK(n) {
  const v = Number(n || 0);
  if (v >= 1000) return `${(v/1000).toFixed(1)}k`;
  return v.toFixed(0);
}

function formatSigned(n) {
  const v = Number(n || 0);
  const abs = Math.abs(v);
  const s = abs >= 1000 ? `${(abs/1000).toFixed(1)}k` : abs.toFixed(0);
  return `${v >= 0 ? '+' : '-'}${s}`;
}

function formatMoney(n) {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000) return `$${(v/1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function buildStepSegments(points) {
  if (!points || points.length < 2) return [];
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const color = b.y <= a.y ? '#22c55e' : '#dc2626';
    const d = `M ${a.x},${a.y} H ${b.x} V ${b.y}`;
    segs.push({ d, color });
  }
  return segs;
}
