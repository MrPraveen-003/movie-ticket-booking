import path from 'path';
import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './config/db';
import apiRoutes from './routes/index';

dotenv.config();

export async function bootstrap() {
  const app = express();
  let port = Number(process.env.PORT) || 3000;

  const startListening = () => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log('\n======================================================');
      console.log('🎬 Movie Ticket Booking Platform is online!');
      console.log(`Server Address: http://localhost:${port}`);
      console.log('======================================================\n');
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        port += 1;
        console.warn(`Port ${port - 1} is already in use. Retrying on port ${port}...`);
        startListening();
        return;
      }

      console.error('Server startup failed:', error);
      process.exit(1);
    });
  };

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const isMongoConnected = await connectDB();
  const databaseMode = isMongoConnected ? 'mongodb_atlas' : 'local_json_db';

  if (isMongoConnected) {
    console.log('🔮 RUNNING MODE: Active Cloud Database (MongoDB Atlas + Mongoose)');
  } else {
    console.log('💾 RUNNING MODE: Active Embedded Local Database (Seeded JSON-DB Engine)');
  }

  app.use('/api', apiRoutes);

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      database: databaseMode,
      time: new Date().toISOString(),
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  startListening();
}
