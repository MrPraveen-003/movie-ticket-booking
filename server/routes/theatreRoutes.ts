import { Router } from 'express';
import { getTheatres, createTheatre, updateTheatre, deleteTheatre } from '../controllers/theatreController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getTheatres);
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

export default router;
