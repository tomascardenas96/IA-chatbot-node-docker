import { UnauthorizedError } from '@/common/errors';
import { env } from '@/config/env';
import { Role } from '@/generated/prisma/enums';
import { NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

// El payload que firmamos en el login: { sub, role }.
// sub = subject = el userId (convención estándar de JWT).
interface TokenPayload {
  sub: string;
  role: Role;
}

// Type guard: jwt.verify devuelve string | JwtPayload | nuestro objeto.
// Validamos en runtime que el token decodificado tenga la forma que esperamos,
// en vez de confiar a ciegas con un `as TokenPayload`.
function isTokenPayload(decoded: unknown): decoded is TokenPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'sub' in decoded &&
    typeof (decoded as Record<string, unknown>).sub === 'string' &&
    'role' in decoded &&
    ((decoded as Record<string, unknown>).role === 'user' ||
      (decoded as Record<string, unknown>).role === 'admin')
  );
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // 1. Leer el token de la cookie (mismo nombre que usaste al setearla en login).
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    throw new UnauthorizedError('Autentication required', 'MISSING_TOKEN');
  }

  // 2. Verificar firma + expiración. jwt.verify TIRA si falla, no devuelve null.
  let decoded: unknown;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN');
  }

  // 3. Validar la forma del payload en runtime antes de confiar en él.
  if (!isTokenPayload(decoded)) {
    throw new UnauthorizedError('Invalid token payload', 'INVALID_TOKEN');
  }

  // 4. Dejar disponible para los controllers. req.user lo agregamos al tipo
  //    Request vía declaration merging (ver auth.types.ts).
  req.user = { id: decoded.sub, role: decoded.role };

  next();
}
