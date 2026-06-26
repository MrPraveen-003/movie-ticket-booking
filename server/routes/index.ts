import { Router } from 'express';
import authRoutes from './authRoutes';
import movieRoutes from './movieRoutes';
import theatreRoutes from './theatreRoutes';
import showRoutes from './showRoutes';
import bookingRoutes from './bookingRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/theatres', theatreRoutes);
router.use('/shows', showRoutes);
router.use('/bookings', bookingRoutes);

export default router;
