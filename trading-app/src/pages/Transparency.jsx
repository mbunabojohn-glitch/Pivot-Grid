import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useStore } from "../state/store.jsx";

const Row = ({ label, value }) => (
  <div className="grid grid-cols-2 gap-4 mb-2">
    <div className="text-gray-300">{label}</div>
    <div className="text-gray-100">{value}</div>
  </div>
);

const Transparency = () => {
  const { state } = useStore();
  const [latest, setLatest] = useState({
    entryReason: "",
    riskPct: 0,
    sl: 0,
    tp: 0,
    outcome: "",
    invalidationReason: "",
  });
  const [weekly, setWeekly] = useState({ grossPnL: 0, netPnL: 0, clientShare: 0, platformShare: 0 });
  useEffect(() => {
    const t = (state.trades || [])[0];
    if (t) {
      setLatest({
        entryReason: t.entryReason || "",
        riskPct: t.riskPct || 0,
        sl: t.sl || 0,
        tp: t.tp || 0,
        outcome: t.result?.pnl ?? "",
        invalidationReason: t.invalidationReason || "",
      });
    }
    if (state.weekly) {
      setWeekly({
        grossPnL: Number(state.weekly.grossPnL || 0),
        netPnL: Number(state.weekly.netPnL || 0),
        clientShare: Number(state.weekly.clientShare || 0),
        platformShare: Number(state.weekly.platformShare || 0),
      });
    }
  }, [state.trades, state.weekly]);
  const WeeklyItem = ({ label, value }) => (
    <div className="p-3 bg-slate-900 rounded border border-gray-700">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-1 font-semibold text-gray-100">{value}</div>
    </div>
  );
  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-100">Performance</h2>
        <Row label="Entry reason" value={latest.entryReason} />
        <Row label="Risk %" value={latest.riskPct} />
        <Row label="SL / TP" value={`${latest.sl} / ${latest.tp}`} />
        <Row label="Outcome" value={latest.outcome} />
        <Row label="Invalidation" value={latest.invalidationReason} />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          <WeeklyItem label="Gross PnL" value={weekly.grossPnL} />
          <WeeklyItem label="Net PnL" value={weekly.netPnL} />
          <WeeklyItem label="Client Share" value={weekly.clientShare} />
          <WeeklyItem label="Platform Share" value={weekly.platformShare} />
        </div>
      </div>
    </Layout>
  );
};

export default Transparency;
