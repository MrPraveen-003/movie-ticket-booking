import mongoose, { Schema } from 'mongoose';

const showSchema = new Schema({
  movieId: {
    type: String,
    required: [true, 'Movie ID is required']
  },
  theatreId: {
    type: String,
    required: [true, 'Theatre ID is required']
  },
  screen: {
    type: String,
    required: [true, 'Screen name is required']
  },
  date: {
    type: String,
    required: [true, 'Show date is required'] // YYYY-MM-DD
  },
  time: {
    type: String,
    required: [true, 'Show time is required'] // HH:MM
  },
  price: {
    type: Number,
    required: [true, 'Base price is required']
  },
  bookedSeats: {
    type: [String],
    default: []
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

export const Show = mongoose.model('Show', showSchema);
export default Show;
