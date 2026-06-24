import { asyncHandler } from '@/common/middleware/async-handler';
import { Router } from 'express';
import { login, register } from './auth.controller';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export const authRoutes = router;
