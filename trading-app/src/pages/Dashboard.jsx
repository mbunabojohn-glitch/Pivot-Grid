import Layout from "../components/Layout"; 
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../state/store.jsx";
import PnlChart from "../components/PnlChart.jsx";

const Dashboard = () => { 
  const { currentUser } = useAuth();
  const { state } = useStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    const ref = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setUserData(snap.data() || null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const fmt = (n) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lastPoint = state.equity.length ? state.equity[state.equity.length - 1] : null;
  const latestEquity = lastPoint ? lastPoint.equity : null;
  const latestBalance = lastPoint?.balance ?? state.balance;
  const openTrades = (state.trades || []).filter((t) => t?.result?.pnl == null).length;

  return ( 
    <Layout> 
      <div className="w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Dashboard Overview</h1> 
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Account Balance</h2> 
          <p className="text-2xl font-bold mt-2 text-gray-100">
            {state.connection.status === 'connected' ? `$${fmt(latestBalance)}` : loading ? "Loading..." : `$${fmt(userData?.balance)}`}
          </p> 
        </div> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Equity</h2> 
          <p className="text-2xl font-bold mt-2 text-gray-100">
            {state.connection.status === 'connected'
              ? latestEquity != null ? `$${fmt(latestEquity)}` : '—'
              : loading
                ? "Loading..."
                : `$${fmt(userData?.equity)}`}
          </p> 
        </div> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Total Profit</h2> 
          <p
            className={`text-2xl font-bold mt-2 ${
              state.connection.status === 'connected'
                ? ((latestEquity ?? 0) - (latestBalance ?? 0)) >= 0 ? "text-green-400" : "text-red-400"
                : loading
                  ? ""
                  : (userData?.profit ?? 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
            }`}
          >
            {state.connection.status === 'connected'
              ? `${((latestEquity ?? 0) - (latestBalance ?? 0)) >= 0 ? "+" : "-"}$${fmt(Math.abs((latestEquity ?? 0) - (latestBalance ?? 0)))}`
              : loading
                ? "Loading..."
                : `${(userData?.profit ?? 0) >= 0 ? "+" : "-"}$${fmt(Math.abs(userData?.profit ?? 0))}`}
          </p> 
        </div> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Withdrawable</h2> 
          <p className="text-2xl font-bold mt-2 text-gray-100">
            {loading ? "Loading..." : `$${fmt(userData?.withdrawable)}`}
          </p> 
        </div> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Drawdown</h2> 
          <p className={`text-2xl font-bold mt-2 ${Number(state.drawdownPct || 0) > 0 ? 'text-red-400' : 'text-gray-100'}`}>
            {state.connection.status === 'connected'
              ? `${(Number(state.drawdownPct || 0)).toFixed(2)}%`
              : loading
                ? "Loading..."
                : `${(Number(userData?.drawdownPct || 0)).toFixed(2)}%`}
          </p> 
        </div> 
        <div className="bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow min-h-24 motion-safe:animate-scale-in transition-transform sm:hover:-translate-y-0.5"> 
          <h2 className="text-gray-100">Open Trades</h2> 
          <p className="text-2xl font-bold mt-2 text-gray-100">{openTrades}</p> 
        </div> 
      </div> 
      <div className="mt-8 sm:mt-10 bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow motion-safe:animate-fade-in overflow-hidden max-w-full"> 
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-100">PnL Chart</h2>
        <PnlChart equity={state.equity} />
      </div>
      <div className="mt-6 bg-slate-900 text-gray-100 p-4 sm:p-5 md:p-6 rounded-xl shadow motion-safe:animate-fade-in overflow-hidden max-w-full"> 
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-100">Recent Trades</h2> 
        <div className="space-y-3"> 
          {state.trades.slice(0,3).map((t) => (
            <div key={t.tradeId} className="flex justify-between">
              <span>{t.symbol} {String(t.direction).toUpperCase()}</span>
              <span className={(t.result?.pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}>
                {t.result?.pnl != null ? `${(t.result.pnl >= 0 ? '+' : '-')}$${fmt(Math.abs(t.result.pnl))}` : '—'}
              </span>
            </div>
          ))}
        </div> 
      </div> 
      </div>
    </Layout> 
  ); 
}; 

export default Dashboard;
