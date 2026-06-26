import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MovieDetails } from './pages/MovieDetails';
import { SeatSelection } from './pages/SeatSelection';
import { Checkout } from './pages/Checkout';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Protected Route for Authenticated Users (e.g. checkouts, tickets history)
const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500">Unlocking secure session...</span>
      </div>
    );
  }

  if (!user) {
    // Save current path to return after logging in
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
};

// Protected Admin Route (Strict Role-Based Access Control)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500">Unlocking admin portal keys...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
            
            {/* Main Navigation Header */}
            <Navbar />

          {/* Dynamic Screen Routing Body */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/show/:showId" element={<SeatSelection />} />
              
              {/* Access Auth Portals */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Secure Customer Routes */}
              <Route 
                path="/checkout" 
                element={
                  <AuthenticatedRoute>
                    <Checkout />
                  </AuthenticatedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <AuthenticatedRoute>
                    <UserDashboard />
                  </AuthenticatedRoute>
                } 
              />

              {/* Strict Admin Gate */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* Redirect Unknown Paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Standard Footer */}
          <footer className="bg-slate-900 border-t border-slate-850/80 py-8 px-6 text-center text-xs text-slate-500 select-none">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="font-display font-semibold text-slate-400 tracking-wider">
                CINEPASS TICKET BOX OFFICE
              </span>
              <span>
                © 2026 CinePass Multiplex Booking Systems. All rights registered.
              </span>
            </div>
          </footer>

        </div>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
export { App };
