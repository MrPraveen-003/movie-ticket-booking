import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Film, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      const msg = 'Please fill in all of the registration fields.';
      setError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match each other.';
      setError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, email, password);
      showToast(`🎉 Registration successful! Welcome, ${name}!`, 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Try an alternate email address.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        
        {/* Core register sheet */}
        <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center flex flex-col items-center gap-2">
            <Link to="/" className="flex items-center gap-1 text-amber-500 font-display font-bold text-2xl tracking-wider mb-2">
              <Film className="w-7 h-7" />
              <span>MOVIE<span className="text-white font-light">BOOK</span></span>
            </Link>
            <h2 className="text-xl font-display font-semibold text-white">Create Your Account</h2>
            <p className="text-xs text-slate-450 leading-relaxed max-w-xs">
              Unlock live bookings, seat locks, dynamic ticketing stats, and barcode passes.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/35 bg-red-500/10 text-red-300 text-xs text-center font-medium font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500/50 focus:outline-none"
                  id="register-name"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  id="register-email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Password (Min 6 chars)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500/50 focus:outline-none"
                  id="register-password"
                />
              </div>
            </div>

            {/* Password Confirm */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Confirm Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-amber-500/50 focus:outline-none"
                  id="register-password-confirm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold py-3 text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              id="register-submit-btn"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.3]" />
                  <span>Establish Account Securely</span>
                </>
              )}
            </button>
          </form>

          {/* Footer routing link */}
          <div className="text-xs text-center text-slate-450 border-t border-slate-855 pt-4">
            <span>Already have an account? </span>
            <Link to="/login" className="text-amber-505 hover:underline font-semibold ml-0.5">Sign in credentials</Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Register;
