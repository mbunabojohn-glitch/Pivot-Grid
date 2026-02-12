import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useStore } from "../state/store.jsx";

const AI = () => {
  const { state } = useStore();
  const [explanation, setExplanation] = useState({ title: "AI Assistant", text: "", entryRationale: "", tpReason: "", slReason: "" });
  const [drawdown, setDrawdown] = useState({ title: "Drawdown explanation", text: "" });
  const [tradeId, setTradeId] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    fetch("/api/ai/explain")
      .then((r) => r.json())
      .then((data) => {
        if (data?.title || data?.text || data?.entryRationale || data?.tpReason || data?.slReason) {
          setExplanation({
            title: data.title || "AI Assistant",
            text: data.text || "",
            entryRationale: data.entryRationale || "",
            tpReason: data.tpReason || "",
            slReason: data.slReason || ""
          });
        }
      })
      .catch(() => {});
    fetch("/api/ai/drawdown")
      .then((r) => r.json())
      .then((data) => {
        if (data?.title || data?.text) {
          setDrawdown({ title: data.title || "Drawdown explanation", text: data.text || "" });
        }
      })
      .catch(() => {});
  }, [state.trades, state.drawdownPct]);
  const latest = state.trades[0] || {};
  const recentTrades = (state.trades || []).slice(0, 10);
  const handleExplainSpecific = async () => {
    const id = String(tradeId || "").trim();
    if (!id) return;
    setLoadingExplain(true);
    try {
      const r = await fetch(`/api/ai/explain/${encodeURIComponent(id)}`);
      const data = await r.json();
      if (data?.title || data?.text || data?.entryRationale || data?.tpReason || data?.slReason) {
        setExplanation({
          title: data.title || "AI Assistant",
          text: data.text || "",
          entryRationale: data.entryRationale || "",
          tpReason: data.tpReason || "",
          slReason: data.slReason || ""
        });
        const item = {
          id,
          title: data.title || "AI Assistant",
          text: data.text || "",
          entryRationale: data.entryRationale || "",
          tpReason: data.tpReason || "",
          slReason: data.slReason || "",
          symbol: recentTrades.find((t) => (t.tradeId || "") === id)?.symbol || "",
          direction: recentTrades.find((t) => (t.tradeId || "") === id)?.direction || "",
          ts: Date.now()
        };
        setHistory((prev) => {
          const filtered = prev.filter((h) => h.id !== id);
          const next = [item, ...filtered];
          return next.slice(0, 10);
        });
      }
    } catch {}
    setLoadingExplain(false);
  };
  const handleSelectChange = async (e) => {
    const id = e.target.value;
    setTradeId(id);
    if (id) {
      setLoadingExplain(true);
      try {
        const r = await fetch(`/api/ai/explain/${encodeURIComponent(id)}`);
        const data = await r.json();
        if (data?.title || data?.text || data?.entryRationale || data?.tpReason || data?.slReason) {
          setExplanation({
            title: data.title || "AI Assistant",
            text: data.text || "",
            entryRationale: data.entryRationale || "",
            tpReason: data.tpReason || "",
            slReason: data.slReason || ""
          });
          const item = {
            id,
            title: data.title || "AI Assistant",
            text: data.text || "",
            entryRationale: data.entryRationale || "",
            tpReason: data.tpReason || "",
            slReason: data.slReason || "",
            symbol: recentTrades.find((t) => (t.tradeId || "") === id)?.symbol || "",
            direction: recentTrades.find((t) => (t.tradeId || "") === id)?.direction || "",
            ts: Date.now()
          };
          setHistory((prev) => {
            const filtered = prev.filter((h) => h.id !== id);
            const next = [item, ...filtered];
            return next.slice(0, 10);
          });
        }
      } catch {}
      setLoadingExplain(false);
    }
  };
  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-100">AI Assistant</h2>
        <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select
            onChange={handleSelectChange}
            value={tradeId}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          >
            <option value="">Select recent trade</option>
            {recentTrades.map((t) => {
              const label = `${t.tradeId || 'N/A'} • ${t.symbol || ''} • ${t.direction || ''} • SL ${t.sl ?? '-'} • TP ${t.tp ?? '-'}`;
              return (
                <option key={t.tradeId || label} value={t.tradeId || ''}>
                  {label}
                </option>
              );
            })}
          </select>
          <input
            value={tradeId}
            onChange={(e) => setTradeId(e.target.value)}
            placeholder="Enter tradeId (e.g. demo-1 or DB _id)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <button
            onClick={handleExplainSpecific}
            disabled={loadingExplain}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loadingExplain ? "Explaining..." : "Explain trade"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="text-gray-300">Symbol</div>
          <div className="text-gray-100">{latest.symbol || "N/A"}</div>
          <div className="text-gray-300">Direction</div>
          <div className="text-gray-100">{latest.direction || "N/A"}</div>
          <div className="text-gray-300">Entry</div>
          <div className="text-gray-100">{latest.entryLimit ?? "N/A"}</div>
          <div className="text-gray-300">SL / TP</div>
          <div className="text-gray-100">{`${latest.sl ?? "N/A"} / ${latest.tp ?? "N/A"}`}</div>
          <div className="text-gray-300">Risk %</div>
          <div className="text-gray-100">{latest.riskPct ?? "N/A"}</div>
          <div className="text-gray-300">Entry reason</div>
          <div className="text-gray-100">{latest.entryReason || "N/A"}</div>
        </div>
        <div className="space-y-3">
          <div className="text-gray-100 font-semibold">Entry rationale</div>
          <div className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{explanation.entryRationale || "—"}</div>
          <div className="text-gray-100 font-semibold">Take Profit reason</div>
          <div className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{explanation.tpReason || "—"}</div>
          <div className="text-gray-100 font-semibold">Stop Loss reason</div>
          <div className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{explanation.slReason || "—"}</div>
          <div className="text-gray-100 font-semibold">Summary</div>
          <div className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{explanation.text || "No explanation available yet."}</div>
        </div>
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-100">Drawdown</h3>
          <div className="text-gray-300 whitespace-pre-wrap text-sm sm:text-base">{drawdown.text || "No drawdown explanation available yet."}</div>
        </div>
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-100">Recent explanations</h3>
          <div className="space-y-2">
            {history.length === 0 && <div className="text-gray-400 text-sm">No recent explanations yet.</div>}
            {history.map((h) => {
              const meta = [h.symbol, h.direction].filter(Boolean).join(" • ");
              return (
                <button
                  key={`${h.id}-${h.ts}`}
                  onClick={() =>
                    setExplanation({
                      title: h.title,
                      text: h.text,
                      entryRationale: h.entryRationale,
                      tpReason: h.tpReason,
                      slReason: h.slReason
                    })
                  }
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-100">{h.id}</div>
                    <div className="text-xs text-gray-400">{new Date(h.ts).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{meta}</div>
                  <div className="text-sm text-gray-300 mt-2 line-clamp-2">{h.text}</div>
                </button>
              );
            })}
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="mt-3 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              Clear history
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AI;
