import { prisma } from '@/config/prisma.js';
import bcrypt from 'bcrypt';
import { RegisterInput } from './auth.schema.js';
import { ConflictError } from '@/common/errors/index.js';

const SALT_ROUNDS = 10;

export async function registerUser({ email, password }: RegisterInput) {
  // 1. ¿Ya existe un usuario con ese email?
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('EMAIL_ALREADY_EXISTS');
  }

  // 2. Hasheamos la contraseña (NUNCA se guarda en texto plano)
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Creamos el usuario en la base de datos
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // 4. Devolvemos el usuario SIN la contraseña
  const { password: _password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}
