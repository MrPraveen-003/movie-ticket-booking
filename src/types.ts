export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  poster: string;
  backdrop: string;
  description: string;
  rating: number; // e.g., 4.8
  duration: number; // in minutes
  releaseDate: string;
  language: string;
  active: boolean;
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  screens: string[];
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screen: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number; // Base price
  bookedSeats: string[]; // List of seat IDs booked for this show: e.g., 'A1', 'C4'
}

export interface Booking {
  id: string;
  userId: string;
  showId: string;
  seats: string[]; // e.g., ['A1', 'A2']
  totalPrice: number;
  bookingTime: string;
  paymentStatus: 'pending' | 'success' | 'cancelled';
  qrCode: string;
  showDetails: {
    movieTitle: string;
    moviePoster: string;
    theatreName: string;
    location: string;
    screen: string;
    date: string;
    time: string;
  };
}

// Seat Categories and layout configuration
export interface SeatLayout {
  rows: string[]; // ['A', 'B', 'C', 'D', 'E', 'F']
  cols: number; // 12
  categories: {
    rowStart: string;
    rowEnd: string;
    name: 'Normal' | 'Premium' | 'VIP';
    priceMultiplier: number;
  }[];
}
