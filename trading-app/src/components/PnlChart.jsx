import React, { useMemo, useState } from "react";

function toCandles(series) {
  const pts = Array.isArray(series) ? series : [];
  if (pts.length < 2) return { candles: [], minX: 0, maxX: 1, minY: 0, maxY: 1 };
  const base = Number(pts[0]?.equity || 0);
  const mapped = pts.map((p) => ({
    t: Number(p.t || p.timestamp || 0),
    v: Number(p.equity || 0) - base,
  }));
  const xs = mapped.map((p) => p.t);
  const ys = mapped.map((p) => p.v);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const bins = Math.min(40, Math.max(10, Math.floor(mapped.length / 3)));
  const binSize = spanX / bins;
  const candles = [];
  for (let i = 0; i < bins; i++) {
    const start = minX + i * binSize;
    const end = start + binSize;
    const bucket = mapped.filter((p) => p.t >= start && p.t < end);
    if (!bucket.length) continue;
    const open = bucket[0].v;
    const close = bucket[bucket.length - 1].v;
    let high = -Infinity;
    let low = Infinity;
    for (const b of bucket) {
      if (b.v > high) high = b.v;
      if (b.v < low) low = b.v;
    }
    const cx = ((start + end) / 2 - minX) / spanX * 100;
    candles.push({ cx, open, close, high, low });
  }
  return { candles, minX, maxX, minY, maxY };
}

export default function PnlChart({ equity = [] }) {
  const { candles, minY, maxY } = useMemo(() => toCandles(equity), [equity]);
  const spanY = Math.max(1, maxY - minY || 1);
  const toY = (v) => 100 - ((v - minY) / spanY) * 100;
  const hasData = candles.length > 0;
  const [hoverIdx, setHoverIdx] = useState(-1);
  const hover = hoverIdx >= 0 ? candles[hoverIdx] : null;
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < candles.length; i++) {
      const d = Math.abs(candles[i].cx - x);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    setHoverIdx(best);
  };
  const onLeave = () => setHoverIdx(-1);
  return (
    <div className="w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <rect x="0" y="0" width="100" height="100" fill="none" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="0.5" />
        {hasData ? (
          <>
            {candles.map((c, i) => {
              const up = c.close >= c.open;
              const bodyTop = toY(Math.max(c.open, c.close));
              const bodyBottom = toY(Math.min(c.open, c.close));
              const bodyHeight = Math.max(0.8, bodyBottom - bodyTop);
              const wickTop = toY(c.high);
              const wickBottom = toY(c.low);
              const color = up ? "#16a34a" : "#dc2626";
              const x = c.cx;
              return (
                <g key={i}>
                  <line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={color} strokeWidth="0.8" />
                  <rect x={x - 1.2} y={bodyTop} width={2.4} height={bodyHeight} fill={color} rx="0.6" />
                </g>
              );
            })}
            {hover ? (
              <>
                <line x1={hover.cx} y1="0" x2={hover.cx} y2="100" stroke="#94a3b8" strokeDasharray="1 2" strokeWidth="0.5" />
                <rect x={Math.min(hover.cx + 2, 70)} y="4" width="28" height="18" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
                <text x={Math.min(hover.cx + 4, 72)} y="11" fill="#e5e7eb" fontSize="4.2">
                  {hover.close >= hover.open ? "Up" : "Down"}
                </text>
                <text x={Math.min(hover.cx + 4, 72)} y="16" fill="#9ca3af" fontSize="3.6">
                  O:{(hover.open).toFixed(2)} C:{(hover.close).toFixed(2)}
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
