import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Movie, Show, Theatre } from '../types';
import { Star, Clock, Calendar, Globe, MapPin, Film, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        // Fetch movie & its shows
        const movieDetailsRes = await axios.get(`/api/movies/${id}`);
        setMovie(movieDetailsRes.data.movie);
        setShows(movieDetailsRes.data.shows);

        // Fetch all theatres to resolve names/locations
        const theatresRes = await axios.get('/api/theatres');
        setTheatres(theatresRes.data);

        // Resolve unique dates in our shows
        const datesSet = new Set(movieDetailsRes.data.shows.map((s: Show) => s.date));
        const datesSorted = Array.from(datesSet).sort() as string[];
        setUniqueDates(datesSorted);

        if (datesSorted.length > 0) {
          setSelectedDate(datesSorted[0]);
        }
      } catch (err) {
        console.error('Failed loading movie details & timeslots', err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading showtimes and cinema sheets...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-24">
        <p className="text-xl text-slate-300">The requested film details could not be found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-amber-500 hover:underline">
          Return to home catalog
        </button>
      </div>
    );
  }

  // Find theatres showing movies on the selectedDate
  const showsOnSelectedDate = shows.filter((s) => s.date === selectedDate);
  const theatreIds = Array.from(new Set(showsOnSelectedDate.map((s) => s.theatreId)));
  const listOfTheatres = theatres.filter((t) => theatreIds.includes(t.id));

  // Helper to format show date
  const formatHeaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Upper Backdrop Banner */}
      <div className="relative w-full h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={movie.backdrop} 
            alt={movie.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top opacity-20 sm:opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />
        </div>

        {/* Cinematic Card Info */}
        <div className="relative max-w-7xl mx-auto w-full px-6 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 z-10">
          {/* Main Poster */}
          <div className="w-44 sm:w-52 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 shadow-indigo-950/20 shrink-0 transform md:-translate-y-6">
            <img 
              src={movie.poster} 
              alt={movie.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {movie.genre.map((g) => (
                <span key={g} className="text-xs bg-slate-850/80 text-amber-400 border border-amber-500/10 px-3 py-1 rounded-full font-medium">
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-md">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                {movie.rating.toFixed(1)} IMDB
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {movie.duration} minutes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {movie.language}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Released: {movie.releaseDate}
              </span>
            </div>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      {/* Showtime Select Floor Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Select Showtime Dates & Theatres Grid */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div>
            <h2 className="font-display font-semibold text-xl text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              <span>Select Date & Showtimes</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Select your preferred date, theater, and time slot to begin seat booking</p>
          </div>

          {/* Date Slider Horizontal Bar */}
          {uniqueDates.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-805 rounded-2xl text-slate-470">
              <span>There are no scheduled showtimes available for this title in the near future.</span>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border min-w-[76px] transition-all cursor-pointer ${
                    selectedDate === date
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-950/20 font-bold scale-[1.03]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 font-medium'
                  }`}
                  id={`date-time-slot-${date}`}
                >
                  <span className="text-[10px] uppercase opacity-75">{new Date(date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg leading-tight my-0.5">{new Date(date).getDate()}</span>
                  <span className="text-[10px] uppercase opacity-75">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </button>
              ))}
            </div>
          )}

          {/* Consolidated Showtimes grouped inside Theaters */}
          {selectedDate && listOfTheatres.length === 0 ? (
            <div className="p-10 text-center bg-slate-905/30 border border-slate-800 rounded-2xl text-slate-500">
              <span>No theater showtimes available on this specific day.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {listOfTheatres.map((theatre) => {
                // Find shows for this theater on this date
                const showsInTheatre = showsOnSelectedDate.filter((s) => s.theatreId === theatre.id);
                
                return (
                  <div key={theatre.id} className="bg-slate-900/60 border border-slate-805/85 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors hover:bg-slate-900">
                    {/* Theater Metadata */}
                    <div className="flex items-start gap-3.5 group">
                      <div className="p-3 rounded-xl bg-slate-800 border border-slate-750 text-slate-300 mt-0.5 shrink-0">
                        <MapPin className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display font-semibold text-lg text-white group-hover:text-amber-500 transition-colors">
                          {theatre.name}
                        </span>
                        <span className="text-xs text-slate-450 flex items-center gap-1.5 mt-0.5">
                          {theatre.location}
                        </span>
                      </div>
                    </div>

                    {/* Showtimes slots list */}
                    <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                      {showsInTheatre.map((show) => (
                        <motion.button
                          key={show.id}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => navigate(`/show/${show.id}`)}
                          className="bg-slate-950 border border-slate-800/85 hover:border-amber-500/50 hover:bg-slate-900 px-4 py-2 rounded-xl text-center cursor-pointer transition-all flex flex-col justify-center min-w-[90px]"
                          id={`hour-${show.id}`}
                        >
                          <span className="text-sm font-semibold text-amber-400 font-mono tracking-tight">{show.time}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5 font-sans">${show.price} Base</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Seat Guidelines & Special Rules box */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-display font-semibold text-md text-white border-b border-slate-800 pb-3">
              Booking Policy Notice
            </h3>
            
            <ul className="text-xs text-slate-400 space-y-3.5 leading-relaxed list-disc list-inside">
              <li>Tickets are strictly non-refundable and showtimes cannot be swapped within 4 hours of film scheduling.</li>
              <li>Base seat pricing applies to Standard lower decks. Upper deck tickets receive multipliers (Premium: x1.5, VIP: x2.0).</li>
              <li>Ensure you have configured a profile email to receive dynamic notification logs and receipts upon bookings.</li>
              <li>For any issues, request assistant ticket overrides at our physical customer kiosks using Booking IDs.</li>
            </ul>

            <div className="bg-slate-950 border border-slate-850/60 p-4 rounded-xl mt-2">
              <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 animate-pulse" />
                <span>Dual Dynamic Pricing active</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Multiplex rates update slightly on peak operational hours (slots after 17:00).</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default MovieDetails;
