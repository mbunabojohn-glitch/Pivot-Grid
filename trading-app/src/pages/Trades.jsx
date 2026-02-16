import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useStore } from "../state/store.jsx";

const Trades = () => {
  const { state } = useStore();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const mapped = (state.trades || []).map((t, i) => ({
      id: t.tradeId || i + 1,
      symbol: t.symbol || "N/A",
      direction: t.direction || "N/A",
      result: t.result?.pnl ?? "",
    }));
    setRows(mapped);
  }, [state.trades]);
  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-4 sm:p-5 md:p-6 motion-safe:animate-scale-in">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-100">Trade History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-[360px] w-full text-sm sm:text-base">
            <thead>
              <tr className="text-left text-gray-300">
                <th className="p-2 sm:p-3 whitespace-nowrap">ID</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Symbol</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Direction</th>
                <th className="p-2 sm:p-3 whitespace-nowrap">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-700">
                  <td className="p-2 sm:p-3">{r.id}</td>
                  <td className="p-2 sm:p-3 break-all">{r.symbol}</td>
                  <td className="p-2 sm:p-3">{r.direction}</td>
                  <td className="p-2 sm:p-3">{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Trades;
