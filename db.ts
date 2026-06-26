import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { User, Movie, Theatre, Show, Booking } from './src/types';

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  bookings: Booking[];
  credentials: Record<string, string>; // userId -> hashedPassword
}

// Seed Data
const defaultMovies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Dune: Part Two',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    rating: 4.9,
    duration: 166,
    releaseDate: '2024-03-01',
    language: 'English',
    active: true
  },
  {
    id: 'movie-2',
    title: 'Oppenheimer',
    genre: ['Biography', 'Drama', 'History'],
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&auto=format&fit=crop&q=80',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, showing the historic scientific breakthrough and the intense political battles that followed.',
    rating: 4.8,
    duration: 180,
    releaseDate: '2023-07-21',
    language: 'English',
    active: true
  },
  {
    id: 'movie-3',
    title: 'Interstellar',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
    description: 'In Earth\'s future, a global crop blight and second Dust Bowl are slowly rendering the planet uninhabitable. Professor Brand, a brilliant NASA physicist, is working on plans to save mankind by transporting Earth\'s population to a new home via a wormhole.',
    rating: 4.9,
    duration: 169,
    releaseDate: '2014-11-07',
    language: 'English',
    active: true
  },
  {
    id: 'movie-4',
    title: 'Cyber City: 2099',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    poster: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
    description: 'In a dystopian neon-soaked future metropolis, a rogue biological synthetic agent uncovers a corporate conspiracy threatening the cybernetic minds of the global population, sparking a revolution.',
    rating: 4.5,
    duration: 134,
    releaseDate: '2025-11-12',
    language: 'English',
    active: true
  },
  {
    id: 'movie-5',
    title: 'Midnight Romance',
    genre: ['Romance', 'Drama', 'Comedy'],
    poster: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80',
    description: 'Two strangers meet on a cross-country train ride and decide to spend a single night together in a beautiful historic European city, finding romance, companionship, and paths of transformation.',
    rating: 4.4,
    duration: 112,
    releaseDate: '2025-02-14',
    language: 'French / English',
    active: true
  },
  {
    id: 'movie-6',
    title: 'The Silent Mirage',
    genre: ['Mystery', 'Thriller'],
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1434064511983-18c6dae20ed5?w=1600&auto=format&fit=crop&q=80',
    description: 'When a renowned detective agrees to investigate a cold family case in a remote desert retreat, she realizes that the secrets of the sands are deeper, darker, and more dangerous than she ever anticipated.',
    rating: 4.6,
    duration: 125,
    releaseDate: '2026-05-10',
    language: 'Spanish',
    active: true
  }
];

const defaultTheatres: Theatre[] = [
  {
    id: 'theatre-1',
    name: 'IMAX Premiere Cinema',
    location: 'Metropolitan Square, Downtown',
    screens: ['Screen 1 (Laser)', 'Screen 2 (Dolby ATMOS)']
  },
  {
    id: 'theatre-2',
    name: 'Metropolis Multiplex',
    location: 'Grand Plaza Mall, Uptown',
    screens: ['Screen A', 'Screen B', 'Screen C']
  },
  {
    id: 'theatre-3',
    name: 'Starlight Luxury Suite',
    location: 'Sunset Boulevard, Westside',
    screens: ['Starlight Lounge', 'Royal Screen']
  }
];

