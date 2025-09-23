import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import menusRouter from './routes/menus';
import selectionsRouter from './routes/selections';
import { prisma } from './prisma';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => res.send('pong'));
app.get('/health', async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true }); } catch (e:any) { res.status(500).json({ ok:false, error:String(e) }); }
});

app.use('/api/auth', authRouter);
app.use('/api/menus', menusRouter);
app.use('/api/selections', selectionsRouter);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, ()=> console.log('Server listening on', PORT));
