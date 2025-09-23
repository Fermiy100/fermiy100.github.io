import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../prisma';
import { parseMenuFile } from '../utils/excelParser';
import { requireAuth } from '../middleware/auth';
const upload = multer({ dest: '/tmp' });
const router = Router();

// Upload menu (director)
router.post('/upload', requireAuth, upload.single('file'), async (req:any, res) => {
  if (!req.user || req.user.role !== 'DIRECTOR') return res.status(403).json({ error: 'Только директор' });
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'File required' });
  try {
    const parsed = parseMenuFile(file.path);
    const weekStart = new Date();
    const menu = await prisma.menu.create({
      data: {
        schoolId: req.user.schoolId || 1,
        weekStart,
        uploadedById: req.user.userId || req.user.userId
      }
    });
    for (const p of parsed) {
      await prisma.menuItem.create({
        data: {
          menuId: menu.id,
          mealType: p.meal.toLowerCase(),
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(p.day) + 1 || 1,
          name: p.dish,
          description: p.raw || '',
          price: 0
        }
      });
    }
    res.json({ ok: true, created: parsed.length, menuId: menu.id });
  } catch (e:any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to parse or save menu', detail: String(e) });
  }
});

router.get('/current', async (req, res) => {
  const { schoolId } = req.query;
  if (!schoolId) return res.status(400).json({ error: 'schoolId required' });
  const menu = await prisma.menu.findFirst({
    where: { schoolId: Number(schoolId) },
    orderBy: { weekStart: 'desc' },
    include: { items: true }
  });
  res.json({ menu });
});

export default router;
