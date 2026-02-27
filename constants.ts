
import { Warga, Gender, Agama, StatusPerkawinan, Keuangan, UserRole, ChangeRequest, UserNotification, ActivityLog, Aspirasi, RTProfileData, GaleriItem, Peristiwa, JenisPeristiwa, Pengumuman, AppConfig, WakafProgram, WakafTransaksi, UMKMProduct, StatusTinggal, BansosDistribution } from "./types";

export const APP_TITLE = "SIAGA ERGEN";
export const SUB_TITLE = "Desa Rancamanyar, Kecamatan Baleendah";

export const INITIAL_APP_CONFIG: AppConfig = {
  appName: APP_TITLE,
  regionName: SUB_TITLE,
  heroDescription: "Sistem Informasi Warga RT 06 RW 19 – Desa Rancamanyar, Kecamatan Baleendah. Mempermudah administrasi kependudukan, transparansi keuangan, dan pelayanan surat pengantar bagi warga secara digital.",
  logoUrl: "", // Empty uses default text logo
  iuranConfig: {
    besaran: 50000,
    nama: "Iuran Wajib & Kebersihan"
  }
};

export const INITIAL_RT_PROFILE: RTProfileData = {
  deskripsi: "Mewujudkan lingkungan yang guyub, rukun, aman, dan sejahtera melalui gotong royong dan digitalisasi pelayanan.",
  visi: "Terwujudnya RT 06 sebagai lingkungan yang Religius, Aman, Bersih, dan Inovatif (RABI) berbasis gotong royong.",
  misi: [
    "Meningkatkan kerukunan antar warga melalui kegiatan sosial dan keagamaan.",
    "Mewujudkan keamanan lingkungan yang kondusif melalui Siskamling aktif.",
    "Mengelola kebersihan dan kesehatan lingkungan secara mandiri dan berkelanjutan.",
    "Meningkatkan pelayanan administrasi warga yang transparan dan cepat berbasis teknologi."
  ],
  sejarah: `RT 06 RW 19 di Desa Rancamanyar terbentuk pada tahun 1998 seiring dengan pemekaran wilayah perumahan Rancamanyar Indah. Awalnya hanya terdiri dari 15 Kepala Keluarga, kini lingkungan kami telah berkembang menjadi hunian yang padat namun tetap asri dengan lebih dari 80 Kepala Keluarga.

Nama "Rancamanyar" sendiri diambil dari kearifan lokal yang berarti "Rawa yang Indah" (Ranca: Rawa, Manyar: Indah/Burung Manyar), yang menggambarkan transformasi wilayah ini dari lahan basah menjadi pemukiman yang layak huni dan produktif.`,
  struktur: {
    ketuaRT: "Asep Surasep",
    sekretaris: "Siti Aminah",
    bendahara: "Haji Ahmad",
    seksi: [
      { id: "s1", jabatan: "Keamanan", namaPejabat: "Bapak Yanto" },
      { id: "s2", jabatan: "Sosial & PKK", namaPejabat: "Ibu Darmi" },
      { id: "s3", jabatan: "Pembangunan", namaPejabat: "Bapak Ujang" }
    ]
  }
};

