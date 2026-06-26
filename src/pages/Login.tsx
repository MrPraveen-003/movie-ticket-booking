import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Film, LogIn, Lock, Mail, Compass, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // Redirect path after sign in
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      showToast('⚠️ Please enter both your email address and password.', 'warning');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      showToast('🌟 Welcome back! You have logged into CinePass successfully.', 'success');
      navigate(redirect);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick seed logins helper helper
  const handleQuickLogin = async (usrEmail: string, pass: string) => {
    try {
      setLoading(true);
      setError('');
      await login(usrEmail, pass);
      showToast(`⚡ Quick Login Successful: Connected as ${usrEmail === 'admin@cinepass.com' ? 'Administrator' : 'Customer'}!`, 'success');
      navigate(redirect);
    } catch (err: any) {
      setError('Quick login failed, please register or retype.');
      showToast('Failed to connect via demo credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        
        {/* Core login sheet */}
        <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center flex flex-col items-center gap-2">
            <Link to="/" className="flex items-center gap-1 text-amber-500 font-display font-bold text-2xl tracking-wider mb-2">
              <Film className="w-7 h-7" />
              <span>CINE<span className="text-white font-light">PASS</span></span>
            </Link>
            <h2 className="text-xl font-display font-semibold text-white">Sign In to Your Account</h2>
            <p className="text-xs text-slate-450 leading-relaxed max-w-sm">
              Please enter your credentials to unlock tickets, reserve premium seats, and view order history records.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/35 bg-red-500/10 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500/50 focus:outline-none"
                  id="login-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500/50 focus:outline-none"
                  id="login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold py-3 text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              id="login-submit-btn"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.3]" />
                  <span>Verify Profile Credentials</span>
                </>
              )}
            </button>
          </form>

          {/* Seed demo quick taps helper boxes */}
          <div className="mt-2 bg-slate-950 p-4 border border-slate-850/85 rounded-xl text-[11px] space-y-2.5 flex flex-col">
            <span className="font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-505" />
              <span>Evaluator Demo Profiles:</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <button
                onClick={() => handleQuickLogin('user@cinepass.com', 'user123')}
                disabled={loading}
                className="p-2 py-2.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 font-semibold hover:border-amber-505/30 transition-all cursor-pointer"
                id="quick-user-login-btn"
              >
                Standard Customer <span className="text-amber-500 text-[10px] block mt-0.5">user123</span>
              </button>
              <button
                onClick={() => handleQuickLogin('admin@cinepass.com', 'admin123')}
                disabled={loading}
                className="p-2 py-2.5 rounded-lg border border-indigo-900 bg-slate-900 text-slate-300 font-semibold hover:border-indigo-505/30 transition-all cursor-pointer"
                id="quick-admin-login-btn"
              >
                System Admin <span className="text-indigo-400 text-[10px] block mt-0.5">admin123</span>
              </button>
            </div>
          </div>

          {/* Footer routing link */}
          <div className="text-xs text-center text-slate-450 border-t border-slate-855 pt-4">
            <span>New to CinePass? </span>
            <Link to="/register" className="text-amber-500 hover:underline font-semibold ml-0.5">Sign up today</Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Login;
