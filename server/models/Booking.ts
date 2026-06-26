import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  showId: {
    type: String,
    required: [true, 'Show ID is required']
  },
  seats: {
    type: [String],
    required: [true, 'At least one seat is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  bookingTime: {
    type: String,
    required: [true, 'Booking time is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'cancelled'],
    default: 'success'
  },
  qrCode: {
    type: String,
    required: [true, 'QR Code source is required']
  },
  showDetails: {
    movieTitle: { type: String, required: true },
    moviePoster: { type: String, required: true },
    theatreName: { type: String, required: true },
    location: { type: String, required: true },
    screen: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = (ret as any)._id?.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = (ret as any)._id?.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