// Helper to generate dynamic dates
const getDatesList = (): string[] => {
  const dates: string[] = [];
  const start = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const generateDynamicShows = (movies: Movie[], theatres: Theatre[]): Show[] => {
  const shows: Show[] = [];
  const dates = getDatesList();
  const times = ['10:45', '14:00', '17:15', '20:30', '23:15'];
  const basePrices = [12, 14, 18, 15, 13]; // dynamic pricing based on time

  let showIdCounter = 1;

  movies.forEach((movie) => {
    theatres.forEach((theatre) => {
      // Pick 2 screens
      theatre.screens.forEach((screen, screenIndex) => {
        // Pick 3 random dates
        dates.slice(0, 3).forEach((date, dateIndex) => {
          // Provide 2 showtimes per date
          const timeIndices = [(screenIndex + dateIndex) % times.length, (screenIndex + dateIndex + 2) % times.length];
          timeIndices.forEach((timeIndex) => {
            shows.push({
              id: `show-${showIdCounter++}`,
              movieId: movie.id,
              theatreId: theatre.id,
              screen: screen,
              date: date,
              time: times[timeIndex],
              price: basePrices[timeIndex],
              bookedSeats: []
            });
          });
        });
      });
    });
  });

  return shows;
};

// Seed class
class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Make sure it matches our structure
        if (parsed.users && parsed.movies && parsed.theatres && parsed.shows) {
          // If there are stale showtime dates, auto-refresh/shift them to ensure there are always active bookings starting today
          const todayStr = new Date().toISOString().split('T')[0];
          const hasPastShows = parsed.shows.some((s: any) => s.date < todayStr);
          if (hasPastShows) {
            console.log('🔄 [JSONDB] Stale showtime dates detected. Auto-shifting dates to keep listings active...');
            // Find the minimum/earliest date present in existing shows
            const datesInDb = [...new Set(parsed.shows.map((s: any) => s.date))].sort() as string[];
            if (datesInDb.length > 0) {
              const earliestDate = new Date(datesInDb[0]);
              const todayDate = new Date(todayStr);
              const diffTime = todayDate.getTime() - earliestDate.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays > 0) {
                // Shift all show dates forward by diffDays
                parsed.shows = parsed.shows.map((s: any) => {
                  const d = new Date(s.date);
                  d.setDate(d.getDate() + diffDays);
                  return { ...s, date: d.toISOString().split('T')[0] };
                });
                console.log(`✅ [JSONDB] Successfully shifted showtimes forward by ${diffDays} days.`);

                // Also shift corresponding booking dates to keep histories consistent
                if (parsed.bookings && Array.isArray(parsed.bookings)) {
                  parsed.bookings = parsed.bookings.map((b: any) => {
                    if (b.showDetails && b.showDetails.date) {
                      const d = new Date(b.showDetails.date);
                      d.setDate(d.getDate() + diffDays);
                      b.showDetails.date = d.toISOString().split('T')[0];
                    }
                    return b;
                  });
                }

                // Save back the updated database with normalized show dates
                fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
              }
            }
          }
          return parsed;
        }
      } catch (err) {
        console.error('Error loading DB file, re-initializing database', err);
      }
    }

    // Default Initialization
    const adminId = 'user-admin';
    const userId = 'user-customer';
    
    const adminUser: User = {
      id: adminId,
      name: 'System Admin',
      email: 'admin@cinepass.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    const regularUser: User = {
      id: userId,
      name: 'John Doe',
      email: 'user@cinepass.com',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const credentials: Record<string, string> = {
      [adminId]: bcryptjs.hashSync('admin123', 10),
      [userId]: bcryptjs.hashSync('user123', 10)
    };

    const shows = generateDynamicShows(defaultMovies, defaultTheatres);

    const initialDb: DatabaseSchema = {
      users: [adminUser, regularUser],
      movies: defaultMovies,
      theatres: defaultTheatres,
      shows: shows,
      bookings: [],
      credentials
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  private save(): void {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Users Auth Methods
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getPasswordHash(userId: string): string | undefined {
    return this.data.credentials[userId];
  }

  public createUser(name: string, email: string, passwordPlain: string, role: 'user' | 'admin' = 'user'): User {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      name,
      email: email.toLowerCase(),
      role,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.data.credentials[id] = bcryptjs.hashSync(passwordPlain, 10);
    this.save();
    return newUser;
  }

  // Movie Methods
  public getMovies(): Movie[] {
    return this.data.movies;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.data.movies.find((m) => m.id === id);
  }

  public createMovie(movie: Omit<Movie, 'id'>): Movie {
    const id = `movie-${Date.now()}`;
    const newMovie: Movie = { ...movie, id };
    this.data.movies.unshift(newMovie); // Add new movies to the top of the list!
    
    // Auto-generate some shows for the new movie
    const newShows = generateDynamicShows([newMovie], this.data.theatres);
    this.data.shows.push(...newShows);

    this.save();
    return newMovie;
  }

  public updateMovie(id: string, movieUpdate: Partial<Movie>): Movie {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Movie not found');
    this.data.movies[idx] = { ...this.data.movies[idx], ...movieUpdate };
    this.save();
    return this.data.movies[idx];
  }

  public deleteMovie(id: string): void {
    this.data.movies = this.data.movies.filter((m) => m.id !== id);
    this.data.shows = this.data.shows.filter((s) => s.movieId !== id);
    this.save();
  }

  // Theatres Methods
  public getTheatres(): Theatre[] {
    return this.data.theatres;
  }

  public getTheatreById(id: string): Theatre | undefined {
    return this.data.theatres.find((t) => t.id === id);
  }

  public createTheatre(theatre: Omit<Theatre, 'id'>): Theatre {
    const id = `theatre-${Date.now()}`;
    const newTheatre: Theatre = { ...theatre, id };
    this.data.theatres.push(newTheatre);
    this.save();
    return newTheatre;
  }

  public updateTheatre(id: string, theatreUpdate: Partial<Theatre>): Theatre {
    const idx = this.data.theatres.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Theatre not found');
    this.data.theatres[idx] = { ...this.data.theatres[idx], ...theatreUpdate };
    this.save();
    return this.data.theatres[idx];
  }

  public deleteTheatre(id: string): void {
    this.data.theatres = this.data.theatres.filter((t) => t.id !== id);
    this.data.shows = this.data.shows.filter((s) => s.theatreId !== id);
    this.save();
  }

  // Shows Methods
  public getShows(): Show[] {
    return this.data.shows;
  }

  public getShowById(id: string): Show | undefined {
    return this.data.shows.find((s) => s.id === id);
  }

  public createShow(show: Omit<Show, 'id' | 'bookedSeats'> & { id?: string }): Show {
    const id = show.id || `show-${Date.now()}`;
    const newShow: Show = {
      ...show,
      id,
      bookedSeats: []
    };
    this.data.shows.push(newShow);
    this.save();
    return newShow;
  }

  public deleteShow(id: string): void {
    this.data.shows = this.data.shows.filter((s) => s.id !== id);
    this.save();
  }

  // Bookings Methods
  public getBookings(): Booking[] {
    return this.data.bookings;
  }

  public getBookingsByUser(userId: string): Booking[] {
    return this.data.bookings.filter((b) => b.userId === userId).sort((a,b) => b.bookingTime.localeCompare(a.bookingTime));
  }

  public createBooking(userId: string, showId: string, seats: string[]): Booking {
    const show = this.getShowById(showId);
    if (!show) throw new Error('Showtime not found');

    const movie = this.getMovieById(show.movieId);
    const theatre = this.getTheatreById(show.theatreId);
    if (!movie || !theatre) throw new Error('Associated Movie or Theatre details not found');

    // Check availability
    const alreadyBooked = seats.some((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked) {
      throw new Error('One or more of the selected seats are already booked.');
    }

    // Determine multipliers if any (Row A, B or VIP price computation logic)
    // Seats standard price multiplication (for A, B premium VIP etc.):
    let calculatedTotal = 0;
    seats.forEach((seatCode) => {
      const row = seatCode.charAt(0);
      let multiplier = 1.0;
      if (['A', 'B'].includes(row)) {
        multiplier = 1.5; // Premium rows
      } else if (['E', 'F'].includes(row)) {
        multiplier = 2.0; // VIP lounge rows
      }
      calculatedTotal += Math.round(show.price * multiplier);
    });

    // Update booked seats on Show
    show.bookedSeats.push(...seats);

    const bookingId = `book-${Date.now()}`;
    
    // QR Code visual payload representation
    // To generate dynamic QR Code images easily without third party canvases crashing, 
    // we use premium mock data strings or standard APIs which represent the payload beautifully!
    const qrPayload = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=CINEPASS-${bookingId}-SHOW-${showId}-SEATS-${seats.join(',')}`;

    const newBooking: Booking = {
      id: bookingId,
      userId,
      showId,
      seats,
      totalPrice: calculatedTotal,
      bookingTime: new Date().toISOString(),
      paymentStatus: 'success',
      qrCode: qrPayload,
      showDetails: {
        movieTitle: movie.title,
        moviePoster: movie.poster,
        theatreName: theatre.name,
        location: theatre.location,
        screen: show.screen,
        date: show.date,
        time: show.time
      }
    };

    this.data.bookings.push(newBooking);
    this.save();
    return newBooking;
  }
}

export const db = new JSONDatabase();
export default db;
