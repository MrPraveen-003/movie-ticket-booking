import mongoose, { Schema } from 'mongoose';

const movieSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true
  },
  genre: {
    type: [String],
    required: [true, 'At least one genre is required'],
    default: []
  },
  poster: {
    type: String,
    required: [true, 'Poster image URL is required']
  },
  backdrop: {
    type: String,
    required: [true, 'Backdrop image URL is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  duration: {
    type: Number,
    required: [true, 'Duration in minutes is required']
  },
  releaseDate: {
    type: String,
    required: [true, 'Release date (YYYY-MM-DD) is required']
  },
  language: {
    type: String,
    default: 'English'
  },
  active: {
    type: Boolean,
    default: true
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

export const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
