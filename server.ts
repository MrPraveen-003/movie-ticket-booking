import { bootstrap } from './server/server';

bootstrap().catch((error) => {
  console.error('Fatal initialization error on CinePass backend start:', error);
});
