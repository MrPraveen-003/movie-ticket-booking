import { Router } from 'express';
import { getShows, getShowById, createShow, deleteShow } from '../controllers/showController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', protect, adminOnly, createShow);
router.delete('/:id', protect, adminOnly, deleteShow);

export default router;
