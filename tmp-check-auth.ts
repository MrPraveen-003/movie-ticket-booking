import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import './server/models/User';

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log('URI present:', Boolean(uri));
  if (!uri) process.exit(1);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 10000 });
  const User = mongoose.model('User');
  const users = await User.find({ email: { $in: ['admin@moviebook.com', 'user@moviebook.com'] } }).lean();
  console.log('users', JSON.stringify(users, null, 2));
  for (const user of users) {
    console.log(user.email, 'hash', user.password, 'compare admin', bcryptjs.compareSync('admin123', user.password), 'compare user', bcryptjs.compareSync('user123', user.password));
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
