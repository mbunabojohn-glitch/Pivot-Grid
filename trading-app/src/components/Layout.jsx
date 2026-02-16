import { signOut } from "firebase/auth"; 
import { auth } from "../firebase"; 
import { useNavigate, NavLink } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
 
const Layout = ({ children }) => { 
  const navigate = useNavigate(); 
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
 
  const handleLogout = async () => { 
    await signOut(auth); 
    navigate("/"); 
  }; 
 
  return ( 
    <div className="flex min-h-screen bg-gray-950 w-full max-w-[100vw] overflow-x-hidden"> 
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white flex items-center justify-between px-4 py-3 border-b border-gray-800 z-40">
        <button
          aria-label="Open menu"
          className="inline-flex items-center justify-center rounded-md border border-gray-700 px-3 py-2"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">Open menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <img src="/pivotgrid.svg" alt="PivotGrid logo" className="w-7 h-7" />
          <h2 className="text-xl font-bold">PivotGrid</h2>
        </div>
        <div className="w-10" />
      </div>
      {open && <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white p-6 flex flex-col transform transition-transform duration-200 z-50 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:flex`}> 
        <div className="flex items-center gap-2 mb-8">
          <img src="/pivotgrid.svg" alt="PivotGrid logo" className="w-8 h-8" />
          <h2 className="text-2xl font-bold">PivotGrid</h2>
        </div>
        <nav className="space-y-2"> 
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>Dashboard</NavLink> 
          <NavLink to="/trades" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>Trades</NavLink> 
          <NavLink to="/performance" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>Performance</NavLink> 
          <NavLink to="/account-link" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>Account Link</NavLink> 
          <NavLink to="/ai" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>AI Assistant</NavLink> 
          <NavLink to="/withdraw" onClick={() => setOpen(false)} className={({ isActive }) => `block px-3 py-2 rounded transition-transform ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'} sm:hover:translate-x-0.5`}>Withdraw</NavLink> 
        </nav> 
        <div className="mt-auto"> 
          {currentUser && ( 
            <div className="text-xs text-gray-300 mb-3 break-all"> 
              {currentUser.email} 
            </div> 
          )} 
          <button 
            onClick={handleLogout} 
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 w-full" 
          > 
            Logout 
          </button> 
        </div> 
      </aside> 
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pt-14 md:pt-8 lg:ml-64 overflow-x-hidden max-w-[100vw]"> 
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden max-w-[100vw]">
          {children}
        </div>
      </main> 
    </div> 
  ); 
 }; 
 
 export default Layout;
