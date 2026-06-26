import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = (ret as any)._id?.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password; // Do not leak secrets
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = (ret as any)._id?.toString();
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).password;
      return ret;
    }
  }
});

export const User = mongoose.model('User', userSchema);
export default User;
