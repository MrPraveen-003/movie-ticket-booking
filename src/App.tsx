import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { Checkout } from './pages/Checkout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { MovieDetails } from './pages/MovieDetails';
import { Register } from './pages/Register';
import { SeatSelection } from './pages/SeatSelection';
import { UserDashboard } from './pages/UserDashboard';

type RouteGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading && !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
        <span className="text-xs font-mono text-slate-500">
          {requireAdmin ? 'Unlocking admin portal keys...' : 'Unlocking secure session...'}
        </span>
      </div>
    );
  }

  if (!user) {
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col justify-between bg-slate-950 text-slate-100">
            <Navbar />

            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/show/:showId" element={<SeatSelection />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/checkout"
                  element={
                    <RouteGuard>
                      <Checkout />
                    </RouteGuard>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RouteGuard>
                      <UserDashboard />
                    </RouteGuard>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RouteGuard requireAdmin>
                      <AdminDashboard />
                    </RouteGuard>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="select-none border-t border-slate-850/80 bg-slate-900 px-6 py-8 text-center text-xs text-slate-500">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-display font-semibold tracking-wider text-slate-400">MOVIE TICKET BOX OFFICE</span>
                <span>© 2026 Movie Ticket Booking Systems. All rights reserved.</span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export { App };
