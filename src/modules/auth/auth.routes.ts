import { asyncHandler } from '@/common/middleware/async-handler';
import { Router } from 'express';
import { register } from './auth.controller';

const router = Router();

router.post('/register', asyncHandler(register));

export const authRoutes = router;
