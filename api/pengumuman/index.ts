import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const data = await prisma.pengumuman.findMany({ orderBy: { tanggal: 'desc' } });
      return res.json(data);
    }
    if (req.method === 'POST') {
      const newItem = await prisma.pengumuman.create({ data: req.body });
      return res.json(newItem);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  } finally {
    await prisma.$disconnect();
  }
}
