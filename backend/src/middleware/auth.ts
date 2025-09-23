import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_prod';

export interface AuthRequest extends Request { user?: any; }

export function requireAuth(req:AuthRequest, res:Response, next:NextFunction) {
  const auth = req.headers.authorization as string;
  if (!auth) return res.status(401).json({ error: 'Отсутствует заголовок авторизации' });
  const [type, token] = auth.split(' ');
  if (type !== 'Bearer' || !token) return res.status(401).json({ error: 'Неверный формат авторизации' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
}
