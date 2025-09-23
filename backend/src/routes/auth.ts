import { Router } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generatePassword } from '../utils/password';
import { requireAuth } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_prod';

router.post('/login', async (req:any, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Требуется email и пароль' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Неверные учётные данные' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Неверные учётные данные' });
  const token = jwt.sign({ userId: user.id, role: user.role, schoolId: user.schoolId }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/register', async (req:any, res) => {
  const { email, password, role, schoolId } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Требуется email и пароль' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, role: role || 'PARENT', schoolId: schoolId ? Number(schoolId) : undefined } });
  res.json({ user });
});

// Создать аккаунт родителя (только директор)
router.post('/create-parent', requireAuth, async (req:any, res) => {
  try {
    if (!req.user || req.user.role !== 'DIRECTOR') return res.status(403).json({ error: 'Только директор может создавать аккаунты родителей' });
    const { email, schoolId } = req.body;
    if (!email) return res.status(400).json({ error: 'Требуется email' });
    const plain = generatePassword();
    const hash = await bcrypt.hash(plain, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: 'PARENT',
        schoolId: schoolId ? Number(schoolId) : req.user.schoolId || 1,
        verified: true
      }
    });
    res.json({ ok: true, email: user.email, password: plain });
  } catch (e:any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    res.status(500).json({ error: 'Ошибка создания пользователя', detail: String(e) });
  }
});

export default router;
