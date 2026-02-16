import Layout from "../components/Layout";
import { useState } from "react";
import { useStore } from "../state/store.jsx";

const Withdraw = () => {
  const { state } = useStore();
  const [mt5Login, setMt5Login] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [reqId, setReqId] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setStatus("");
    setReqId("");
    const a = Number(amount);
    if (!mt5Login || !Number.isFinite(a) || a <= 0) {
      setStatus("Enter valid MT5 login and amount");
      return;
    }
    try {
      const res = await fetch("/api/withdrawals/request-by-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mt5Login, amount: a }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.error || "Request failed");
        return;
      }
      setReqId(data?.requestId || "");
      setStatus("Requested");
    } catch (err) {
      setStatus("Network error");
    }
  };
  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Withdrawal Request</h2>
        <p className="text-sm text-gray-300 mb-4">
          Withdrawals are processed weekly with an 80/20 profit split. Funds remain at your broker.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <input
            value={mt5Login}
            onChange={(e) => setMt5Login(e.target.value)}
            placeholder="MT5 login"
            className="flex-1 w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (USD)"
            className="flex-1 w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 w-full sm:w-auto transform transition-transform sm:hover:scale-[1.02] active:scale-95">
            Request
          </button>
        </form>
        {status && <div className="mt-3 text-sm text-gray-200">Status: {status}</div>}
        {reqId && <div className="mt-1 text-xs text-gray-400">Request ID: {reqId}</div>}
        <div className="mt-6 text-xs text-gray-400">
          Risk: Trading involves risk. No guaranteed returns. Past performance does not indicate future results.
        </div>
      </div>
    </Layout>
  );
};

export default Withdraw;
