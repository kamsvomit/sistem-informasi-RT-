import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'PUT') {
    try {
      const body = req.body;
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

      const updated = await prisma.warga.update({ where: { id }, data });
      return res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: String(error) });
    } finally {
      await prisma.$disconnect();
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.warga.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: String(error) });
    } finally {
      await prisma.$disconnect();
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
            }
