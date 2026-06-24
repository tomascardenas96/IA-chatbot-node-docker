import { ConflictError, UnauthorizedError } from '@/common/errors/index.js';
import { prisma } from '@/config/prisma.js';
import bcrypt from 'bcrypt';
import { LoginInput, RegisterInput } from './auth.schema.js';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';

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

export async function loginUser({ email, password }: LoginInput) {
  // 1. Buscamos si existe un usuario que coincida con el email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Credenciales invalidas');
  }

  // 2. Verificamos que el password sea valido
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Credenciales invalidas');
  }

  // 3. Firmar el JWT
  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // 4. Devolver el usuario sin el password
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}
