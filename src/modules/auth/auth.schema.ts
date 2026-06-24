import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'El email no tiene un formato válido' }));

export const registerSchema = z.strictObject({
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(72, { message: 'La contraseña no puede superar los 72 caracteres' }),
});

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z.string().max(72, { message: 'La contraseña no puede superar los 72 caracteres' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
