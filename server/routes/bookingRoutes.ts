import { Router } from 'express';
import { createBooking, getMyBookings, getAllBookings } from '../controllers/bookingController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/all', protect, adminOnly, getAllBookings);

export default router;
