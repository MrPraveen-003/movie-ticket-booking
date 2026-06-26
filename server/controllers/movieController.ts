import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db } from '../../db';

export const getMovies = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const Movie = mongoose.model('Movie');
      const movies = await Movie.find().sort({ createdAt: -1 });
      res.json(movies);
    } else {
      const movies = db.getMovies();
      res.json(movies);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to retrieve movies', error: err.message });
  }
};

export const getMovieById = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie_id = req.params.id;
    const todayString = new Date().toISOString().split('T')[0];

    if (mongoose.connection.readyState === 1) {
      const Movie = mongoose.model('Movie');
      const Show = mongoose.model('Show');
      
      const movie = await Movie.findById(movie_id);
      if (!movie) {
        res.status(404).json({ message: 'Movie not found' });
        return;
      }

      // Query shows for this movie coming from today onwards
      const shows = await Show.find({ movieId: movie_id, date: { $gte: todayString } });
      res.json({ movie, shows });
    } else {
      const movie = db.getMovieById(movie_id);
      if (!movie) {
        res.status(404).json({ message: 'Movie not found' });
        return;
      }
      const shows = db.getShows().filter((s) => s.movieId === movie.id && s.date >= todayString);
      res.json({ movie, shows });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to retrieve movie details', error: err.message });
  }
};

export const createMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, poster, backdrop, description, rating, duration, releaseDate, language } = req.body;
    if (!title || !genre || !poster || !description || !duration || !releaseDate) {
      res.status(400).json({ message: 'Missing required movie configuration fields' });
      return;
    }

    const genresArray = Array.isArray(genre) ? genre : genre.split(',').map((g: string) => g.trim());

    if (mongoose.connection.readyState === 1) {
      const Movie = mongoose.model('Movie');
      const Show = mongoose.model('Show');
      const Theatre = mongoose.model('Theatre');

      const newMovie = await Movie.create({
        title,
        genre: genresArray,
        poster,
        backdrop: backdrop || poster,
        description,
        rating: Number(rating) || 5.0,
        duration: Number(duration),
        releaseDate,
        language: language || 'English',
        active: true
      }) as any;

      // Seeding shows for newly created movie in MongoDB if possible
      const theatres = await Theatre.find();
      const dates = [new Date().toISOString().split('T')[0]];
      const times = ['14:00', '20:30'];
      const showsToInsert: any[] = [];

      theatres.forEach((th: any) => {
        th.screens.forEach((sc: string) => {
          dates.forEach((dt) => {
            times.forEach((t) => {
              showsToInsert.push({
                movieId: newMovie._id.toString(),
                theatreId: th._id.toString(),
                screen: sc,
                date: dt,
                time: t,
                price: 15,
                bookedSeats: []
              });
            });
          });
        });
      });

      if (showsToInsert.length > 0) {
        await Show.insertMany(showsToInsert);
      }

      res.status(201).json(newMovie);
    } else {
      const newMovie = db.createMovie({
        title,
        genre: genresArray,
        poster,
        backdrop: backdrop || poster,
        description,
        rating: Number(rating) || 5.0,
        duration: Number(duration),
        releaseDate,
        language: language || 'English',
        active: true
      });
      res.status(201).json(newMovie);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to add film', error: err.message });
  }
};

export const updateMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie_id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const Movie = mongoose.model('Movie');
      const updatedMovie = await Movie.findByIdAndUpdate(movie_id, req.body, { new: true });
      if (!updatedMovie) {
        res.status(404).json({ message: 'Movie not found' });
        return;
      }
      res.json(updatedMovie);
    } else {
      const updatedMovie = db.updateMovie(movie_id, req.body);
      res.json(updatedMovie);
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update film', error: err.message });
  }
};

export const deleteMovie = async (req: Request, res: Response): Promise<void> => {
  try {
    const movie_id = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const Movie = mongoose.model('Movie');
      const Show = mongoose.model('Show');
      
      const movie = await Movie.findByIdAndDelete(movie_id);
      if (!movie) {
        res.status(404).json({ message: 'Movie not found' });
        return;
      }
      // Delete associated shows
      await Show.deleteMany({ movieId: movie_id });
      res.json({ status: 'success', message: 'Movie deleted successfully' });
    } else {
      db.deleteMovie(movie_id);
      res.json({ status: 'success', message: 'Movie deleted successfully' });
    }
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete film', error: err.message });
  }
};
