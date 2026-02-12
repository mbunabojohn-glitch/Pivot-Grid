import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 left-0 right-0 h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
        <div className="flex items-center gap-2">
          <img src="/pivotgrid.svg" alt="logo" className="w-6 h-6" />
          <span className="text-lg font-semibold">PivotGrid</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="px-3 py-1.5 rounded border border-gray-700 hover:bg-gray-800 transition-colors">Log in</Link>
          <Link
            to="/signup"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:border-gray-600 hover:shadow-md hover:translate-y-[1px]"
          >
            Get started
          </Link>
        </nav>
      </header>
      <main className="pt-20">
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Automated Trading, Non‑Custodial</h1>
            <p className="mt-4 text-gray-300 text-sm sm:text-base md:text-lg">Connect your broker account, keep full control of your funds, and let the strategy trade. Profit splits at withdrawal with a 20% platform fee.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:border-gray-600 hover:shadow-md hover:translate-y-[1px]"
              >
                Create account
              </Link>
              <Link to="/login" className="px-5 py-2.5 rounded border border-gray-700 hover:bg-gray-800 transition-colors">Log in</Link>
            </div>
          </div>
        </section>
        <section className="mt-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-800">
              <div className="text-xl font-semibold">Non‑custodial</div>
              <p className="mt-2 text-gray-300 text-sm">Your broker or payment processor holds funds. The platform manages permissions and logic only.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-800">
              <div className="text-xl font-semibold">Live performance</div>
              <p className="mt-2 text-gray-300 text-sm">Real‑time dashboard with trades, PnL charts, and transparency reports.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-800">
              <div className="text-xl font-semibold">Fair split</div>
              <p className="mt-2 text-gray-300 text-sm">Profit split applied at withdrawal with a 20% platform share.</p>
            </div>
          </div>
        </section>
        <section className="mt-12 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">Start in minutes</h2>
                <p className="mt-2 text-gray-300 text-sm sm:text-base">Create an account, link your broker, and view live trades from the dashboard.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white transition-all duration-200 hover:from-gray-800 hover:to-gray-700 hover:border-gray-600 hover:shadow-md hover:translate-y-[1px]"
                >
                  Get started
                </Link>
                <Link to="/login" className="px-5 py-2.5 rounded border border-gray-700 hover:bg-gray-800 transition-colors">Log in</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="mt-16 py-8 border-t border-gray-800 text-center text-gray-400">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <p>PivotGrid</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
