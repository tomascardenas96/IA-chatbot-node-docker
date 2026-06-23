import { Request, Response } from 'express';
import { registerSchema } from './auth.schema';
import { registerUser } from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);

  const user = await registerUser(data);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: user,
  });
};
