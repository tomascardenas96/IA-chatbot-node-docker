// src/server.ts
import { env } from './config/env';
import { app } from '@/app';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${env.PORT}`);
});
