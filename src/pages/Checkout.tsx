import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatShowTime } from '../utils/formatters';

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve passed variables from router state
  const state = location.state as {
    showId: string;
    seats: string[];
    totalPrice: number;
    movie: any;
    show: any;
    theatre: any;
  } | null;

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const { showToast } = useToast();
  
  // Card Inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');

  if (!state) {
    return (
      <div className="text-center py-24 min-h-[80vh] flex flex-col justify-center items-center">
        <p className="text-xl text-slate-350">No transaction context detected.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-lg">
          Explore movies list
        </button>
      </div>
    );
  }

  const { showId, seats, totalPrice, movie, show, theatre } = state;

  // Convenience computations
  const countTickets = seats.length;
  const bookingFee = parseFloat((countTickets * 1.5).toFixed(2)); // $1.50 convenient processing fee per seat
  const gstTax = parseFloat((totalPrice * 0.05).toFixed(2)); // 5% cinema tax
  const finalInvoicedAmount = (totalPrice + bookingFee + gstTax).toFixed(2);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      setError('Please fill in all credit card parameters.');
      return;
    }

    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setError('Please enter a valid 16-digit credit card number.');
      return;
    }

    try {
      setPaymentLoading(true);
      setError('');

      // Call API to register show seats booking
      await axios.post('/api/bookings', {
        showId,
        seats
      });

      // Show success screen popup!
      setPaymentLoading(false);
      setSuccessOverlay(true);
      showToast('🎉 Reservation Confirmed! Your tickets are securely booked.', 'success');

    } catch (err: any) {
      setPaymentLoading(false);
      const errMsg = err.response?.data?.message || 'Payment processing failed. Please verify seat locks.';
      setError(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Upper header */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors uppercase font-mono tracking-wider cursor-pointer mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to seating grid</span>
        </button>

        {/* Dynamic Payment Progress Modals */}
        {successOverlay ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-emerald-500/35 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-lg mx-auto shadow-2xl shadow-emerald-950/25"
          >
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
              <CheckCircle className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-display font-bold text-2xl text-white">Tickets Confirmed!</h1>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your payment of <span className="text-emerald-400 font-bold">{formatCurrency(Number(finalInvoicedAmount))}</span> went through successfully.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-805/70 p-4 rounded-2xl w-full text-left text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Movie Title:</span>
                <span className="text-white font-medium">{movie.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Cinema Room:</span>
                <span className="text-white font-medium">{theatre.name} - {show.screen}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Hour:</span>
                <span className="text-white font-mono">{show.date} at {formatShowTime(show.time)}</span>
              </div>
              <div className="flex justify-between">
                <span>Booked Seats:</span>
                <span className="text-amber-500 font-bold uppercase font-mono">{seats.join(', ')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard?success=true')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold py-3.5 rounded-xl text-xs transition-transform shadow-lg shadow-amber-950/30 uppercase tracking-widest cursor-pointer"
              id="success-view-receipts-btn"
            >
              Examine QR Ticket Receipts
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            
            {/* Left Column: Form Credit Card input (3/5 width) */}
            <div className="md:col-span-3 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6 flex flex-col gap-6">
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2 border-b border-slate-850 pb-4">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span>Secure Checkout Merchant</span>
                </h2>

                {error && (
                  <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePay} className="flex flex-col gap-4">
                  {/* Cardholder Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Johnathan Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-display"
                      id="checkout-card-name"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">16-Digit Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19} // allows spaces
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => {
                        // basic card auto-spacing format
                        const val = e.target.value.replace(/\D/g, '');
                        const padded = val.match(/.{1,4}/g)?.join(' ') || val;
                        setCardNumber(padded);
                      }}
                      className="bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                      id="checkout-card-number"
                    />
                  </div>

                  {/* Expiry and CVV inline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Expiry Date</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) {
                            setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                          } else {
                            setCardExpiry(val);
                          }
                        }}
                        className="bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                        id="checkout-card-expiry"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">CVV Code</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
                        id="checkout-card-cvv"
                      />
                    </div>
                  </div>

                  {/* Payment Button */}
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold py-4 rounded-xl text-xs transition-colors shadow-lg shadow-amber-955/20 uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                    id="checkout-pay-btn"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                        <span>Securing Seat Tokens...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 stroke-[2.3]" />
                        <span>Confirm and Pay {formatCurrency(Number(finalInvoicedAmount))}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Secure statement */}
              <div className="flex items-center gap-2.5 px-4 text-slate-500 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Encrypted 256-bit payment node connection active. Your payment details are handled securely.</span>
              </div>
            </div>

            {/* Right Column: Invoice breakdowns (2/5 width) */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col gap-5">
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Reservation Ticket Invoice
                </h3>

                {/* Show Mini Detail */}
                <div className="flex items-start gap-3 border-b border-slate-805/45 pb-4">
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    referrerPolicy="no-referrer"
                    className="w-12 rounded-lg object-cover aspect-[3/4.2] shrink-0 border border-slate-800" 
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold line-clamp-1">{movie.title}</span>
                    <span className="text-[10px] text-slate-450 mt-1">{theatre.name}</span>
                    <span className="text-[10px] text-slate-505 font-mono mt-0.5">{show.screen} • {formatShowTime(show.time)}</span>
                  </div>
                </div>

                {/* Line lists */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Base Seat Allocations:</span>
                    <span className="text-white font-mono font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Booking processing fee</span>
                      <span className="text-[10px] text-slate-500 bg-slate-800 px-1 py-0.5 rounded">(${1.5} x{countTickets})</span>
                    </span>
                    <span className="text-white font-mono font-medium">{formatCurrency(bookingFee)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Sales tax & local surcharge (5%):</span>
                    <span className="text-white font-mono font-medium">{formatCurrency(gstTax)}</span>
                  </div>

                  <div className="border-t border-slate-805 pt-4 flex justify-between items-end">
                    <span className="text-white font-semibold font-display">Invoiced subtotal:</span>
                    <span className="text-2xl font-bold font-display text-amber-500 font-mono">{formatCurrency(Number(finalInvoicedAmount))}</span>
                  </div>
                </div>

                {/* Seat tags list */}
                <div className="mt-2 bg-slate-950 p-4 rounded-xl border border-slate-850/65 flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Allocated Seat Keys</span>
                  <div className="flex flex-wrap gap-1.5">
                    {seats.map((seat: string) => (
                      <span key={seat} className="text-xs text-amber-400 font-mono font-bold bg-amber-500/10 border border-amber-500/15 px-2 py-0.5 rounded uppercase">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default Checkout;
