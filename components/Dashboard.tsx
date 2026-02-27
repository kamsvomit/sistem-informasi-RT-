
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Home, Wallet, Activity, MessageSquare, CreditCard, Bell, ArrowUpCircle, ArrowDownCircle, Building, Clock, Calendar, Moon, User } from 'lucide-react';
import { Warga, Keuangan, Gender, UserRole, Aspirasi, ViewState, StatusTinggal } from '../types';

interface DashboardProps {
  wargaList: Warga[];
  keuanganList: Keuangan[];
  aspirasiList: Aspirasi[];
  currentUser: Warga;
  onNavigate: (view: ViewState) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const AGE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
const STATUS_COLORS = ['#059669', '#2563eb', '#d97706']; // Emerald, Blue, Amber

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; subText?: string }> = ({ title, value, icon, color, subText }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 transition-colors">
    <div className={`p-3 rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ wargaList, keuanganList, aspirasiList, currentUser, onNavigate }) => {
  // --- Realtime Clock Logic ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatHijriDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date).replace('.', ':') + ' WIB';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // --- Common Logic ---
  const genderData = [
    { name: 'Laki-laki', value: wargaList.filter(w => w.jenisKelamin === Gender.LAKI_LAKI).length },
    { name: 'Perempuan', value: wargaList.filter(w => w.jenisKelamin === Gender.PEREMPUAN).length },
  ];

  // Logic Status Tinggal
  const statusTinggalData = [
    { name: 'Tetap', value: wargaList.filter(w => w.statusTinggal === StatusTinggal.TETAP || !w.statusTinggal).length },
    { name: 'Domisili', value: wargaList.filter(w => w.statusTinggal === StatusTinggal.TETAP_DOMISILI).length },
    { name: 'Musiman', value: wargaList.filter(w => w.statusTinggal === StatusTinggal.MUSIMAN).length },
  ];

  const agamaMap = wargaList.reduce((acc, curr) => {
    acc[curr.agama] = (acc[curr.agama] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const agamaData = Object.keys(agamaMap).map(key => ({
    name: key,
    value: agamaMap[key]
  }));

  // Logic Hitung Umur & Kategori
  const getAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const usiaMap = {
    'Balita (0-5)': 0,
    'Anak (6-12)': 0,
    'Remaja (13-17)': 0,
    'Dewasa (18-59)': 0,
    'Lansia (60+)': 0
  };

  wargaList.forEach(w => {
    const age = getAge(w.tanggalLahir);
    if (age <= 5) usiaMap['Balita (0-5)']++;
    else if (age <= 12) usiaMap['Anak (6-12)']++;
    else if (age <= 17) usiaMap['Remaja (13-17)']++;
    else if (age <= 59) usiaMap['Dewasa (18-59)']++;
    else usiaMap['Lansia (60+)']++;
  });

  const usiaData = Object.keys(usiaMap).map(key => ({
    name: key,
    value: usiaMap[key as keyof typeof usiaMap]
  }));

  // --- Financial Calculation (Global) ---
  const totalPemasukan = keuanganList
    .filter(k => k.tipe === 'PEMASUKAN')
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalPengeluaran = keuanganList
    .filter(k => k.tipe === 'PENGELUARAN')
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  // --- Reusable Header Component ---
  const WelcomeHeader = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {getGreeting()}, {currentUser.namaLengkap.split(' ')[0]} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md font-medium text-xs border border-emerald-100 dark:border-emerald-800">
            {currentUser.role}
          </span>
          <span>•</span>
          <span>RT 06 RW 19 Desa Rancamanyar</span>
        </p>
      </div>
      <div className="flex flex-col items-end w-full md:w-auto bg-gray-50 dark:bg-gray-900/50 md:bg-transparent p-3 md:p-0 rounded-lg">
        <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-tight leading-none mb-1">
          {formatTime(currentTime)}
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="text-gray-500 dark:text-gray-400 text-xs font-medium flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar size={12} /> {formatDate(currentTime)}
            </div>
            <div className="text-emerald-600 dark:text-emerald-500 text-xs font-bold flex items-center gap-1.5">
                <Moon size={12} className="fill-emerald-600 dark:fill-emerald-500" /> {formatHijriDate(currentTime)}
            </div>
        </div>
      </div>
    </div>
  );

  // --- Role Based Rendering ---

  // 1. DASHBOARD BENDAHARA
  if (currentUser.role === UserRole.BENDAHARA) {
    // Mock "Lunas" count for MVP
    const wargaLunas = 25; 
    const wargaNunggak = wargaList.length - wargaLunas;

    return (
      <div className="space-y-6">
        <WelcomeHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Pemasukan" value={`Rp ${totalPemasukan.toLocaleString('id-ID')}`} icon={<ArrowUpCircle size={24} />} color="bg-emerald-600" />
          <StatCard title="Total Pengeluaran" value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`} icon={<ArrowDownCircle size={24} />} color="bg-red-500" />
          <StatCard title="Saldo Kas Saat Ini" value={`Rp ${saldo.toLocaleString('id-ID')}`} icon={<Wallet size={24} />} color="bg-blue-600" />
          <StatCard title="Warga Belum Lunas" value={`${wargaNunggak} Org`} icon={<Users size={24} />} color="bg-amber-500" subText="Bulan berjalan" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Grafik Arus Kas</h3>
           <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
             <Activity size={32} className="mr-2" /> Visualisasi Arus Kas Bulanan (Fitur Lanjutan)
           </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD WARGA
  if (currentUser.role === UserRole.WARGA) {
    return (
      <div className="space-y-6">
        <WelcomeHeader />

        {/* Banner Pengumuman Dinamis */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building size={120} />
           </div>
           <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block">Info Warga</span>
              <p className="text-lg font-medium opacity-95 max-w-2xl leading-relaxed">
                Gunakan SIAGA ERGEN untuk melihat informasi RT, iuran, dan menyampaikan aspirasi warga secara tertib dan transparan.
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* Card Transparansi Kas RT */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-blue-600 dark:border-blue-500 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all dark:shadow-gray-900">
              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                   <Wallet size={18} className="text-blue-600 dark:text-blue-400" /> <span className="text-sm font-medium">Informasi Kas RT</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Rp {saldo.toLocaleString('id-ID')}</h3>
                <p className="text-xs text-gray-400 mt-1">Saldo Kas Terkini (Transparansi)</p>
              </div>
              <button 
                onClick={() => onNavigate('KEUANGAN')}
                className="mt-4 w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                Lihat Laporan
              </button>
           </div>

           {/* Card Iuran */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all dark:shadow-gray-900">
              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                   <CreditCard size={18} /> <span className="text-sm font-medium">Status Iuran Anda</span>
                </div>
                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">LUNAS</h3>
                <p className="text-xs text-gray-400 mt-1">Periode Mei 2024</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                 <button 
                    onClick={() => onNavigate('KEUANGAN')}
                    className="py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1"
                  >
                    <Wallet size={14} /> Bayar
                  </button>
                  <button 
                    onClick={() => onNavigate('KEUANGAN')}
                    className="py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                  >
                    Riwayat
                  </button>
              </div>
           </div>

           {/* Card Aspirasi */}
           <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all dark:shadow-gray-900">
              <div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                   <MessageSquare size={18} /> <span className="text-sm font-medium">Aspirasi Saya</span>
                </div>
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{aspirasiList.filter(a => a.wargaId === currentUser.id).length}</h3>
                <p className="text-xs text-gray-400 mt-1">Total Tiket Terkirim</p>
              </div>
              <button 
                onClick={() => onNavigate('ASPIRASI')}
                className="mt-4 w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
              >
                Buat Baru
              </button>
           </div>
        </div>

        {/* Statistik Kependudukan (New Section for Warga) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Users size={24} />
                    </div>
                    Demografi Warga RT 06
                </h3>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                    Update Terkini
                </span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                 <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                    <div className="mb-2 p-2 bg-white dark:bg-emerald-900/50 rounded-full shadow-sm text-emerald-600 dark:text-emerald-400">
                        <Users size={20} />
                    </div>
                    <h4 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{wargaList.length}</h4>
                    <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-1">Total Warga</p>
                 </div>
                 <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                    <div className="mb-2 p-2 bg-white dark:bg-blue-900/50 rounded-full shadow-sm text-blue-600 dark:text-blue-400">
                        <Home size={20} />
                    </div>
                    <h4 className="text-3xl font-black text-blue-700 dark:text-blue-400">{new Set(wargaList.map(w => w.noKK)).size}</h4>
                    <p className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-widest mt-1">Total KK</p>
                 </div>
                 <div className="p-5 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-900/10 rounded-2xl border border-cyan-100 dark:border-cyan-800/50 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                    <div className="mb-2 p-2 bg-white dark:bg-cyan-900/50 rounded-full shadow-sm text-cyan-600 dark:text-cyan-400">
                        <User size={20} />
                    </div>
                    <h4 className="text-3xl font-black text-cyan-700 dark:text-cyan-400">{wargaList.filter(w => w.jenisKelamin === Gender.LAKI_LAKI).length}</h4>
                    <p className="text-[10px] font-bold text-cyan-600/70 dark:text-cyan-400/70 uppercase tracking-widest mt-1">Laki-laki</p>
                 </div>
                 <div className="p-5 bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-800/50 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
                    <div className="mb-2 p-2 bg-white dark:bg-pink-900/50 rounded-full shadow-sm text-pink-500 dark:text-pink-400">
                        <User size={20} />
                    </div>
                    <h4 className="text-3xl font-black text-pink-600 dark:text-pink-400">{wargaList.filter(w => w.jenisKelamin === Gender.PEREMPUAN).length}</h4>
                    <p className="text-[10px] font-bold text-pink-500/70 dark:text-pink-400/70 uppercase tracking-widest mt-1">Perempuan</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Gender Chart */}
                <div className="min-h-[300px] border border-gray-100 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span> Komposisi Gender
                    </h4>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Tinggal Chart */}
                <div className="min-h-[300px] border border-gray-100 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm flex flex-col">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-emerald-500 rounded-full"></span> Status Tempat Tinggal
                    </h4>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusTinggalData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusTinggalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Age Chart */}
                <div className="min-h-[300px] border border-gray-100 dark:border-gray-700 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm flex flex-col md:col-span-2 lg:col-span-1">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-4 bg-amber-500 rounded-full"></span> Distribusi Usia
                    </h4>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usiaData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {usiaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // 3. DASHBOARD KETUA RT / ADMIN / SEKRETARIS
  // Default View for Admins
  const totalWarga = wargaList.length;
  const totalKK = new Set(wargaList.map(w => w.noKK)).size;
  const aspirasiBaru = aspirasiList.filter(a => a.status === 'BARU').length;

  return (
    <div className="space-y-8">
      <WelcomeHeader />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">Total</span>
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-1">{totalWarga}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Warga Terdaftar</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Home size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">KK</span>
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-1">{totalKK}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kepala Keluarga</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Wallet size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">+5%</span>
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-1">Rp {saldo.toLocaleString('id-ID')}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Kas RT</p>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
                    <MessageSquare size={24} />
                </div>
                {aspirasiBaru > 0 && (
                    <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full animate-pulse">Baru</span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-1">{aspirasiBaru}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aspirasi Menunggu</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span> Demografi Gender
              </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residency Status Distribution (Status Tinggal) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-emerald-500 rounded-full"></span> Status Tempat Tinggal
              </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusTinggalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusTinggalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Religion Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-purple-500 rounded-full"></span> Distribusi Agama
              </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agamaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#9ca3af'}} interval={0} />
                <YAxis allowDecimals={false} tick={{fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Age Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="w-1 h-5 bg-amber-500 rounded-full"></span> Kategori Usia
              </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usiaData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis type="number" allowDecimals={false} tick={{fill: '#9ca3af'}} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '0.75rem' }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {usiaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
