import express from 'express';
import type { Request, Response, NextFunction } from 'express';

const app = express();

app.use(express.json());

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
