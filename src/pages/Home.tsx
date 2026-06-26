import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Movie } from '../types';
import { Search, Star, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('/api/movies');
        setMovies(response.data);
      } catch (err) {
        console.error('Failed loading catalog movies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const genres = ['All', 'Sci-Fi', 'Action', 'Adventure', 'Drama', 'Biography', 'Thriller', 'Romance'];

  // Filter logic
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase()) || 
                          movie.description.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Spotlight movie (highest rated)
  const spotlightMovie = movies.length > 0 ? [...movies].sort((a,b) => b.rating - a.rating)[0] : null;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      {/* Hero Banner Section */}
      {spotlightMovie && (
        <div className="relative w-full h-[60vh] sm:h-[70vh] flex items-end overflow-hidden mb-8">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img 
              src={spotlightMovie.backdrop} 
              alt={spotlightMovie.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top opacity-30 sm:opacity-40"
            />
            {/* Ambient vignette blends */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950/30" />
          </div>

          <div className="relative max-w-7xl mx-auto w-full px-6 pb-8 sm:pb-12 md:pb-16 flex flex-col items-start gap-4 z-10">
            <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPOTLIGHT PREMIERE</span>
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none drop-shadow">
              {spotlightMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-350">
              <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                {spotlightMovie.rating.toFixed(1)} Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {spotlightMovie.duration} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {spotlightMovie.releaseDate}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-xs">
                {spotlightMovie.language}
              </span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl line-clamp-3 leading-relaxed drop-shadow-sm">
              {spotlightMovie.description}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/movie/${spotlightMovie.id}`)}
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center gap-2"
              id="hero-book-tickets-btn"
            >
              <span>Book Tickets Now</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Main Content Catalog */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-10 bg-red-650 bg-red-600 block rounded-full"></span>
            <div>
              <h2 className="font-display font-semibold text-2xl text-white tracking-wide uppercase">Now Showing</h2>
              <p className="text-xs text-slate-400 mt-0.5">Book ticket showtimes at your favorite local theaters instantly</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
            <input
              type="text"
              placeholder="Search movies by title, description or genre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-amber-500/55 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
              id="home-movie-search-input"
            />
          </div>
        </div>

        {/* Genres Pill Bar */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedGenre === genre
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-950/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              id={`genre-pill-${genre.toLowerCase()}`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-sm font-mono text-slate-405">Recasting cinematics...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="text-lg font-display text-slate-350">No movies found matching your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search parameter or exploring another genre category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <motion.div
                key={movie.id}
                whileHover={{ y: -6 }}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-xl transition-all hover:shadow-2xl hover:shadow-amber-950/10 cursor-pointer"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                {/* Poster container */}
                <div className="relative aspect-[3/4.2] overflow-hidden bg-slate-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Backdrop shading Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-80" />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 border border-amber-500/30 text-amber-500 font-bold text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-display font-semibold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.slice(0, 3).map((g) => (
                        <span key={g} className="text-[10px] font-semibold tracking-wider text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-805/40 pt-3">
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {movie.duration} mins
                    </span>

                    <button 
                      className="text-xs font-semibold text-amber-500 group-hover:text-amber-400 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/25 transition-all"
                      id={`book-${movie.id}`}
                    >
                      Book Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;
