import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Ticket, Calendar, Clock, MapPin, ScanQrCode, Sparkles, LogIn, ArrowRight, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, formatShowTime } from '../utils/formatters';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [successBanner, setSuccessBanner] = useState(false);

  // QR Modal State
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);

  useEffect(() => {
    // Check if success url param exists to show celebratory banner
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('success') === 'true') {
      setSuccessBanner(true);
      showToast('🎟️ Tickets Secured! Your live scannable QR keys have been registered successfully.', 'success');
    }
  }, [location, showToast]);

  useEffect(() => {
    const fetchMyHistory = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await axios.get('/api/bookings/my');
        setBookings(data);
      } catch (err) {
        console.error('Failed loading order history records', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-8 text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-450 mb-5">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="font-display font-semibold text-lg text-white">Sign In to See Your Tickets</h2>
        <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
          Access your bookings, receipts, and entry details from your personal account profile.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold py-3 rounded-lg text-xs tracking-wider transition-colors uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-970/10"
        >
          <LogIn className="w-4 h-4" />
          <span>Login Profile Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Banner celebrate */}
        {successBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm"
          >
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Booking registration success!</span> Your cinematic QR ticket code has been compiled and is ready below. Complete billing details are stored securely.
            </div>
            <button 
              onClick={() => setSuccessBanner(false)} 
              className="text-slate-400 hover:text-white font-mono text-xs font-semibold px-2"
            >
              Okay
            </button>
          </motion.div>
        )}

        {/* Dashboard Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-850 text-amber-500 shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">My Movie Tickets</h1>
              <p className="text-xs text-slate-400 mt-0.5">Explore active showtimes, QR tickets, and historic booking registries</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Book another show</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-505 rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-500">Querying your tickets...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/35 border border-slate-805/80 rounded-3xl p-6">
            <Ticket className="w-10 h-10 text-slate-500/75 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="font-display font-semibold text-md text-slate-300">You haven't booked any movies yet!</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Explore our current movie listings, select a convenient multiplex showtime, and your booking history will generate files right here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-amber-500 font-semibold px-4 py-2 rounded-xl text-xs"
            >
              Explore Now Showing Movies
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-gradient-to-br from-[#0c0c0c] to-[#121212] border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:border-red-500/30 hover:shadow-red-950/10 hover:shadow-xl transition-all relative"
              >
                {/* Authentic 3D Ticket circular stub stamp punch marks */}
                <div className="hidden md:block absolute left-[132px] top-0 -translate-y-1/2 w-6 h-6 rounded-full bg-[#050505] border-b border-white/10 z-10" />
                <div className="hidden md:block absolute left-[132px] bottom-0 translate-y-1/2 w-6 h-6 rounded-full bg-[#050505] border-t border-white/10 z-10" />
                
                {/* Poster stub Column */}
                <div className="w-full md:w-36 bg-slate-950 shrink-0 relative aspect-[16/9] md:aspect-[3/4.2] overflow-hidden border-b md:border-b-0 md:border-r md:border-dashed border-white/10">
                  <img 
                    src={booking.showDetails.moviePoster} 
                    alt={booking.showDetails.movieTitle} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                {/* Main Body ticket */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-500">BOOKING ID: {booking.id.toUpperCase()}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        CONFIRMED PAID
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-white tracking-snug line-clamp-1">{booking.showDetails.movieTitle}</h3>

                    {/* Meta lists grids */}
                    <div className="grid grid-cols-2 gap-4 text-xs mt-1">
                      <div className="flex items-start gap-2 text-slate-400">
                        <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-white font-semibold">{booking.showDetails.theatreName}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{booking.showDetails.location}</span>
                          <span className="text-[10px] text-slate-455 font-mono font-medium mt-0.5">{booking.showDetails.screen}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-450">
                        <Calendar className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-white font-mono font-medium">{booking.showDetails.date}</span>
                          <span className="text-[10.5px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-505" />
                            <span>{formatShowTime(booking.showDetails.time)} Showtime</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Seats */}
                  <div className="border-t border-slate-805/70 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500 text-[10px] uppercase tracking-wider">Assigned Seats</span>
                      <div className="flex flex-wrap gap-1">
                        {booking.seats.map((seat) => (
                          <span key={seat} className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-slate-500 text-[10px] uppercase">Paid amount</span>
                        <span className="text-md sm:text-lg font-bold text-white font-mono">{formatCurrency(booking.totalPrice)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedBookingForQr(booking)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-semibold text-xs border border-amber-500/35 shadow-lg tracking-wider transition-all cursor-pointer shadow-amber-970/10"
                        id={`qr-btn-${booking.id}`}
                      >
                        <ScanQrCode className="w-4 h-4 stroke-[2.3]" />
                        <span>ACCESS QR CODE</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* QR Code Scan Backdrop overlay Modal popup */}
      {selectedBookingForQr && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center flex flex-col items-center gap-6 shadow-2xl relative"
          >
            {/* Header info */}
            <div>
              <h3 className="font-display font-bold text-lg text-white">Multiplex Ticket Pass</h3>
              <p className="text-[10px] font-mono text-slate-505 uppercase tracking-wide mt-0.5">Booking ID: {selectedBookingForQr.id}</p>
            </div>

            {/* Generated QR (Real HTTP Source API) */}
            <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-700/10 relative">
              <img 
                src={selectedBookingForQr.qrCode} 
                alt="Ticket Entry Barcode QR" 
                referrerPolicy="no-referrer"
                className="w-44 h-44 pointer-events-none" 
              />
              {/* Corner decor scanner lines */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-slate-900" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-slate-900" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-slate-900" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-slate-900" />
            </div>

            {/* Scannable instruction text */}
            <div className="text-xs text-slate-400 space-y-2">
              <span className="font-bold text-white block">Present at Multiplex Ingress</span>
              <p className="text-[11px] leading-relaxed">
                Scan this QR code at the physical {selectedBookingForQr.showDetails.screen} gate scanner inside <span className="text-amber-400 font-semibold">{selectedBookingForQr.showDetails.theatreName}</span>.
              </p>
              <div className="text-[11px] font-mono mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-805">
                Seats: <span className="text-amber-400 font-bold uppercase">{selectedBookingForQr.seats.join(', ')}</span>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedBookingForQr(null)}
              className="mt-2 w-full bg-slate-800 hover:bg-slate-750 text-white font-semibold py-3 rounded-xl text-xs transition-colors"
              id="qr-modal-close"
            >
              Close Ticket Scanner
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
export default UserDashboard;