export const INITIAL_WARGA: Warga[] = [
  // --- SUPER ADMIN ACCOUNT ---
  {
    id: "0",
    noKK: "0000000000000000",
    nik: "0000000000000000",
    namaLengkap: "Super Admin System",
    jenisKelamin: Gender.LAKI_LAKI,
    tempatLahir: "Server",
    tanggalLahir: "2000-01-01",
    agama: Agama.ISLAM,
    pekerjaan: "Administrator Sistem",
    statusPerkawinan: StatusPerkawinan.BELUM_KAWIN,
    noHP: "080000000000",
    isKepalaKeluarga: true,
    role: UserRole.SUPER_ADMIN,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.TETAP,
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
    jenisKelamin: Gender.LAKI_LAKI,
    tempatLahir: "Bandung",
    tanggalLahir: "1980-05-12",
    agama: Agama.ISLAM,
    pekerjaan: "Wiraswasta",
    statusPerkawinan: StatusPerkawinan.KAWIN,
    noHP: "081234567890",
    isKepalaKeluarga: true,
    role: UserRole.KETUA_RT,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.TETAP,
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
    jenisKelamin: Gender.PEREMPUAN,
    tempatLahir: "Garut",
    tanggalLahir: "1982-08-20",
    agama: Agama.ISLAM,
    pekerjaan: "Ibu Rumah Tangga",
    statusPerkawinan: StatusPerkawinan.KAWIN,
    noHP: "081234567891",
    isKepalaKeluarga: false,
    role: UserRole.SEKRETARIS,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.TETAP_DOMISILI,
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
    jenisKelamin: Gender.LAKI_LAKI,
    tempatLahir: "Jakarta",
    tanggalLahir: "1990-11-10",
    agama: Agama.KRISTEN,
    pekerjaan: "Karyawan Swasta",
    statusPerkawinan: StatusPerkawinan.KAWIN, // Diubah jadi Kawin agar sinkron dengan keluarga
    noHP: "081234567892",
    isKepalaKeluarga: true,
    role: UserRole.WARGA,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.MUSIMAN,
    alamatRumah: "Gg. Melati No. 5",
    email: "budi.santoso@email.com",
    fotoProfil: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=200&h=200",
    isVerified: true,
    joinedAt: "2024-05-15", // Slightly new
    isPenerimaBansos: true, // Contoh warga penerima bansos
    password: "123456"
  },
  {
    id: "4",
    noKK: "3204100404040004",
    nik: "3204100404040004",
    namaLengkap: "Haji Ahmad",
    jenisKelamin: Gender.LAKI_LAKI,
    tempatLahir: "Bandung",
    tanggalLahir: "1975-02-15",
    agama: Agama.ISLAM,
    pekerjaan: "Pensiunan",
    statusPerkawinan: StatusPerkawinan.KAWIN,
    noHP: "081234567893",
    isKepalaKeluarga: true,
    role: UserRole.BENDAHARA,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.TETAP,
    alamatRumah: "Jl. Rancamanyar Utama No. 2",
    email: "bendahara@rancamanyar.desa.id",
    isVerified: true,
    joinedAt: "2023-01-10",
    password: "123456"
  },
  // --- Tambahan Anggota Keluarga Budi Santoso (Untuk Demo Profil Warga) ---
  {
    id: "5",
    noKK: "3204100303030003", // Sama dengan Budi
    nik: "3204100505050005",
    namaLengkap: "Linda Kusuma",
    jenisKelamin: Gender.PEREMPUAN,
    tempatLahir: "Bandung",
    tanggalLahir: "1992-03-15",
    agama: Agama.KRISTEN,
    pekerjaan: "Ibu Rumah Tangga",
    statusPerkawinan: StatusPerkawinan.KAWIN,
    noHP: "081234567895",
    isKepalaKeluarga: false,
    role: UserRole.WARGA,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.MUSIMAN,
    alamatRumah: "Gg. Melati No. 5",
    fotoProfil: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=200&h=200",
    isVerified: true,
    joinedAt: "2024-05-15",
    isPenerimaBansos: true,
    password: "123456"
  },
  {
    id: "6",
    noKK: "3204100303030003", // Sama dengan Budi
    nik: "3204100606060006",
    namaLengkap: "Doni Santoso",
    jenisKelamin: Gender.LAKI_LAKI,
    tempatLahir: "Bandung",
    tanggalLahir: "2015-06-01", // Usia Anak (Sekitar 9 tahun)
    agama: Agama.KRISTEN,
    pekerjaan: "Pelajar",
    statusPerkawinan: StatusPerkawinan.BELUM_KAWIN,
    noHP: "-",
    isKepalaKeluarga: false,
    role: UserRole.WARGA,
    statusKependudukan: "AKTIF",
    statusTinggal: StatusTinggal.MUSIMAN,
    alamatRumah: "Gg. Melati No. 5",
    isVerified: true,
    joinedAt: "2024-05-15",
    password: "123456"
  }
];

export const INITIAL_KEUANGAN: Keuangan[] = [
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
  },
  // Tambahan history transaksi spesifik user Budi untuk demo Profil Saya > Keuangan
  {
    id: "k4",
    tanggal: "2024-04-02",
    tipe: "PEMASUKAN",
    kategori: "Iuran Wajib & Kebersihan",
    jumlah: 50000,
    keterangan: "Iuran Wajib & Kebersihan Bulan April 2024",
    status: "LUNAS",
    wargaId: "3",
    metodePembayaran: "TRANSFER"
  },
  {
    id: "k5",
    tanggal: "2024-05-02",
    tipe: "PEMASUKAN",
    kategori: "Iuran Wajib & Kebersihan",
    jumlah: 50000,
    keterangan: "Iuran Wajib & Kebersihan Bulan Mei 2024",
    status: "LUNAS",
    wargaId: "3",
    metodePembayaran: "QRIS"
  }
];

export const INITIAL_REQUESTS: ChangeRequest[] = [
  {
    id: "req1",
    wargaId: "3",
    field: "Pekerjaan",
    oldValue: "Karyawan Swasta",
    newValue: "Wiraswasta",
    alasan: "Resign dan buka usaha sendiri",
    status: "DIAJUKAN",
    tanggalPengajuan: "2024-05-18"
  }
];

