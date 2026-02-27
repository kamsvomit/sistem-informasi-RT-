
export enum Gender {
  LAKI_LAKI = "Laki-laki",
  PEREMPUAN = "Perempuan",
}

export enum Agama {
  ISLAM = "Islam",
  KRISTEN = "Kristen",
  KATOLIK = "Katolik",
  HINDU = "Hindu",
  BUDDHA = "Buddha",
  KONGHUCU = "Konghucu",
}

export enum StatusPerkawinan {
  BELUM_KAWIN = "Belum Kawin",
  KAWIN = "Kawin",
  CERAI_HIDUP = "Cerai Hidup",
  CERAI_MATI = "Cerai Mati",
}

export enum StatusTinggal {
  TETAP = "Tetap",
  TETAP_DOMISILI = "Tetap Domisili",
  MUSIMAN = "Musiman",
}

export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  KETUA_RT = "Ketua RT",
  SEKRETARIS = "Sekretaris",
  BENDAHARA = "Bendahara",
  PENGURUS = "Pengurus",
  WARGA = "Warga",
}

// Configuration Type
export interface AppConfig {
  appName: string;
  regionName: string;
  heroDescription: string;
  logoUrl?: string; // Base64 string
  iuranConfig?: {
    besaran: number;
    nama: string; // e.g. "Iuran Wajib & Sampah"
  };
}

// Payment Related Types
export type PaymentMethod = "TUNAI" | "TRANSFER" | "QRIS" | "E_WALLET";
// TAGIHAN = Bill created but not paid yet
// MENUNGGU_VERIFIKASI = Paid by user, waiting admin approval
// LUNAS = Approved/Money received
export type TransactionStatus = "TAGIHAN" | "LUNAS" | "MENUNGGU_VERIFIKASI" | "DITOLAK";

export interface Warga {
  id: string;
  noKK: string;
  nik: string;
  namaLengkap: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Agama;
  pekerjaan: string;
  statusPerkawinan: StatusPerkawinan;
  noHP: string;
  isKepalaKeluarga: boolean;
  role: UserRole;
  // Field Tambahan untuk Profil Saya
  email?: string;
  password?: string; // Mock only
  fotoProfil?: string;
  statusKependudukan?: "AKTIF" | "PINDAH" | "MENINGGAL";
  statusTinggal?: StatusTinggal;
  
  // Alamat & Verifikasi Tinggal
  alamatRumah?: string; // Domisili Saat Ini
  alamatKTP?: string; // Alamat Sesuai KTP
  namaPemilikRumah?: string; // Jika Musiman/Kontrak
  kontakPemilikRumah?: string; // Jika Musiman/Kontrak
  
  fotoKTP?: string; // Base64
  fotoKK?: string; // Base64
  
  isVerified?: boolean; // Auth Verification (OTP)
  isDataComplete?: boolean; // Population Data Completed & Verified logic check
  isPenerimaBansos?: boolean; // Status Penerima Bantuan Sosial
  joinedAt?: string; // Tanggal bergabung (YYYY-MM-DD) untuk badge "BARU"
}

export interface Keuangan {
  id: string;
  tanggal: string;
  tipe: "PEMASUKAN" | "PENGELUARAN";
  kategori: string;
  jumlah: number;
  keterangan: string;
  // New Fields for Payment Feature
  wargaId?: string; // Optional, link to payer if known
  metodePembayaran?: PaymentMethod;
  status?: TransactionStatus; 
  fotoBukti?: string; // Base64 string of receipt
  alasanPenolakan?: string;
}

export interface SuratPengantar {
  id: string;
  wargaId: string;
  jenisSurat: string;
  keperluan: string;
  tanggalDibuat: string;
  kontenAI?: string;
}

export interface Pengumuman {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  penulis: string;
  penting: boolean;
}

export interface UndanganAcara {
  id: string;
  judul: string;
  deskripsi: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  isRsvpRequired: boolean;
  createdAt: string;
  penulis: string;
  attendees: string[]; // List of user IDs who RSVP'd
}

export interface Aspirasi {
  id: string;
  wargaId: string; // Added to link to sender
  pengirim: string;
  isi: string;
  tanggal: string;
  status: "BARU" | "DIPROSES" | "SELESAI";
}

