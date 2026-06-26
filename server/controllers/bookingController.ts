import { Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required to book tickets' });
      return;
    }

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      res.status(400).json({ message: 'Showtime details and seat listings are required to build a booking' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const Show = mongoose.model('Show');
      const Movie = mongoose.model('Movie');
      const Theatre = mongoose.model('Theatre');
      const Booking = mongoose.model('Booking');

      // Fetch showtime
      const show = await Show.findById(showId) as any;
      if (!show) {
        res.status(404).json({ message: 'Showtime not found' });
        return;
      }

      // Check seat availability
      const alreadyBooked = seats.some((seat) => show.bookedSeats.includes(seat));
      if (alreadyBooked) {
        res.status(400).json({ message: 'One or more of the selected seats are already booked.' });
        return;
      }

      // Fetch Movie and Theatre
      const movie = await Movie.findById(show.movieId) as any;
      const theatre = await Theatre.findById(show.theatreId) as any;
      if (!movie || !theatre) {
        res.status(404).json({ message: 'Associated Movie or Theatre details not found' });
        return;
      }

      // Compute total booking price
      let calculatedTotal = 0;
      seats.forEach((seatCode) => {
        const row = seatCode.charAt(0);
        let multiplier = 1.0;
        if (['A', 'B'].includes(row)) {
          multiplier = 1.5; // Premium rows
        } else if (['E', 'F'].includes(row)) {
          multiplier = 2.0; // VIP rows
        }
        calculatedTotal += Math.round(show.price * multiplier);
      });

      // Update booked seats on Show document
      show.bookedSeats.push(...seats);
      await show.save();

      const bookingId = `book-${Date.now()}`;
      const qrPayload = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0f172a&data=CINEPASS-${bookingId}-SHOW-${showId}-SEATS-${seats.join(',')}`;

      const newBooking = await Booking.create({
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
      });

      res.status(201).json(newBooking);
    } else {
      // Local fallbacks
      const booking = db.createBooking(userId, showId, seats);
      res.status(201).json(booking);
    }
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to complete booking transaction' });
  }
};

export const getMyBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Invalid account session' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const Booking = mongoose.model('Booking');
      const bookings = await Booking.find({ userId }).sort({ bookingTime: -1 });
      res.json(bookings);
    } else {
      const bookings = db.getBookingsByUser(userId);
      res.json(bookings);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to retrieve user ticket records', error: err.message });
  }
};

export const getAllBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const Booking = mongoose.model('Booking');
      const bookings = await Booking.find().sort({ bookingTime: -1 });
      res.json(bookings);
    } else {
      const bookings = db.getBookings().sort((a, b) => b.bookingTime.localeCompare(a.bookingTime));
      res.json(bookings);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to query global bookings list', error: err.message });
  }
};
