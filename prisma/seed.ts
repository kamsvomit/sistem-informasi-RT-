import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Seed Warga
  const wargaData = [
    {
      id: "0",
      noKK: "0000000000000000",
      nik: "0000000000000000",
      namaLengkap: "Super Admin System",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Server",
      tanggalLahir: "2000-01-01",
      agama: "Islam",
      pekerjaan: "Administrator Sistem",
      statusPerkawinan: "Belum Kawin",
      noHP: "080000000000",
      isKepalaKeluarga: true,
      role: "Super Admin",
      statusKependudukan: "AKTIF",
      statusTinggal: "Tetap",
      alamatRumah: "Pusat Data Desa",
      email: "admin@ergen.id",
      fotoProfil: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?fit=crop&w=200&h=200",
      isVerified: true,
      joinedAt: "2023-01-01",
      password: "123456"
    },
    {
      id: "1",
      noKK: "3204100101010001",
      nik: "3204100101010001",
      namaLengkap: "Asep Surasep",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Bandung",
      tanggalLahir: "1980-05-12",
      agama: "Islam",
      pekerjaan: "Wiraswasta",
      statusPerkawinan: "Kawin",
      noHP: "081234567890",
      isKepalaKeluarga: true,
      role: "Ketua RT",
      statusKependudukan: "AKTIF",
      statusTinggal: "Tetap",
      alamatRumah: "Jl. Rancamanyar Indah No. 10",
      email: "pakrt@rancamanyar.desa.id",
      fotoProfil: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=200&h=200",
      isVerified: true,
      joinedAt: "2023-01-01",
      password: "123456"
    },
    {
      id: "2",
      noKK: "3204100101010001",
      nik: "3204100202020002",
      namaLengkap: "Siti Aminah",
      jenisKelamin: "Perempuan",
      tempatLahir: "Garut",
      tanggalLahir: "1982-08-20",
      agama: "Islam",
      pekerjaan: "Ibu Rumah Tangga",
      statusPerkawinan: "Kawin",
      noHP: "081234567891",
      isKepalaKeluarga: false,
      role: "Sekretaris",
      statusKependudukan: "AKTIF",
      statusTinggal: "Tetap Domisili",
      alamatRumah: "Jl. Rancamanyar Indah No. 10",
      isVerified: true,
      joinedAt: "2023-02-15",
      password: "123456"
    },
    {
      id: "3",
      noKK: "3204100303030003",
      nik: "3204100303030003",
      namaLengkap: "Budi Santoso",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Jakarta",
      tanggalLahir: "1990-11-10",
      agama: "Kristen",
      pekerjaan: "Karyawan Swasta",
      statusPerkawinan: "Kawin",
      noHP: "081234567892",
      isKepalaKeluarga: true,
      role: "Warga",
      statusKependudukan: "AKTIF",
      statusTinggal: "Musiman",
      alamatRumah: "Gg. Melati No. 5",
      email: "budi.santoso@email.com",
      fotoProfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200",
      isVerified: true,
      joinedAt: "2024-05-15",
      isPenerimaBansos: true,
      password: "123456"
    },
    {
      id: "4",
      noKK: "3204100404040004",
      nik: "3204100404040004",
      namaLengkap: "Haji Ahmad",
      jenisKelamin: "Laki-laki",
      tempatLahir: "Bandung",
      tanggalLahir: "1975-02-15",
      agama: "Islam",
      pekerjaan: "Pensiunan",
      statusPerkawinan: "Kawin",
      noHP: "081234567893",
      isKepalaKeluarga: true,
      role: "Bendahara",
      statusKependudukan: "AKTIF",
      statusTinggal: "Tetap",
      alamatRumah: "Jl. Rancamanyar Utama No. 2",
      email: "bendahara@rancamanyar.desa.id",
      isVerified: true,
      joinedAt: "2023-01-10",
      password: "123456"
    }
  ];

  for (const w of wargaData) {
    await prisma.warga.upsert({
      where: { nik: w.nik },
      update: {},
      create: w,
    });
  }

  // Seed Keuangan
  const keuanganData = [
    {
      id: "k1",
      tanggal: "2024-05-01",
      tipe: "PEMASUKAN",
      kategori: "Iuran Bulanan",
      jumlah: 1500000,
      keterangan: "Iuran Warga Bulan Mei",
      status: "LUNAS",
      metodePembayaran: "TUNAI"
    },
    {
      id: "k2",
      tanggal: "2024-05-05",
      tipe: "PENGELUARAN",
      kategori: "Operasional",
      jumlah: 200000,
      keterangan: "Beli Alat Tulis Kantor RT",
      status: "LUNAS",
      metodePembayaran: "TUNAI"
    },
    {
      id: "k3",
      tanggal: "2024-05-10",
      tipe: "PENGELUARAN",
      kategori: "Sosial",
      jumlah: 300000,
      keterangan: "Sumbangan Warga Sakit (Pak Yanto)",
      status: "LUNAS",
      metodePembayaran: "TUNAI"
    }
  ];

  for (const k of keuanganData) {
    await prisma.keuangan.upsert({
      where: { id: k.id },
      update: {},
      create: k,
    });
  }

  // Seed Pengumuman
  const pengumumanData = [
    {
      id: '1',
      judul: 'Kerja Bakti Membersihkan Selokan',
      isi: 'Diharapkan kehadiran Bapak-bapak warga RT 06 untuk mengikuti kerja bakti membersihkan selokan utama menghadapi musim hujan.',
      tanggal: '2024-05-18',
      penulis: 'Ketua RT',
      penting: true,
    },
    {
      id: '2',
      judul: 'Jadwal Posyandu Balita',
      isi: 'Posyandu bulan Mei akan dilaksanakan pada tanggal 20 Mei 2024 di Rumah Bu Bidan.',
      tanggal: '2024-05-15',
      penulis: 'Ibu PKK',
      penting: false,
    }
  ];

  for (const p of pengumumanData) {
    await prisma.pengumuman.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
