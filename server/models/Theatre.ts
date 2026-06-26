import mongoose, { Schema } from 'mongoose';

const theatreSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Theatre name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Theatre location is required'],
    trim: true
  },
  screens: {
    type: [String],
    required: [true, 'Screens list is required'],
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

export const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;
