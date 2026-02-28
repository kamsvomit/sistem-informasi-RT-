import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  try {
    if (req.method === 'PUT') {
      const updated = await prisma.warga.update({ where: { id }, data: req.body });
      return res.json(updated);
    }
    if (req.method === 'DELETE') {
      await prisma.warga.delete({ where: { id } });
      return res.json({ success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  } finally {
    await prisma.$disconnect();
  }
}