export const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: "notif1",
    userId: "3",
    pesan: "Iuran Kebersihan Bulan Mei telah lunas.",
    tipe: "IURAN",
    isRead: false,
    tanggal: "2024-05-02"
  },
  {
    id: "notif2",
    userId: "3",
    pesan: "Kerja bakti akan dilaksanakan besok pagi.",
    tipe: "PENGUMUMAN",
    isRead: true,
    tanggal: "2024-05-17"
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log1",
    userId: "3",
    aktivitas: "Login ke sistem",
    timestamp: "2024-05-19 08:30"
  },
  {
    id: "log2",
    userId: "3",
    aktivitas: "Mengubah foto profil",
    timestamp: "2024-05-15 14:20"
  }
];

export const INITIAL_ASPIRASI: Aspirasi[] = [
  { 
    id: '1', 
    wargaId: '3',
    pengirim: 'Budi Santoso', 
    isi: 'Lampu jalan di gang 3 mati sudah 2 hari.', 
    tanggal: '2024-05-10', 
    status: 'SELESAI' 
  }
];

export const INITIAL_GALERI: GaleriItem[] = [
  {
    id: "g1",
    judul: "Kerja Bakti Rutin",
    tanggal: "2024-05-12",
    kategori: "KERJA_BAKTI",
    deskripsi: "Kegiatan membersihkan selokan utama dan pemangkasan rumput liar di sepanjang jalan utama RT 06.",
    imageUrl: "https://images.unsplash.com/photo-1590059590936-7c98e1697204?q=80&w=800&auto=format&fit=crop",
    uploadedBy: "Ketua RT"
  },
  {
    id: "g2",
    judul: "Rapat Persiapan 17 Agustusan",
    tanggal: "2024-05-01",
    kategori: "RAPAT",
    deskripsi: "Pembentukan panitia HUT RI ke-79. Disepakati lomba anak-anak dan jalan santai.",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
    uploadedBy: "Sekretaris"
  },
  {
    id: "g3",
    judul: "Lomba Makan Kerupuk Anak",
    tanggal: "2023-08-17",
    kategori: "LOMBA",
    deskripsi: "Keseruan lomba makan kerupuk kategori anak-anak usia 6-10 tahun.",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800&auto=format&fit=crop",
    uploadedBy: "Ketua RT"
  }
];

export const INITIAL_PERISTIWA: Peristiwa[] = [
  {
    id: "p1",
    wargaId: "3", // Budi Santoso
    jenisPeristiwa: JenisPeristiwa.DATANG,
    tanggalPeristiwa: "2020-01-10",
    keterangan: "Pindah datang dari Jakarta Selatan.",
    dicatatOleh: "Asep Surasep",
    createdAt: "2020-01-10T09:00:00Z"
  }
];

export const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id: '1',
    judul: 'Kerja Bakti Membersihkan Selokan',
    isi: 'Diharapkan kehadiran Bapak-bapak warga RT 06 untuk mengikuti kerja bakti membersihkan selokan utama menghadapi musim hujan.\n\nDemikian pengumuman ini disampaikan untuk menjadi perhatian seluruh warga.',
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

export const INITIAL_UNDANGAN: UndanganAcara[] = [
  {
    id: 'inv1',
    judul: 'Rapat Persiapan 17 Agustus',
    deskripsi: 'Mengundang seluruh warga untuk menghadiri rapat pembentukan panitia 17 Agustus.',
    tanggal: '2024-06-01',
    waktu: '19:30',
    lokasi: 'Balai Warga RT 06',
    isRsvpRequired: true,
    createdAt: '2024-05-20',
    penulis: 'Ketua RT',
    attendees: []
  }
];

// --- INITIAL WAKAF DATA ---
export const INITIAL_WAKAF_PROGRAMS: WakafProgram[] = [
  {
    id: "wp1",
    judul: "Renovasi Kubah Masjid Al-Hidayah",
    deskripsi: "Program penggantian kubah utama masjid RW 19 yang sudah bocor dan pengecatan ulang menara.",
    targetDana: 150000000, // 150 Juta
    terkumpul: 45000000,
    deadline: "2024-12-31",
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1000&auto=format&fit=crop",
    status: "AKTIF",
    kategori: "MASJID"
  },
  {
    id: "wp2",
    judul: "Pembebasan Lahan Makam RW 19",
    deskripsi: "Pembelian lahan seluas 500m2 untuk perluasan area pemakaman umum warga RW 19 Desa Rancamanyar.",
    targetDana: 500000000, // 500 Juta
    terkumpul: 125000000,
    imageUrl: "https://images.unsplash.com/photo-1543835706-93c837bb7846?q=80&w=1000&auto=format&fit=crop",
    status: "AKTIF",
    kategori: "INFRASTRUKTUR"
  },
  {
    id: "wp3",
    judul: "Ambulans Siaga Warga",
    deskripsi: "Pengadaan unit mobil ambulans untuk layanan kesehatan darurat 24 jam bagi warga RW 19.",
    targetDana: 250000000,
    terkumpul: 200000000,
    deadline: "2024-08-17",
    imageUrl: "https://images.unsplash.com/photo-1581559868729-e397c63b7dfd?q=80&w=1000&auto=format&fit=crop",
    status: "AKTIF",
    kategori: "SOSIAL"
  }
];

