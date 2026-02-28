import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };

  try {
    if (req.method === 'PUT') {
      const body = req.body;
      
      // Filter hanya field yang ada di schema Prisma
      const allowedFields = [
        'noKK', 'nik', 'namaLengkap', 'jenisKelamin', 'tempatLahir',
        'tanggalLahir', 'agama', 'pekerjaan', 'statusPerkawinan', 'noHP',
        'isKepalaKeluarga', 'role', 'email', 'password', 'fotoProfil',
        'statusKependudukan', 'statusTinggal', 'alamatRumah', 'alamatKTP',
        'namaPemilikRumah', 'kontakPemilikRumah', 'fotoKTP', 'fotoKK',
        'isVerified', 'isDataComplete', 'isPenerimaBansos', 'joinedAt'
      ];

      const data: Record<string, any> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          data[field] = body[field];
        }
      }

      const updated = await prisma.warga.update({
        where: { id },
        data
      });
      return res.json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.warga.delete({ where: { id } });
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Warga update error:', error);
    res.status(500).json({ error: String(error) });
  } finally {
    await prisma.$disconnect();
  }
        }
