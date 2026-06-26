import mongoose from 'mongoose';
import dns from 'dns';
import '../models/User';
import '../models/Movie';
import '../models/Theatre';
import '../models/Show';
import '../models/Booking';

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || uri.trim() === "" || uri.startsWith("YOUR_") || uri.includes("placeholder") || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    console.warn('\n=============================================================================');
    console.warn('⚠️  MONGODB_URI is not set, blank, or has invalid schema.');
    console.warn('🔌 Defaulting server to local embedded high-performance JSON-DB state engine.');
    console.warn('💡 To sync with MongoDB Atlas, set MONGODB_URI under environment secrets:');
    console.warn('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname');
    console.warn('=============================================================================\n');
    return false;
  }

  // Pre-emptively adjust DNS servers to bypass querySrv DNS resolution bugs (ECONNREFUSED)
  if (uri.startsWith('mongodb+srv://')) {
    try {
      const currentServers = dns.getServers();
      // Ensure we append or fallback onto standard high-performance public resolvers (Google / Cloudflare)
      dns.setServers(['8.8.8.8', '1.1.1.1', ...currentServers.filter(s => s !== '8.8.8.8' && s !== '1.1.1.1')]);
      console.log('🌐 [DNS Optimisation] Configured Google DNS (8.8.8.8) to resolve Atlas querySrv SRV records.');
    } catch (dnsError: any) {
      console.warn('⚠️  [DNS Optimisation] Could not adjust DNS servers:', dnsError.message);
    }
  }

  const maxRetries = 3;
  let attempt = 1;
  const retryDelayMs = 3000;

  mongoose.set('strictQuery', true);

  while (attempt <= maxRetries) {
    try {
      console.log(`🔌 [Mongoose] Connection attempt ${attempt}/${maxRetries} to MongoDB Atlas...`);
      // Bind optional connection timeout parameters for resilience
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000, 
        connectTimeoutMS: 10000,
      });

      console.log('=============================================================================');
      console.log('✅ DATABASE ONLINE: Successfully connected to remote MongoDB Atlas cluster.');
      console.log('=============================================================================');
      
      // Perform initial system collections seeding if necessary
      await seedDatabaseIfEmpty();
      await refreshMongoDBShowdates();
      return true;
    } catch (error: any) {
      console.error(`❌ [Mongoose] Attempt ${attempt} failed: ${error.message}`);
      
      // Diagnose common connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
        console.warn('🔍 DIAGNOSIS: ECONNREFUSED/querySrv signifies DNS lookup issues or blocked outgoing systems.');
        console.warn('👉 ACTION: Add your current IP address to the IP Access List in Atlas Security settings,');
        console.warn('   or try using the non-SRV standard driver URI format: mongodb://node1,node2/...');
      } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.warn('🔍 DIAGNOSIS: Invalid credentials.');
        console.warn('👉 ACTION: Review user credentials inside MONGODB_URI.');
      }

      if (attempt < maxRetries) {
        console.log(`🔄 Retrying database connection in ${retryDelayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
      attempt++;
    }
  }

  console.warn('\n=============================================================================');
  console.warn('🚨 FATAL: All 3 MongoDB Atlas connection attempts were exhausted.');
  console.warn('📱 Booting application utilizing highly resilient local embedded JSON-DB engine.');
  console.warn('🔄 Real-time data will write to /data/db.json instead of remote cluster.');
  console.warn('=============================================================================\n');
  return false;
};

// Seeding engine to make sure first-time MongoDB users get an immersive experience instantly
async function seedDatabaseIfEmpty() {
  try {
    const User = mongoose.model('User');
    const Movie = mongoose.model('Movie');
    const Theatre = mongoose.model('Theatre');
    const Show = mongoose.model('Show');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 MongoDB user collection empty. Seeding initial credential profiles...');
      const bcryptjs = await import('bcryptjs');
      
      const adminPass = bcryptjs.default.hashSync('admin123', 10);
      const userPass = bcryptjs.default.hashSync('user123', 10);

      await User.create([
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af001'),
          name: 'System Admin',
          email: 'admin@cinepass.com',
          password: adminPass,
          role: 'admin'
        },
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af002'),
          name: 'John Doe',
          email: 'user@cinepass.com',
          password: userPass,
          role: 'user'
        }
      ]);
    }

    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('🌱 MongoDB movies collection empty. Seeding cinema database...');
      const seededMovies = [
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af101'),
          title: 'Dune: Part Two',
          genre: ['Sci-Fi', 'Action', 'Adventure'],
          poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
          description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
          rating: 4.9,
          duration: 166,
          releaseDate: '2024-03-01',
          language: 'English',
          active: true
        },
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af102'),
          title: 'Oppenheimer',
          genre: ['Biography', 'Drama', 'History'],
          poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&auto=format&fit=crop&q=80',
          description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
          rating: 4.8,
          duration: 180,
          releaseDate: '2023-07-21',
          language: 'English',
          active: true
        },
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af103'),
          title: 'Interstellar',
          genre: ['Sci-Fi', 'Adventure', 'Drama'],
          poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
          backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop&q=80',
          description: 'Professor Brand works on plans to save mankind by transporting Earth\'s population to a new home via a wormhole.',
          rating: 4.9,
          duration: 169,
          releaseDate: '2014-11-07',
          language: 'English',
          active: true
        }
      ];
      await Movie.insertMany(seededMovies);
    }

    const theatreCount = await Theatre.countDocuments();
    if (theatreCount === 0) {
      console.log('🌱 MongoDB theatre collection empty. Seeding theatres list...');
      const seededTheatres = [
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af201'),
          name: 'IMAX Premiere Cinema',
          location: 'Metropolitan Square, Downtown',
          screens: ['Screen 1 (Laser)', 'Screen 2 (Dolby ATMOS)']
        },
        {
          _id: new mongoose.Types.ObjectId('653b6d2e67df14081c7af202'),
          name: 'Metropolis Multiplex',
          location: 'Grand Plaza Mall, Uptown',
          screens: ['Screen A', 'Screen B', 'Screen C']
        }
      ];
      await Theatre.insertMany(seededTheatres);
    }

    const showCount = await Show.countDocuments();
    if (showCount === 0) {
      console.log('🌱 MongoDB shows collection empty. Generating showtimes...');
      const movies = await Movie.find();
      const theatres = await Theatre.find();
      
      const datesList = (): string[] => {
        const dates: string[] = [];
        const start = new Date();
        for (let i = 0; i < 5; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
      };

      const dates = datesList();
      const times = ['10:45', '14:00', '17:15', '20:30', '23:15'];
      const basePrices = [12, 14, 18, 15, 13];

      const showsToInsert: any[] = [];
      movies.forEach((m: any) => {
        theatres.forEach((th: any) => {
          th.screens.forEach((sc: string, scIdx: number) => {
            dates.slice(0, 3).forEach((dt, dtIdx) => {
              const timeIdx = (scIdx + dtIdx) % times.length;
              showsToInsert.push({
                movieId: m._id.toString(),
                theatreId: th._id.toString(),
                screen: sc,
                date: dt,
                time: times[timeIdx],
                price: basePrices[timeIdx],
                bookedSeats: []
              });
            });
          });
        });
      });

      if (showsToInsert.length > 0) {
        await Show.insertMany(showsToInsert);
        console.log(`🌱 Seeded ${showsToInsert.length} dynamic showtimes successfully.`);
      }
    }
  } catch (error: any) {
    console.error('⚠️ Seeding MongoDB database failed:', error.message);
  }
}

async function refreshMongoDBShowdates() {
  try {
    const Show = mongoose.model('Show');
    const Booking = mongoose.model('Booking');
    const shows = (await Show.find({})) as any[];
    if (shows.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const hasPastShows = shows.some((s: any) => s.date < todayStr);

    if (hasPastShows) {
      console.log('🔄 [Mongoose] Stale showtime dates detected. Auto-shifting dates to keep listings active...');
      const datesInDb = [...new Set(shows.map((s: any) => s.date))].sort() as string[];
      if (datesInDb.length > 0) {
        const earliestDate = new Date(datesInDb[0]);
        const todayDate = new Date(todayStr);
        const diffTime = todayDate.getTime() - earliestDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          console.log(`⚙️ [Mongoose] Shifting MongoDB show dates forward by ${diffDays} days...`);
          // Shift each show date
          for (const show of shows) {
            const d = new Date(show.date);
            d.setDate(d.getDate() + diffDays);
            const newDateStr = d.toISOString().split('T')[0];
            await Show.findByIdAndUpdate(show._id, { date: newDateStr });
          }
          console.log('✅ [Mongoose] Successfully completed MongoDB show dates shift.');

          // Also shift booking dates
          const bookings = (await Booking.find({})) as any[];
          for (const booking of bookings) {
            let updated = false;
            const updateObj: any = {};
            if (booking.showDetails && booking.showDetails.date) {
              const d = new Date(booking.showDetails.date);
              d.setDate(d.getDate() + diffDays);
              updateObj['showDetails.date'] = d.toISOString().split('T')[0];
              updated = true;
            }
            if (updated) {
              await Booking.findByIdAndUpdate(booking._id, updateObj);
            }
          }
          console.log('✅ [Mongoose] Successfully completed MongoDB booking dates shift.');
        }
      }
    }
  } catch (error: any) {
    console.error('⚠️ [Auto-refresh] Failed auto-shifting MongoDB show dates:', error.message);
  }
}
