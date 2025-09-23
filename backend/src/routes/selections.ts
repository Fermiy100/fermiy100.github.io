import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth';
const router = Router();

router.post('/', requireAuth, async (req:any, res) => {
  if (!req.user || req.user.role !== 'PARENT') return res.status(403).json({ error: 'Only parent' });
  const selections = req.body.selections;
  if (!Array.isArray(selections)) return res.status(400).json({ error: 'selections array required' });
  const created = [];
  for (const s of selections) {
    const item = await prisma.menuItem.findUnique({ where: { id: Number(s.menuItemId) } });
    if (!item) continue;
    const c = await prisma.selection.create({ data: { userId: req.user.userId, menuItemId: item.id, quantity: s.quantity || 1, comment: s.comment || null } });
    created.push(c);
  }
  res.json({ createdCount: created.length });
});

router.get('/report/week', async (req, res) => {
  const { schoolId } = req.query;
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' });
  const agg = await prisma.selection.groupBy({ by: ['menuItemId'], _sum: { quantity: true } });
  const out = [];
  for (const a of agg) {
    const item = await prisma.menuItem.findUnique({ where: { id: a.menuItemId } });
    out.push({ menuItemId: a.menuItemId, name: item?.name, total: a._sum.quantity });
  }
  res.json(out);
});

export default router;
