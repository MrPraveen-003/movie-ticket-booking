import { Router } from 'express';
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/movieController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.post('/', protect, adminOnly, createMovie);
router.patch('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

export default router;
