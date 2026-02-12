import Layout from "../components/Layout";
import { useEffect, useState } from "react";

const Performance = () => {
  const [weekly, setWeekly] = useState({ grossPnL: 0, netPnL: 0, clientShare: 0, platformShare: 0 });
  useEffect(() => {
    fetch("/api/reports/weekly")
      .then((r) => r.json())
      .then((data) => {
        if (data?.summary) {
          setWeekly({
            grossPnL: Number(data.summary.grossPnL || 0),
            netPnL: Number(data.summary.netPnL || 0),
            clientShare: Number(data.summary.clientShare || 0),
            platformShare: Number(data.summary.platformShare || 0),
          });
        }
      })
      .catch(() => {});
  }, []);
  const Item = ({ label, value }) => (
    <div className="p-3 bg-slate-900 rounded border border-gray-700">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-1 font-semibold text-gray-100">{value}</div>
    </div>
  );
  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-100">Performance Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          <Item label="Gross PnL" value={weekly.grossPnL} />
          <Item label="Net PnL" value={weekly.netPnL} />
          <Item label="Client Share" value={weekly.clientShare} />
          <Item label="Platform Share" value={weekly.platformShare} />
        </div>
      </div>
    </Layout>
  );
};

export default Performance;
