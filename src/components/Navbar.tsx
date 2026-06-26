import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LogOut, Ticket, LayoutDashboard, Compass, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 text-red-600 font-display font-black text-2xl tracking-tighter hover:opacity-90">
          <Film className="w-7 h-7 stroke-[2.5] text-red-600" />
          <span>PRO<span className="text-white font-light">MOVIES BOOKINGS</span></span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-350">
          <Link to="/" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <Compass className="w-4 h-4" />
            <span>Explore Movies</span>
          </Link>
        </div>

        {/* Right Session Side */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline-block text-xs text-slate-400">
                Welcome, <span className="text-amber-500 font-medium">{user.name}</span>
              </span>

              {user.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50 transition-all shadow-md shadow-indigo-900/20"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/45 transition-all shadow-md shadow-emerald-950/25"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>My Tickets</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-all"
                title="Log Out"
                id="navbar-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/register"
                className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-slate-305 hover:text-white transition-opacity"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-950/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
