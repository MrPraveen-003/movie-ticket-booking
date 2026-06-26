import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Movie, Theatre, Show, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Film, MapPin, DollarSign, Users, Ticket, Trash2, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  // Data States
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States - Create Movie
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [moviePoster, setMoviePoster] = useState('');
  const [movieBackdrop, setMovieBackdrop] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieRating, setMovieRating] = useState('4.5');
  const [movieDur, setMovieDur] = useState('120');
  const [movieRelease, setMovieRelease] = useState('2026-06-01');
  const [movieLang, setMovieLang] = useState('English');
  const [movieMsg, setMovieMsg] = useState('');

  // Form States - Schedule Show
  const [scheduleMovieId, setScheduleMovieId] = useState('');
  const [scheduleTheatreId, setScheduleTheatreId] = useState('');
  const [scheduleScreen, setScheduleScreen] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [schedulePrice, setSchedulePrice] = useState('15');
  const [scheduleMsg, setScheduleMsg] = useState('');

  // Load Admin Metrics
  const loadAdminMetrics = async () => {
    try {
      setLoading(true);
      const moviesRes = await axios.get('/api/movies');
      setMovies(moviesRes.data);

      const theatresRes = await axios.get('/api/theatres');
      setTheatres(theatresRes.data);

      const showsRes = await axios.get('/api/shows');
      setShows(showsRes.data);

      // Fetch all bookings (requires admin privileges check on server)
      const bookingsRes = await axios.get('/api/bookings/all');
      setBookings(bookingsRes.data);

    } catch (err) {
      console.error('Failed loading administrative dashboard parameters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminMetrics();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-24 min-h-[80vh] flex flex-col justify-center items-center px-4">
        <p className="text-xl text-slate-350 font-display font-medium">Administrator privileges required.</p>
        <p className="text-xs text-slate-500 mt-2">Sign into an administrator level credential to examine dashboard statistics.</p>
      </div>
    );
  }

  // Statistics Computations
  const totalAudienceCount = bookings.reduce((accum, book) => accum + book.seats.length, 0);
  const totalEarningsInvoiced = bookings.reduce((accum, book) => accum + book.totalPrice, 0);
  const avgTicketUnitPrice = totalAudienceCount > 0 ? (totalEarningsInvoiced / totalAudienceCount).toFixed(2) : '0';

  // Add Film action
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle || !movieGenre || !moviePoster || !movieDesc || !movieDur) {
      setMovieMsg('Please fill in complete movie specification fields');
      return;
    }
    try {
      setMovieMsg('Publishing...');
      const response = await axios.post('/api/movies', {
        title: movieTitle,
        genre: movieGenre.split(',').map((g) => g.trim()),
        poster: moviePoster,
        backdrop: movieBackdrop || moviePoster,
        description: movieDesc,
        rating: parseFloat(movieRating) || 4.5,
        duration: parseInt(movieDur) || 120,
        releaseDate: movieRelease,
        language: movieLang
      });

      setMovieMsg('Film added successfully!');
      
      // Reset
      setMovieTitle('');
      setMovieGenre('');
      setMoviePoster('');
      setMovieBackdrop('');
      setMovieDesc('');
      
      // Reload listing
      loadAdminMetrics();
    } catch (err: any) {
      setMovieMsg(err.response?.data?.message || 'Error uploading film properties.');
    }
  };

  // Add Showtime slot action
  const handleAddShowTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleMovieId || !scheduleTheatreId || !scheduleScreen || !scheduleDate || !scheduleTime || !schedulePrice) {
      setScheduleMsg('Please fill in complete showtime properties.');
      return;
    }
    try {
      setScheduleMsg('Scheduling...');
      await axios.post('/api/shows', {
        movieId: scheduleMovieId,
        theatreId: scheduleTheatreId,
        screen: scheduleScreen,
        date: scheduleDate,
        time: scheduleTime,
        price: parseFloat(schedulePrice) || 15
      });

      setScheduleMsg('Show scheduled successfully!');
      setScheduleTime('');
      
      // Reload listing
      loadAdminMetrics();
    } catch (err: any) {
      setScheduleMsg(err.response?.data?.message || 'Error scheduling showtime.');
    }
  };

  // Delete Movie action
  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this movie? This will clear all scheduled showtimes for it.')) return;
    try {
      await axios.delete(`/api/movies/${id}`);
      loadAdminMetrics();
    } catch (err) {
      console.error('Failed to delete movie', err);
    }
  };

  // Delete Show action
  const handleDeleteShow = async (id: string) => {
    if (!confirm('Are you sure you want to unschedule this showtime?')) return;
    try {
      await axios.delete(`/api/shows/${id}`);
      loadAdminMetrics();
    } catch (err) {
      console.error('Failed to delete showtime', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/25 text-indigo-400 rounded-2xl">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-2xl text-white">Administrative Desk</h1>
              <p className="text-xs text-slate-400 mt-0.5">Control live film catalogs, schedule theater screen dates, and check sales indexes</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-450 bg-slate-900 border border-slate-805/70 px-4 py-2 rounded-xl font-mono">
            <span>Admin profile: </span>
            <span className="text-indigo-400 font-bold">{user.email}</span>
          </div>
        </div>

        {/* Analytic Metrics grids */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-indigo-505/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Box 1 */}
            <div className="bg-slate-905 border border-slate-805/80 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Revenue</span>
                <span className="text-2xl font-bold text-white font-mono mt-0.5">{formatCurrency(totalEarningsInvoiced)}</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Direct ticket checkouts</span>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-905 border border-slate-805/80 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-505 uppercase tracking-wider font-semibold">Tickets Booked</span>
                <span className="text-2xl font-bold text-white font-mono mt-0.5">{totalAudienceCount} Seats</span>
                <span className="text-[10px] text-slate-450 mt-0.5">Total transaction volume</span>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-905 border border-slate-805/80 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                <Film className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active Films</span>
                <span className="text-2xl font-bold text-white font-mono mt-0.5">{movies.length} Listed</span>
                <span className="text-[10px] text-slate-450 mt-0.5">In theater databases</span>
              </div>
            </div>

            {/* Box 4 */}
            <div className="bg-slate-905 border border-slate-805/80 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/25 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-505 uppercase tracking-wider font-semibold">Average order ticket value</span>
                <span className="text-2xl font-bold text-white font-mono mt-0.5">{formatCurrency(Number(avgTicketUnitPrice))}</span>
                <span className="text-[10px] text-slate-455 mt-0.5">Seat premium adjusted</span>
              </div>
            </div>

          </div>
        )}

        {/* Grid controllers split: Left Add controls, Right listings tables */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          {/* Form Editors Column (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Form 1: Add film */}
            <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 uppercase tracking-wide border-b border-slate-850 pb-3 mb-5">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Upload New Film Title</span>
              </h3>

              {movieMsg && (
                <div className="p-2.5 rounded-xl text-xs bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 mb-4 text-center font-medium">
                  {movieMsg}
                </div>
              )}

              <form onSubmit={handleAddMovie} className="space-y-4 text-xs">
                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Film Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inception: Part Three"
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                    id="admin-movie-title"
                  />
                </div>

                {/* Genre */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Genre categories (Comma classified)</label>
                  <input
                    type="text"
                    required
                    placeholder="Sci-Fi, Action, Thriller"
                    value={movieGenre}
                    onChange={(e) => setMovieGenre(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                    id="admin-movie-genre"
                  />
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Poster Image Link</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash..."
                      value={moviePoster}
                      onChange={(e) => setMoviePoster(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                      id="admin-movie-poster"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Backdrop Image Link</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash..."
                      value={movieBackdrop}
                      onChange={(e) => setMovieBackdrop(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                      id="admin-movie-backdrop"
                    />
                  </div>
                </div>

                {/* Desc */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Teaser Synopsis description</label>
                  <textarea
                    rows={2}
                    required
                    maxLength={350}
                    placeholder="Enter short storyline capsule..."
                    value={movieDesc}
                    onChange={(e) => setMovieDesc(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                    id="admin-movie-desc"
                  />
                </div>

                {/* Rating - Duration */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">IMDB Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={movieRating}
                      onChange={(e) => setMovieRating(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                      id="admin-movie-rating"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Duration (Min)</label>
                    <input
                      type="number"
                      value={movieDur}
                      onChange={(e) => setMovieDur(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                      id="admin-movie-duration"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Language</label>
                    <input
                      type="text"
                      value={movieLang}
                      onChange={(e) => setMovieLang(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                      id="admin-movie-language"
                    />
                  </div>
                </div>

                {/* Release date */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Teaser Release Date</label>
                  <input
                    type="date"
                    required
                    value={movieRelease}
                    onChange={(e) => setMovieRelease(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-indigo-505 focus:outline-none"
                    id="admin-movie-release"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 font-semibold p-3 text-slate-950 rounded-xl transition-all cursor-pointer shadow-md text-xs uppercase font-display"
                  id="admin-submit-movie"
                >
                  Confirm and Publish Movie
                </button>
              </form>
            </div>

            {/* Form 2: Schedule Show */}
            <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2 uppercase tracking-wide border-b border-slate-850 pb-3 mb-5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Create Showtime Slot</span>
              </h3>

              {scheduleMsg && (
                <div className="p-2.5 rounded-xl text-xs bg-emerald-600/15 border border-emerald-500/20 text-emerald-300 mb-4 text-center font-medium">
                  {scheduleMsg}
                </div>
              )}

              <form onSubmit={handleAddShowTime} className="space-y-4 text-xs">
                {/* Select Movie info */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Select Movie</label>
                  <select
                    required
                    value={scheduleMovieId}
                    onChange={(e) => setScheduleMovieId(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl focus:border-emerald-505 focus:outline-none text-xs cursor-pointer"
                    id="admin-schedule-movie-select"
                  >
                    <option value="">-- Choose film title --</option>
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                {/* Select Theatre */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Select Multiplex Theatre</label>
                  <select
                    required
                    value={scheduleTheatreId}
                    onChange={(e) => {
                      setScheduleTheatreId(e.target.value);
                      setScheduleScreen(''); // clear
                    }}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl focus:border-emerald-505 focus:outline-none text-xs cursor-pointer"
                    id="admin-schedule-theatre-select"
                  >
                    <option value="">-- Choose multiplex room --</option>
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Screen select */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Assigned Theater screen name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Screen A (Laser) or Dolby ATMOS Room"
                    value={scheduleScreen}
                    onChange={(e) => setScheduleScreen(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-emerald-505 focus:outline-none"
                    id="admin-schedule-screen"
                  />
                </div>

                {/* Date / Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Show Date</label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-emerald-505 focus:outline-none"
                      id="admin-schedule-date"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 font-semibold uppercase">Show Time (HH:MM)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 17:45"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-emerald-505 focus:outline-none"
                      id="admin-schedule-time"
                    />
                  </div>
                </div>

                {/* Base price */}
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold uppercase">Base Standard Ticket Price ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={schedulePrice}
                    onChange={(e) => setSchedulePrice(e.target.value)}
                    className="bg-slate-950 border border-slate-805 text-white p-2.5 rounded-xl text-xs focus:border-emerald-555 focus:outline-none"
                    id="admin-schedule-price"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 font-semibold p-3 text-slate-950 rounded-xl transition-all cursor-pointer shadow-md text-xs uppercase font-display"
                  id="admin-submit-show"
                >
                  Add Showtime Hour
                </button>
              </form>
            </div>

          </div>

          {/* Catalog Lists Tables (3/5) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Active Movies catalog */}
            <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wide border-b border-slate-850 pb-3 mb-5">
                Manage Listed Movies
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-350">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Film Title</th>
                      <th className="px-4 py-3 font-semibold">Genre</th>
                      <th className="px-4 py-3 font-semibold">Stats</th>
                      <th className="px-4 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {movies.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-850/30">
                        <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                          <img 
                            src={m.poster} 
                            alt={m.title} 
                            referrerPolicy="no-referrer"
                            className="w-6 h-8 rounded object-cover border border-slate-800 shrink-0" 
                          />
                          <span className="line-clamp-1">{m.title}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {m.genre.slice(0, 2).map((g) => (
                              <span key={g} className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                {g}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                          {m.duration}m • ☆{m.rating}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteMovie(m.id)}
                            className="p-1.5 text-red-400 hover:bg-slate-800 hover:text-red-300 roundedtransition-colors cursor-pointer"
                            title="Delete Film"
                            id={`delete-movie-btn-${m.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Listed showtimes scheduling lists */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-sm text-white uppercase tracking-wide border-b border-slate-855 pb-3 mb-5 flex items-center justify-between">
                <span>Active Scheduled Showtime Slots</span>
                <span className="text-[10px] font-mono text-slate-500 lowercase bg-slate-950 px-2.5 py-0.5 rounded border border-slate-805">
                  count: {shows.length}
                </span>
              </h3>

              <div className="overflow-y-auto max-h-[460px] scrollbar-thin">
                <table className="w-full text-xs text-left text-slate-350">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Film / Date</th>
                      <th className="px-4 py-3 font-semibold">Location</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {shows.slice().reverse().map((show) => {
                      const movieObj = movies.find((mov) => mov.id === show.movieId);
                      const theatreObj = theatres.find((the) => the.id === show.theatreId);

                      return (
                        <tr key={show.id} className="hover:bg-slate-850/30">
                          <td className="px-4 py-3 flex flex-col gap-0.5">
                            <span className="text-white font-medium">{movieObj?.title || 'Unknown Title'}</span>
                            <span className="text-[10px] text-slate-450 font-mono">{show.date} • {show.time}</span>
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <div className="flex flex-col">
                              <span>{theatreObj?.name || 'Multiplex'}</span>
                              <span className="text-[10px] text-slate-500">{show.screen}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-300 font-bold">
                            ${show.price}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteShow(show.id)}
                              className="p-1.5 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded transition-colors cursor-pointer"
                              title="Delete Showtime hour"
                              id={`delete-show-btn-${show.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
