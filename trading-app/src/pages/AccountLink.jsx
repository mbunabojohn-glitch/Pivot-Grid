import { useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const AccountLink = () => {
  const { currentUser } = useAuth();
  const [mt5, setMt5] = useState("");
  const [status, setStatus] = useState("");

  const save = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      const base = snap.exists() ? snap.data() : {};
      await setDoc(ref, { ...base, mt5Account: mt5 }, { merge: true });
      setStatus("Saved");
    } catch (err) {
      setStatus(err.message || "Error");
    }
  };

  return (
    <Layout>
      <div className="bg-slate-900 text-gray-100 rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Account Linking (MT5)</h2>
        <form onSubmit={save} className="flex flex-col sm:flex-row gap-3">
          <input
            value={mt5}
            onChange={(e) => setMt5(e.target.value)}
            placeholder="Enter MT5 account number"
            className="flex-1 w-full border border-gray-700 bg-gray-900 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 w-full sm:w-auto">
            Save
          </button>
        </form>
        <p className="text-sm text-gray-300 mt-3">
          This platform is non-custodial. Funding and withdrawals occur at your broker.
        </p>
        {status && <div className="mt-3 text-sm text-gray-200">{status}</div>}
      </div>
    </Layout>
  );
};

export default AccountLink;
