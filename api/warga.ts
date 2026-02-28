import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const data = await prisma.warga.findMany();
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { id, ...rest } = req.body;
      const newWarga = await prisma.warga.create({
        data: { ...rest, id: id || undefined }
      });
      return res.json(newWarga);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  } finally {
    await prisma.$disconnect();
  }
}
