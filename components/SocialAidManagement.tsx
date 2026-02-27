import React, { useState, useMemo } from 'react';
import { 
  Users, Gift, Calendar, DollarSign, Plus, Search, Filter, 
  FileText, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Warga, BansosDistribution, JenisBansos, UserRole } from '../types';

interface SocialAidManagementProps {
  wargaList: Warga[];
  distributions: BansosDistribution[];
  onAddDistribution: (dist: BansosDistribution) => void;
  currentUser: Warga;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SocialAidManagement: React.FC<SocialAidManagementProps> = ({ 
  wargaList, distributions, onAddDistribution, currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'DISTRIBUTION' | 'REPORT'>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<JenisBansos | 'ALL'>('ALL');
  const [filterPeriod, setFilterPeriod] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recipientSearchTerm, setRecipientSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<BansosDistribution>>({
    jenisBansos: 'SEMBAKO',
    periode: new Date().getFullYear().toString(),
    tanggalSalur: new Date().toISOString().split('T')[0],
    jumlah: 0,
    keterangan: '',
    petugasPenyalur: currentUser.namaLengkap
  });
  const [selectedWargaId, setSelectedWargaId] = useState<string>('');

  // Derived Data
  const filteredDistributions = useMemo(() => {
    return distributions.filter(d => {
      const warga = wargaList.find(w => w.id === d.wargaId);
      const matchesSearch = warga?.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            warga?.nik.includes(searchTerm);
      const matchesType = filterType === 'ALL' || d.jenisBansos === filterType;
      const matchesPeriod = filterPeriod === 'ALL' || d.periode === filterPeriod;
      
      return matchesSearch && matchesType && matchesPeriod;
    });
  }, [distributions, wargaList, searchTerm, filterType, filterPeriod]);

  const stats = useMemo(() => {
    const totalAmount = distributions.reduce((acc, curr) => acc + curr.jumlah, 0);
    const totalRecipients = new Set(distributions.map(d => d.wargaId)).size;
    
    const byType = distributions.reduce((acc, curr) => {
      acc[curr.jenisBansos] = (acc[curr.jenisBansos] || 0) + curr.jumlah;
      return acc;
    }, {} as Record<string, number>);

    const chartDataByType = Object.keys(byType).map(key => ({
      name: key,
      value: byType[key]
    }));

    const byPeriod = distributions.reduce((acc, curr) => {
      acc[curr.periode] = (acc[curr.periode] || 0) + curr.jumlah;
      return acc;
    }, {} as Record<string, number>);

    const chartDataByPeriod = Object.keys(byPeriod).map(key => ({
      name: key,
      amount: byPeriod[key]
    }));

    return { totalAmount, totalRecipients, chartDataByType, chartDataByPeriod };
  }, [distributions]);

  const uniquePeriods = Array.from(new Set(distributions.map(d => d.periode)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaId || !formData.jumlah) return;

    const newDistribution: BansosDistribution = {
      id: Date.now().toString(),
      wargaId: selectedWargaId,
      jenisBansos: formData.jenisBansos as JenisBansos,
      periode: formData.periode || '',
      tanggalSalur: formData.tanggalSalur || '',
      jumlah: Number(formData.jumlah),
      keterangan: formData.keterangan,
      petugasPenyalur: formData.petugasPenyalur || currentUser.namaLengkap,
      buktiDokumentasi: ''
    };

    onAddDistribution(newDistribution);
    setIsFormOpen(false);
    setFormData({
      jenisBansos: 'SEMBAKO',
      periode: new Date().getFullYear().toString(),
      tanggalSalur: new Date().toISOString().split('T')[0],
      jumlah: 0,
      keterangan: '',
      petugasPenyalur: currentUser.namaLengkap
    });
    setSelectedWargaId('');
    setRecipientSearchTerm('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Gift className="text-rose-500" /> Manajemen Bantuan Sosial
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Kelola penyaluran bantuan sosial warga RT 06 RW 19</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'DASHBOARD' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('DISTRIBUTION')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'DISTRIBUTION' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          >
            Penyaluran
          </button>
          <button 
            onClick={() => setActiveTab('REPORT')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'REPORT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}
          >
            Laporan
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Penerima</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalRecipients}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Penyaluran</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(stats.totalAmount)}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Transaksi</p>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{distributions.length}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Penyaluran per Jenis Bantuan</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartDataByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.chartDataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Tren Penyaluran per Periode</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartDataByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="amount" fill="#82ca9d" name="Jumlah Penyaluran" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DISTRIBUTION' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari penerima (Nama/NIK)..." 
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as JenisBansos | 'ALL')}
              >
                <option value="ALL">Semua Jenis</option>
                <option value="PKH">PKH</option>
                <option value="BLT">BLT</option>
                <option value="SEMBAKO">Sembako</option>
                <option value="BST">BST</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition flex items-center gap-2 shadow-lg shadow-rose-100 dark:shadow-rose-900/20"
            >
              <Plus size={18} /> Catat Penyaluran
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Penerima</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis & Periode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Salur</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredDistributions.map((dist) => {
                  const warga = wargaList.find(w => w.id === dist.wargaId);
                  return (
                    <tr key={dist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">{warga?.namaLengkap || 'Unknown'}</span>
                          <span className="text-xs text-gray-500 font-mono">{warga?.nik}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-rose-600 dark:text-rose-400">{dist.jenisBansos}</span>
                          <span className="text-xs text-gray-500">{dist.periode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(dist.jumlah)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {dist.tanggalSalur}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dist.petugasPenyalur}
                      </td>
                    </tr>
                  );
                })}
                {filteredDistributions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data penyaluran yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'REPORT' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Laporan Penyaluran Bantuan Sosial</h3>
              <p className="text-gray-500">Periode: {filterPeriod === 'ALL' ? 'Semua Periode' : filterPeriod}</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Download size={18} /> Cetak Laporan
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter Periode Laporan</label>
            <select 
              className="w-full md:w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="ALL">Semua Periode</option>
              {uniquePeriods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">No</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Nama Penerima</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">NIK</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Jenis Bantuan</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Periode</th>
                  <th className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDistributions.map((dist, idx) => {
                  const warga = wargaList.find(w => w.id === dist.wargaId);
                  return (
                    <tr key={dist.id}>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200">{warga?.namaLengkap}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{warga?.nik}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{dist.jenisBansos}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{dist.periode}</td>
                      <td className="px-4 py-2 text-right font-mono text-gray-800 dark:text-gray-200">{formatCurrency(dist.jumlah)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 dark:bg-gray-900/50 font-bold">
                  <td colSpan={5} className="px-4 py-3 text-right text-gray-800 dark:text-white">Total Penyaluran</td>
                  <td className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">
                    {formatCurrency(filteredDistributions.reduce((acc, curr) => acc + curr.jumlah, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Catat Penyaluran Bantuan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penerima (Cari Warga)</label>
                <input
                  type="text"
                  placeholder="Ketik nama atau NIK untuk memfilter..."
                  className="w-full px-4 py-2 mb-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition text-sm"
                  value={recipientSearchTerm}
                  onChange={(e) => setRecipientSearchTerm(e.target.value)}
                />
                <select 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                  value={selectedWargaId}
                  onChange={(e) => setSelectedWargaId(e.target.value)}
                >
                  <option value="">Pilih Warga...</option>
                  {wargaList
                    .filter(w => w.statusKependudukan === 'AKTIF')
                    .filter(w => w.namaLengkap.toLowerCase().includes(recipientSearchTerm.toLowerCase()) || w.nik.includes(recipientSearchTerm))
                    .map(w => (
                    <option key={w.id} value={w.id}>{w.namaLengkap} - {w.nik}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Bantuan</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.jenisBansos}
                    onChange={(e) => setFormData({...formData, jenisBansos: e.target.value as JenisBansos})}
                  >
                    <option value="PKH">PKH</option>
                    <option value="BLT">BLT</option>
                    <option value="SEMBAKO">Sembako</option>
                    <option value="BST">BST</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periode</label>
                  <input 
                    required
                    type="text"
                    placeholder="Contoh: Jan 2024"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.periode}
                    onChange={(e) => setFormData({...formData, periode: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Salur</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.tanggalSalur}
                    onChange={(e) => setFormData({...formData, tanggalSalur: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah / Nilai (Rp)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({...formData, jumlah: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Petugas Penyalur</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.petugasPenyalur}
                    onChange={(e) => setFormData({...formData, petugasPenyalur: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan Tambahan</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 outline-none transition"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition shadow-lg shadow-rose-100 dark:shadow-rose-900/20"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialAidManagement;
