import { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schema';
import { loginUser, registerUser } from './auth.service';
import { env } from '@/config/env';

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(data);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: user,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = loginSchema.parse(req.body);

  const { user, token } = await loginUser(data);

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 15,
  });

  res.status(200).json({ user });
};
