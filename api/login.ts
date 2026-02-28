import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { identifier, password } = req.body;
    const user = await prisma.warga.findFirst({
      where: {
        OR: [{ nik: identifier }, { email: identifier }, { noHP: identifier }]
      }
    });
    if (!user) return res.status(404).json({ error: 'Identitas tidak ditemukan' });
    if (user.password !== password) return res.status(401).json({ error: 'Password salah' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  } finally {
    await prisma.$disconnect();
  }
}
