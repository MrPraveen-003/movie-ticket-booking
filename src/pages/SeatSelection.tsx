import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Movie, Show, Theatre } from '../types';
import { useAuth } from '../context/AuthContext';
import { Landmark, ArrowLeft, Armchair, HelpCircle, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';

export const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [show, setShow] = useState<Show | null>(null);
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/shows/${showId}`);
        setMovie(data.movie);
        setShow(data.show);
        setTheatre(data.theatre);
      } catch (err) {
        console.error('Failed fetching show seating blueprint', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowDetails();
  }, [showId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Assembling interactive seat blueprint...</p>
      </div>
    );
  }

  if (!show || !movie || !theatre) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-slate-300">Seating chart not found or showtime expired.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-amber-500 hover:underline flex items-center gap-2 mx-auto justify-center">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  // Row and Columns configuration
  // Rows: A-F
  // Cols: 1-12
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);

  // Seat Category classification helper
  const getSeatCategory = (row: string): { name: string; multiplier: number; price: number; color: string } => {
    if (['A', 'B'].includes(row)) {
      return { 
        name: 'Premium Deck', 
        multiplier: 1.5, 
        price: Math.round(show.price * 1.5),
        color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
      };
    } else if (['E', 'F'].includes(row)) {
      return { 
        name: 'VIP Recliner Suite', 
        multiplier: 2.0, 
        price: Math.round(show.price * 2.0),
        color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
      };
    }
    return { 
      name: 'Normal Deck', 
      multiplier: 1.0, 
      price: Math.round(show.price * 1.0),
      color: 'text-slate-300 border-slate-700/50 bg-slate-850/20'
    };
  };

  const toggleSeatSelection = (seatCode: string) => {
    if (show.bookedSeats.includes(seatCode)) return; // Locked

    setSelectedSeats((prev) => {
      if (prev.includes(seatCode)) {
        return prev.filter((s) => s !== seatCode);
      } else {
        if (prev.length >= 8) {
          showToast('⚠️ Limit Reached! You can book a maximum of 8 tickets in a single transaction.', 'warning');
          return prev;
        }
        return [...prev, seatCode];
      }
    });
  };

  // Live total calculation
  const calculateTotal = (): number => {
    let total = 0;
    selectedSeats.forEach((seat) => {
      const row = seat.charAt(0);
      const { price } = getSeatCategory(row);
      total += price;
    });
    return total;
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;

    if (!user) {
      // Need Login first
      navigate(`/login?redirect=/show/${showId}`);
      return;
    }

    // Go to checkout and pass params
    navigate('/checkout', {
      state: {
        showId: show.id,
        seats: selectedSeats,
        totalPrice: calculateTotal(),
        movie,
        show,
        theatre
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header bar link back */}
      <div className="bg-slate-900 border-b border-slate-805/90 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(`/movie/${movie.id}`)} 
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Show Date / Hour</span>
          </button>
          
          <div className="text-right">
            <h1 className="text-white font-display font-semibold text-sm sm:text-md line-clamp-1">{movie.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{theatre.name} ({show.screen})</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Seats Grid Section */}
        <div className="lg:col-span-3 flex flex-col items-center bg-slate-900/40 border border-slate-805/80 p-6 md:p-10 rounded-3xl">
          
          {/* Real Screen Curve representation with glow */}
          <div className="w-full max-w-lg mb-14 text-center select-none relative">
            <div className="text-[10px] uppercase tracking-widest text-[#6366f1] font-mono mb-2">CINEMA SCREEN DIRECTION</div>
            <div className="h-2 w-full bg-[#6366f1]/25 rounded-b-full movie-screen-glow" />
          </div>

          {/* Map layout Rows */}
          <div className="flex flex-col gap-3.5 w-full max-w-2xl select-none">
            {rows.map((row) => {
              const { name, price } = getSeatCategory(row);
              
              return (
                <div key={row} className="flex items-center justify-between gap-3 md:gap-5">
                  {/* Left Row Indicator */}
                  <span className="w-5 font-mono text-xs font-semibold text-slate-500 text-center">{row}</span>
                  
                  {/* Row Seats columns list */}
                  <div className="flex flex-grow justify-around gap-1.5 sm:gap-2.5">
                    {cols.map((col) => {
                      const seatCode = `${row}${col}`;
                      const isBooked = show.bookedSeats.includes(seatCode);
                      const isSelected = selectedSeats.includes(seatCode);

                      return (
                        <div
                          key={col}
                          onClick={() => toggleSeatSelection(seatCode)}
                          className={`
                            aspect-square flex-1 flex items-center justify-center rounded-lg text-[9px] sm:text-[11px] font-mono font-bold border cursor-pointer transition-all select-none
                            ${isBooked 
                              ? 'bg-slate-950 border-slate-900 text-slate-800 cursor-not-allowed pointer-events-none' 
                              : isSelected
                                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/20 glow-text scale-110'
                                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-slate-850'
                            }
                          `}
                          title={`${seatCode} (${name} - $${price})`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : col}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Row Indicator */}
                  <span className="w-5 font-mono text-xs font-semibold text-slate-500 text-center">{row}</span>
                </div>
              );
            })}
          </div>

          {/* Seat Layout Legend indicators */}
          <div className="flex flex-wrap items-center justify-center gap-5 mt-12 bg-slate-950/45 p-4 rounded-2xl border border-slate-805/40 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-slate-900 border border-slate-800 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-amber-500 border border-amber-500 rounded" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 bg-slate-950 border border-slate-900 rounded" />
              <span>Reserved</span>
            </div>
          </div>
        </div>

        {/* Sidebar Selections summary panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6 flex flex-col justify-between gap-6 h-full">
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-md text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Summary Box</span>
                <span className="text-[10px] bg-slate-800 font-mono text-slate-400 px-2 py-0.5 rounded uppercase">CART</span>
              </h2>

              <div className="flex flex-col gap-1.5">
                <span className="text-slate-450 text-xs">Selected Movie</span>
                <span className="text-white font-display font-medium text-sm">{movie.title}</span>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-slate-450 text-xs">Showtime Scheduling</span>
                <div className="text-white text-xs font-mono">
                  <span>{show.date} at </span>
                  <span className="text-amber-500 font-semibold">{show.time}</span>
                  <p className="text-[10px] text-slate-500 hover:text-slate-400 mt-1">{theatre.name} - {show.screen}</p>
                </div>
              </div>

              {/* Deck Prices Breakdown list */}
              <div className="space-y-2 mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 text-xs">
                <span className="font-semibold text-slate-300 block mb-1">Row Multipliers</span>
                <div className="flex justify-between text-slate-400">
                  <span>VIP Lounge (Row E, F)</span>
                  <span className="font-semibold text-indigo-400">${show.price * 2}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Premium (Row A, B)</span>
                  <span className="font-semibold text-emerald-400">${Math.round(show.price * 1.5)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Normal (Row C, D)</span>
                  <span className="font-semibold text-slate-300">${show.price}</span>
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-slate-400 text-xs">Your Seats</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedSeats.map((seat) => {
                      const row = seat.charAt(0);
                      const isVip = ['E', 'F'].includes(row);
                      const isPrem = ['A', 'B'].includes(row);
                      return (
                        <span 
                          key={seat} 
                          className={`
                            px-3 py-1 rounded-md text-[11px] font-mono font-bold uppercase border
                            ${isVip 
                              ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300' 
                              : isPrem 
                                ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-300' 
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }
                          `}
                        >
                          {seat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-5 flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <span className="text-slate-400 text-xs">Total Tickets price</span>
                <span className="text-3xl font-display font-bold text-amber-500">${calculateTotal()}</span>
              </div>

              <motion.button
                whileHover={selectedSeats.length > 0 ? { scale: 1.02 } : {}}
                whileTap={selectedSeats.length > 0 ? { scale: 0.98 } : {}}
                disabled={selectedSeats.length === 0}
                onClick={handleProceed}
                className={`
                  w-full font-display font-semibold text-center text-sm py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer
                  ${selectedSeats.length > 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-950/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-755'
                  }
                `}
                id="seat-proceed-btn"
              >
                <span>Proceed to Payment</span>
              </motion.button>

              {!user && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-450 mt-1">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>You will be prompted to log in before purchasing seats.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default SeatSelection;
