import { z } from 'zod';

export const registerSchema = z.strictObject({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'El email no tiene un formato válido' })),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(72, { message: 'La contraseña no puede superar los 72 caracteres' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
