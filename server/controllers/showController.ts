import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../../db';

export const getShows = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, date } = req.query;

    if (mongoose.connection.readyState === 1) {
      const Show = mongoose.model('Show');
      const query: any = {};
      if (movieId) query.movieId = movieId;
      if (date) query.date = date;

      const shows = await Show.find(query).sort({ time: 1 });
      res.json(shows);
    } else {
      let shows = db.getShows();
      if (movieId) {
        shows = shows.filter((s) => s.movieId === movieId);
      }
      if (date) {
        shows = shows.filter((s) => s.date === date);
      }
      res.json(shows);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to query shows list', error: err.message });
  }
};

export const getShowById = async (req: Request, res: Response): Promise<void> => {
  try {
    const show_id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const Show = mongoose.model('Show');
      const Movie = mongoose.model('Movie');
      const Theatre = mongoose.model('Theatre');

      const show = await Show.findById(show_id) as any;
      if (!show) {
        res.status(404).json({ message: 'Showtime not found' });
        return;
      }

      const movie = await Movie.findById(show.movieId);
      const theatre = await Theatre.findById(show.theatreId);

      res.json({
        show,
        movie,
        theatre
      });
    } else {
      const show = db.getShowById(show_id);
      if (!show) {
        res.status(404).json({ message: 'Showtime not found' });
        return;
      }

      const movie = db.getMovieById(show.movieId);
      const theatre = db.getTheatreById(show.theatreId);

      res.json({
        show,
        movie,
        theatre
      });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch detailed show seat configuration', error: err.message });
  }
};

export const createShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId, theatreId, screen, date, time, price } = req.body;
    if (!movieId || !theatreId || !screen || !date || !time || !price) {
      res.status(400).json({ message: 'Missing show properties (movieId, theatreId, screen, date, time, price)' });
      return;
    }

    if (mongoose.connection.readyState === 1) {
      const Show = mongoose.model('Show');
      
      const newShow = await Show.create({
        movieId,
        theatreId,
        screen,
        date,
        time,
        price: Number(price),
        bookedSeats: []
      });
      res.status(201).json(newShow);
    } else {
      const newShow = db.createShow({
        movieId,
        theatreId,
        screen,
        date,
        time,
        price: Number(price)
      });
      res.status(201).json(newShow);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to schedule showtime', error: err.message });
  }
};

export const deleteShow = async (req: Request, res: Response): Promise<void> => {
  try {
    const show_id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const Show = mongoose.model('Show');
      const show = await Show.findByIdAndDelete(show_id);
      if (!show) {
        res.status(404).json({ message: 'Showtime not found' });
        return;
      }
      res.json({ status: 'success', message: 'Showtime deleted successfully' });
    } else {
      db.deleteShow(show_id);
      res.json({ status: 'success', message: 'Showtime deleted successfully' });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete showtime', error: err.message });
  }
};