export const INITIAL_WAKAF_TRANSACTIONS: WakafTransaksi[] = [
  {
    id: "wt1",
    programId: "wp1",
    wargaId: "3", // Budi
    namaDonatur: "Budi Santoso",
    jumlah: 100000,
    tanggal: "2024-05-18",
    metode: "QRIS",
    status: "LUNAS",
    doa: "Semoga menjadi amal jariyah untuk keluarga kami.",
    isAnonim: false
  },
  {
    id: "wt2",
    programId: "wp3",
    wargaId: "1", // Pak RT
    namaDonatur: "Hamba Allah",
    jumlah: 500000,
    tanggal: "2024-05-15",
    metode: "TRANSFER",
    status: "LUNAS",
    doa: "Untuk kesehatan seluruh warga.",
    isAnonim: true
  }
];

// --- INITIAL UMKM DATA ---
export const INITIAL_UMKM_PRODUCTS: UMKMProduct[] = [
  {
    id: "umkm1",
    sellerId: "3", // Budi
    sellerName: "Budi Santoso",
    name: "Nasi Uduk Betawi Spesial",
    description: "Nasi uduk gurih dengan lauk ayam goreng serundeng, tempe orek, dan sambal kacang khas Betawi. Tersedia setiap pagi.",
    price: 15000,
    category: "MAKANAN",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1000&auto=format&fit=crop",
    whatsapp: "081234567892",
    isAvailable: true,
    createdAt: "2024-05-01"
  },
  {
    id: "umkm2",
    sellerId: "3", // Budi
    sellerName: "Budi Santoso",
    name: "Jasa Service AC & Elektronik",
    description: "Melayani cuci AC, tambah freon, dan perbaikan barang elektronik rumah tangga. Bergaransi 1 minggu.",
    price: 75000,
    category: "JASA",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop",
    whatsapp: "081234567892",
    isAvailable: true,
    createdAt: "2024-05-05"
  },
  {
    id: "umkm3",
    sellerId: "1", // Asep (RT) - Simulasi
    sellerName: "Ibu Asep Catering",
    name: "Snack Box Rapat",
    description: "Paket snack box untuk acara rapat, pengajian, dan arisan. Isi 3 kue + air mineral. Minimal order 10 box.",
    price: 12000,
    category: "MAKANAN",
    imageUrl: "https://images.unsplash.com/photo-1556680210-9832cb962b92?q=80&w=1000&auto=format&fit=crop",
    whatsapp: "081234567890",
    isAvailable: true,
    createdAt: "2024-05-10"
  },
  {
    id: "umkm4",
    sellerId: "5", // Linda (Istri Budi) - Simulasi
    sellerName: "Linda Fashion",
    name: "Hijab Segi Empat Voal",
    description: "Hijab voal premium, adem, mudah dibentuk, dan tidak menerawang. Banyak pilihan warna pastel.",
    price: 45000,
    category: "FASHION",
    imageUrl: "https://images.unsplash.com/photo-1579781354199-153eb6389026?q=80&w=1000&auto=format&fit=crop",
    whatsapp: "081234567895",
    isAvailable: true,
    createdAt: "2024-05-12"
  }
];

export const INITIAL_BANSOS_DISTRIBUTIONS: BansosDistribution[] = [
  {
    id: "bansos1",
    wargaId: "3", // Budi Santoso
    jenisBansos: "SEMBAKO",
    periode: "Januari 2024",
    tanggalSalur: "2024-01-15",
    jumlah: 200000,
    keterangan: "Paket Sembako Beras 10kg, Minyak 2L, Gula 1kg",
    petugasPenyalur: "Asep Surasep"
  },
  {
    id: "bansos2",
    wargaId: "3", // Budi Santoso
    jenisBansos: "BLT",
    periode: "Q1 2024",
    tanggalSalur: "2024-03-10",
    jumlah: 600000,
    keterangan: "Bantuan Langsung Tunai Tahap 1",
    petugasPenyalur: "Haji Ahmad"
  }
];
