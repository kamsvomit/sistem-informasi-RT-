
import React, { useState } from 'react';
import { Users, FileText, Shield, BarChart3, ArrowRight, MessageSquare, Building, LogIn, UserPlus, BookOpen, Smartphone, CreditCard, CheckCircle2, ChevronRight, Zap, BellRing, Image as ImageIcon, Bot, ShieldCheck, MapPin } from 'lucide-react';
import { Warga, AppConfig } from '../types';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
  appConfig: AppConfig;
  wargaList: Warga[];
}

type GuideCategory = 'REGISTRASI' | 'IURAN' | 'SURAT';

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, appConfig, wargaList }) => {
  const [activeGuide, setActiveGuide] = useState<GuideCategory>('REGISTRASI');

  // Statistics Calculation
  const totalWarga = wargaList.length;
  const totalKK = new Set(wargaList.map(w => w.noKK)).size;
  const totalLaki = wargaList.filter(w => w.jenisKelamin === 'LAKI-LAKI').length;
  const totalPerempuan = wargaList.filter(w => w.jenisKelamin === 'PEREMPUAN').length;

  const guideSteps = {
    REGISTRASI: [
      { id: 1, title: 'Klik Daftar', desc: 'Tekan tombol "Daftar" di pojok kanan atas.', icon: <UserPlus size={20} /> },
      { id: 2, title: 'Isi Data Diri', desc: 'Masukkan NIK, Nama Lengkap, dan No WA aktif.', icon: <FileText size={20} /> },
      { id: 3, title: 'Verifikasi & Login', desc: 'Masukkan kode OTP (jika ada) dan login ke akun.', icon: <CheckCircle2 size={20} /> }
    ],
    IURAN: [
      { id: 1, title: 'Menu Keuangan', desc: 'Masuk ke dashboard dan pilih menu Keuangan.', icon: <BarChart3 size={20} /> },
      { id: 2, title: 'Bayar Iuran', desc: 'Klik tombol "Bayar", pilih bulan dan metode (QRIS/Transfer).', icon: <CreditCard size={20} /> },
      { id: 3, title: 'Konfirmasi', desc: 'Sistem mencatat otomatis, status menunggu verifikasi.', icon: <CheckCircle2 size={20} /> }
    ],
    SURAT: [
      { id: 1, title: 'Menu Surat', desc: 'Pilih menu "Layanan Surat" di dashboard.', icon: <FileText size={20} /> },
      { id: 2, title: 'Isi Keperluan', desc: 'Pilih jenis surat dan tulis tujuan pembuatan.', icon: <MessageSquare size={20} /> },
      { id: 3, title: 'Unduh Draft', desc: 'AI akan membuatkan draft, unduh dan minta TTD RT.', icon: <ArrowRight size={20} /> }
    ]
  };

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {appConfig.logoUrl ? (
                <img src={appConfig.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white" />
              ) : (
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">RT</div>
              )}
              <span className="font-bold text-xl text-emerald-800 tracking-tight">{appConfig.appName}</span>
            </div>
            
            {/* Desktop Menu Link */}
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
                <button onClick={() => scrollToId('fitur-section')} className="hover:text-emerald-600 transition">Fitur Unggulan</button>
                <button onClick={() => scrollToId('panduan-section')} className="hover:text-emerald-600 transition">Panduan</button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={onLogin}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition flex items-center gap-2"
              >
                <LogIn size={16} /> <span className="hidden sm:inline">Masuk</span>
              </button>
              <button 
                onClick={onRegister}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition flex items-center gap-2 shadow-lg shadow-emerald-100"
              >
                <UserPlus size={16} /> <span className="hidden sm:inline">Daftar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-6 border border-emerald-200">
            <Building size={12} /> {appConfig.regionName}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Transformasi Digital <br/> <span className="text-emerald-600">Lingkungan Rukun Tetangga</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            {appConfig.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onRegister}
              className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 group"
            >
              Mulai Bergabung <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
             <button 
              onClick={() => scrollToId('fitur-section')}
              className="px-8 py-4 bg-white text-emerald-700 border border-emerald-200 rounded-full font-bold text-lg hover:bg-emerald-50 transition shadow-sm flex items-center justify-center gap-2"
            >
              Lihat Fitur
            </button>
          </div>
        </div>
      </section>

      {/* Population Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-sm group-hover:rotate-12 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="text-4xl font-black text-emerald-700 mb-1">{totalWarga}</h3>
                    <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest">Total Warga</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm group-hover:rotate-12 transition-transform">
                        <Building size={24} />
                    </div>
                    <h3 className="text-4xl font-black text-blue-700 mb-1">{totalKK}</h3>
                    <p className="text-xs font-bold text-blue-600/70 uppercase tracking-widest">Kepala Keluarga</p>
                </div>
                <div className="p-6 bg-cyan-50 rounded-2xl border border-cyan-100 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-600 mx-auto mb-4 shadow-sm group-hover:rotate-12 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="text-4xl font-black text-cyan-700 mb-1">{totalLaki}</h3>
                    <p className="text-xs font-bold text-cyan-600/70 uppercase tracking-widest">Laki-laki</p>
                </div>
                <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100 text-center group hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-pink-500 mx-auto mb-4 shadow-sm group-hover:rotate-12 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="text-4xl font-black text-pink-600 mb-1">{totalPerempuan}</h3>
                    <p className="text-xs font-bold text-pink-500/70 uppercase tracking-widest">Perempuan</p>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section (RESTRUCTURED) */}
      <section id="fitur-section" className="py-24 px-4 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Ecosystem Siaga Ergen</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Fitur Cerdas untuk Semua</h3>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">Dirancang khusus untuk memenuhi kompleksitas administrasi kependudukan di tingkat RT dengan pendekatan modern dan transparan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Resident Database */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <Users size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Sistem Data Terpusat</h4>
              <p className="text-gray-600 leading-relaxed mb-6">Manajemen data kependudukan, Kartu Keluarga, dan riwayat mutasi warga secara digital. Data tersimpan aman dan terstruktur.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={16} /> Validasi NIK & Dokumen
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={16} /> Manajemen Role Pengurus
                </li>
              </ul>
            </div>

            {/* Feature 2: Finance */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <BarChart3 size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Kas & Iuran Transparan</h4>
              <p className="text-gray-600 leading-relaxed mb-6">Laporan pemasukan dan pengeluaran kas RT secara real-time. Warga dapat memantau saldo dan status iuran secara terbuka.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <CheckCircle2 size={16} /> Verifikasi Bukti Transfer
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <CheckCircle2 size={16} /> Grafik Arus Kas Bulanan
                </li>
              </ul>
            </div>

            {/* Feature 3: AI Assistant */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-emerald-900 text-white hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <Bot size={28} />
              </div>
              <h4 className="text-xl font-bold mb-4">Asisten AI "Pak RT"</h4>
              <p className="text-emerald-100/80 leading-relaxed mb-6">Didukung Gemini AI untuk membantu pembuatan draf surat pengantar, pengumuman, dan menjawab pertanyaan operasional RT.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Zap size={16} /> Generasi Surat Otomatis
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Zap size={16} /> Chat Bot 24/7
                </li>
              </ul>
            </div>

            {/* Feature 4: Broadcast Notif */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <BellRing size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Broadcast Notifikasi</h4>
              <p className="text-gray-600 leading-relaxed mb-6">Sistem pengumuman cerdas yang otomatis mengirimkan pemberitahuan penting ke dashboard dan simulasi WhatsApp warga.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-orange-700">
                  <CheckCircle2 size={16} /> Notifikasi Iuran & Berita
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-orange-700">
                  <CheckCircle2 size={16} /> Label Pengumuman Penting
                </li>
              </ul>
            </div>

            {/* Feature 5: Aspirasi & Galeri */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <MessageSquare size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Interaksi Komunitas</h4>
              <p className="text-gray-600 leading-relaxed mb-6">Wadah aspirasi digital dan galeri dokumentasi kegiatan lingkungan untuk membangun rasa memiliki antar warga.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-purple-700">
                  <CheckCircle2 size={16} /> Tracking Status Aspirasi
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-purple-700">
                  <CheckCircle2 size={16} /> Arsip Foto Kegiatan
                </li>
              </ul>
            </div>

            {/* Feature 6: Security */}
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Keamanan Data Lapis</h4>
              <p className="text-gray-600 leading-relaxed mb-6">Sistem keamanan dengan verifikasi identitas warga dan proteksi data pribadi sesuai standar privasi informasi.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                  <CheckCircle2 size={16} /> Verifikasi Warga Baru
                </li>
                <li className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                  <CheckCircle2 size={16} /> Backup Data Rutin
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Section */}
      <section id="panduan-section" className="py-24 px-4 bg-emerald-50/50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Onboarding</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 flex items-center justify-center gap-3">
                    <BookOpen className="text-emerald-600" /> Panduan Penggunaan
                </h3>
                <p className="text-gray-500 font-medium">Ikuti langkah mudah berikut untuk mulai menggunakan layanan digital RT 06.</p>
            </div>

            {/* Guide Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {[
                    { id: 'REGISTRASI', label: 'Daftar Warga', icon: <UserPlus size={16}/> },
                    { id: 'IURAN', label: 'Bayar Iuran', icon: <CreditCard size={16}/> },
                    { id: 'SURAT', label: 'Buat Surat', icon: <FileText size={16}/> }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveGuide(tab.id as GuideCategory)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition flex items-center gap-2 border-2 ${
                            activeGuide === tab.id 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' 
                            : 'bg-white text-gray-600 border-gray-100 hover:border-emerald-200'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Guide Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                {guideSteps[activeGuide].map((step, index) => (
                    <div key={step.id} className="bg-white rounded-3xl p-8 border border-gray-100 relative group hover:border-emerald-200 transition shadow-sm hover:shadow-xl duration-300">
                        <div className="absolute top-6 right-6 text-gray-100 font-black text-6xl group-hover:text-emerald-50 transition-colors">
                            0{index + 1}
                        </div>
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl shadow-inner flex items-center justify-center text-emerald-600 mb-8 border border-emerald-100 group-hover:scale-110 transition-transform">
                            {step.icon}
                        </div>
                        <h3 className="font-extrabold text-gray-800 text-xl mb-3 relative z-10">{step.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-medium relative z-10">
                            {step.desc}
                        </p>
                        
                        {/* Connector Line for Desktop */}
                        {index < 2 && (
                            <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20 text-emerald-100">
                                <ChevronRight size={32} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-emerald-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <Zap className="absolute top-10 left-10 w-64 h-64" />
           <Building className="absolute bottom-10 right-10 w-64 h-64" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">Wujudkan Lingkungan yang <br/> <span className="text-emerald-400">Lebih Tertib & Terdigitalisasi</span></h2>
          <p className="text-emerald-100/80 mb-10 text-xl font-medium">
            Mari berpartisipasi aktif dalam memajukan administrasi lingkungan kita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onRegister}
              className="px-10 py-5 bg-white text-emerald-900 rounded-full font-black text-xl hover:bg-emerald-50 transition shadow-2xl shadow-black/20"
            >
              Mulai Daftar Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">RT</div>
                <h4 className="font-extrabold text-2xl text-emerald-800 tracking-tight">{appConfig.appName}</h4>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">Platform tata kelola lingkungan Rukun Tetangga yang cerdas, aman, dan transparan untuk masa depan desa digital.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-12">
             <div>
                <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6">Navigasi</h5>
                <ul className="space-y-4 text-sm font-bold text-gray-500">
                    <li><button onClick={() => scrollToId('fitur-section')} className="hover:text-emerald-600 transition">Fitur</button></li>
                    <li><button onClick={() => scrollToId('panduan-section')} className="hover:text-emerald-600 transition">Panduan</button></li>
                    <li><button onClick={onLogin} className="hover:text-emerald-600 transition">Masuk</button></li>
                </ul>
             </div>
             <div className="text-left md:text-right">
                <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6">Kontak Wilayah</h5>
                <p className="text-sm font-bold text-gray-500 mb-2">Sekretariat RT 06 RW 19</p>
                <p className="text-sm font-medium text-gray-400">{appConfig.regionName}</p>
                <div className="mt-6 flex justify-start md:justify-end gap-4 text-gray-400">
                   <MapPin size={20} />
                   <Shield size={20} />
                </div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-200 mt-16 pt-8 text-center md:text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                &copy; {new Date().getFullYear()} {appConfig.appName} • Dirancang untuk Desa Rancamanyar
            </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