// Tipe Baru untuk Modul Profil Saya
export interface ChangeRequest {
  id: string;
  wargaId: string;
  field: string; // Misal: "Pekerjaan", "Pendidikan"
  oldValue: string;
  newValue: string;
  alasan: string;
  status: "DIAJUKAN" | "DISETUJUI" | "DITOLAK";
  tanggalPengajuan: string;
  catatanAdmin?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  pesan: string;
  tipe: "IURAN" | "PENGUMUMAN" | "SYSTEM" | "WAKAF";
  isRead: boolean;
  tanggal: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  aktivitas: string;
  timestamp: string;
}

// Tipe Baru untuk Profil RT Dinamis
export interface SeksiOrganisasi {
  id: string;
  jabatan: string;
  namaPejabat: string;
}

export interface RTProfileData {
  deskripsi?: string; // Deskripsi singkat profil wilayah
  visi: string;
  misi: string[];
  sejarah: string;
  struktur: {
    ketuaRT: string;
    sekretaris: string;
    bendahara: string;
    seksi: SeksiOrganisasi[];
  };
}

// Tipe Baru untuk Galeri
export interface GaleriItem {
  id: string;
  judul: string;
  tanggal: string;
  kategori: "KERJA_BAKTI" | "RAPAT" | "LOMBA" | "SOSIAL" | "LAINNYA";
  deskripsi: string;
  imageUrl: string; // Base64 string
  uploadedBy: string;
}

// Tipe Baru untuk Peristiwa Kependudukan
export enum JenisPeristiwa {
  LAHIR = "LAHIR",
  MENINGGAL = "MENINGGAL",
  DATANG = "DATANG",
  PINDAH = "PINDAH"
}

export interface Peristiwa {
  id: string;
  wargaId: string; // Ref ke Warga
  jenisPeristiwa: JenisPeristiwa;
  tanggalPeristiwa: string;
  keterangan: string;
  dicatatOleh: string; // Email/Nama Admin
  dokumenPendukung?: string; // Base64 string (Opsional)
  createdAt: string;
}

// Tipe untuk WAKAF RW
export interface WakafProgram {
  id: string;
  judul: string;
  deskripsi: string;
  targetDana: number;
  terkumpul: number;
  deadline?: string;
  imageUrl: string;
  status: 'AKTIF' | 'SELESAI';
  kategori: 'MASJID' | 'SOSIAL' | 'INFRASTRUKTUR';
}

export interface WakafTransaksi {
  id: string;
  programId: string;
  wargaId: string;
  namaDonatur: string; // Bisa "Hamba Allah" jika anonim
  jumlah: number;
  tanggal: string;
  metode: PaymentMethod;
  fotoBukti?: string;
  status: TransactionStatus;
  doa?: string;
  isAnonim: boolean;
}

// Tipe untuk UMKM ERGEN
export type UMKMCategory = 'MAKANAN' | 'MINUMAN' | 'JASA' | 'FASHION' | 'KERAJINAN' | 'LAINNYA';

export interface UMKMProduct {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  category: UMKMCategory;
  imageUrl: string; // Base64
  whatsapp: string; // Seller phone number
  isAvailable: boolean;
  createdAt: string;
}

export type ViewState = 
  | "DASHBOARD" 
  | "DATA_WARGA" 
  | "PERISTIWA"
  | "KEUANGAN" 
  | "SURAT" 
  | "AI_ASSISTANT"
  | "PENGUMUMAN"
  | "ASPIRASI"
  | "GALERI"
  | "PROFIL_RT"
  | "PENGATURAN"
  | "PROFIL_SAYA"
  | "ADMIN_NOTIFICATIONS"
  | "WAKAF"
  | "WARUNG_AMAL" 
  | "UMKM"
  | "MASJID"
  | "RIWAYAT_PERUBAHAN"
  | "BANSOS";

export type JenisBansos = "PKH" | "BLT" | "SEMBAKO" | "BST" | "LAINNYA";

export interface BansosDistribution {
  id: string;
  wargaId: string;
  jenisBansos: JenisBansos;
  periode: string; // e.g., "Januari 2024"
  tanggalSalur: string;
  jumlah: number;
  keterangan?: string;
  petugasPenyalur: string;
  buktiDokumentasi?: string; // Base64
}
