import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes/index';
import { createServer as createViteServer } from 'vite';

// Load environment configurations
dotenv.config();

export async function bootstrap() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect to database (MongoDB Atlas or Fallback seamlessly)
  const isMongoConnected = await connectDB();
  
  if (isMongoConnected) {
    console.log('🔮 RUNNING MODE: Active Cloud Database (MongoDB Atlas + Mongoose)');
  } else {
    console.log('💾 RUNNING MODE: Active Embedded Local Database (Seeded JSON-DB Engine)');
  }

  // Register all modular backend API routes
  app.use('/api', apiRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      database: isMongoConnected ? 'mongodb_atlas' : 'local_json_db',
      time: new Date().toISOString()
    });
  });

  // Hot Module Replacement & static client assets route binding
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🎬 CinePass Film Booking Platform is online!`);
    console.log(`Server Address: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}
