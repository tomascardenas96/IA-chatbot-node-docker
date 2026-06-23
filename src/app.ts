// src/app.ts
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authRoutes } from '@/modules/auth/auth.routes';
import { errorHandler } from '@/common/middleware/error-handler';

const app = express();

// 1. Parser de JSON (antes de las rutas, para que req.body exista)
app.use(express.json());

// 2. Logger simple de requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
});

// 3. Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 4. Rutas de la aplicación (acá se monta auth bajo su prefijo)
app.use('/api/v1/auth', authRoutes);

// 5. Handler central de errores (SIEMPRE al final)
app.use(errorHandler);

export { app };
