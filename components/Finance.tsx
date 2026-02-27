
import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Lock, Filter, CreditCard, Wallet, QrCode, Banknote, CheckCircle, Clock, Smartphone, X, Heart, Share2, Mail, Users, FileText, AlertCircle, RefreshCw, BarChart2, Calendar, MapPin, CheckSquare, Square, Settings, Upload, Image as ImageIcon, Search, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Keuangan, Warga, UserRole, UserNotification, PaymentMethod, TransactionStatus, AppConfig } from '../types';

interface FinanceProps {
  keuanganList: Keuangan[];
  wargaList: Warga[];
  onAddTransaksi: (data: Keuangan) => void;
  onDeleteTransaksi: (id: string) => void;
  onSendNotification: (notif: UserNotification) => void;
  currentUser: Warga;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  appConfig: AppConfig;
  onUpdateAppConfig: (config: AppConfig) => void;
}

const Finance: React.FC<FinanceProps> = ({ keuanganList, wargaList, onAddTransaksi, onDeleteTransaksi, onSendNotification, currentUser, onShowToast, appConfig, onUpdateAppConfig }) => {
  const [activeTab, setActiveTab] = useState<'KAS_RT' | 'IURAN' | 'VERIFIKASI'>('IURAN'); 
  
  // Admin Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Keuangan>>({
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'PEMASUKAN',
    jumlah: 0,
    kategori: '',
    keterangan: '',
    status: 'LUNAS',
    metodePembayaran: 'TUNAI'
  });
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState({
      besaran: appConfig.iuranConfig?.besaran || 50000,
      nama: appConfig.iuranConfig?.nama || 'Iuran Wajib & Sampah'
  });

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerifModal, setShowVerifModal] = useState<Keuangan | null>(null);
  
  // Data pembayaran & Custom Iuran State
  const [paymentData, setPaymentData] = useState({
    amount: 50000, 
    category: 'Iuran Wajib',
    method: 'QRIS' as PaymentMethod,
    type: 'IURAN' as 'IURAN' | 'DONASI',
    note: '',
    fotoBukti: ''
  });

  // State untuk Custom Iuran (Bulan/Tahun)
  const [payYear, setPayYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthIndexes, setSelectedMonthIndexes] = useState<number[]>([]);

  // State untuk memilih warga yang membayar/menerima (Admin only)
  const [selectedWargaId, setSelectedWargaId] = useState<string>('');

  // Filter State
  const [filterMonth, setFilterMonth] = useState<string>(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterWargaId, setFilterWargaId] = useState<string>('ALL');
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Access Control
  const isAdmin = [UserRole.BENDAHARA, UserRole.KETUA_RT, UserRole.SUPER_ADMIN].includes(currentUser.role);
  const isCitizen = currentUser.role === UserRole.WARGA || currentUser.role === UserRole.PENGURUS;

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  // Dynamic Configuration
  const currentTariff = appConfig.iuranConfig?.besaran || 50000;
  const currentBillName = appConfig.iuranConfig?.nama || 'Iuran Wajib';

  // --- COMPUTED DATA ---
  const iuranTransactions = useMemo(() => {
    return keuanganList.filter(k => {
        const isUserMatch = isAdmin ? (filterWargaId === 'ALL' || k.wargaId === filterWargaId) : k.wargaId === currentUser.id;
        return isUserMatch;
    }).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [keuanganList, filterWargaId, isAdmin, currentUser.id]);

  const displayedTransactions = showAllTransactions ? iuranTransactions : iuranTransactions.slice(0, 10);

  // --- HELPER: Notify Admins ---
  const notifyAdmins = (message: string) => {
    const admins = wargaList.filter(w => [UserRole.BENDAHARA, UserRole.KETUA_RT].includes(w.role));
    admins.forEach(admin => {
        onSendNotification({
            id: `NOTIF-PAY-${Date.now()}-${admin.id}`,
            userId: admin.id,
            pesan: message,
            tipe: 'IURAN',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    });
  };

  // --- HANDLER: Upload Bukti Bayar ---
  const handleBuktiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("Ukuran bukti terlalu besar (Max 2MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentData(prev => ({ ...prev, fotoBukti: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ADMIN: Verifikasi Pembayaran ---
  const handleApprovePayment = (trx: Keuangan) => {
    onDeleteTransaksi(trx.id);
    const updatedTrx: Keuangan = { ...trx, status: 'LUNAS' };
    onAddTransaksi(updatedTrx);
    
    if (trx.wargaId) {
        onSendNotification({
            id: `VERIF-SUCC-${Date.now()}-${trx.wargaId}`,
            userId: trx.wargaId,
            pesan: `✅ Pembayaran '${trx.kategori}' Anda telah diverifikasi LUNAS oleh Bendahara.`,
            tipe: 'IURAN',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    }
    
    setShowVerifModal(null);
    onShowToast("Pembayaran berhasil disetujui.", "success");
  };

  const handleRejectPayment = (trx: Keuangan) => {
    const reason = prompt("Masukkan alasan penolakan pembayaran:");
    if (reason === null) return;

    onDeleteTransaksi(trx.id);
    const rejectedTrx: Keuangan = { ...trx, status: 'TAGIHAN', alasanPenolakan: reason };
    onAddTransaksi(rejectedTrx);
    
    if (trx.wargaId) {
        onSendNotification({
            id: `VERIF-REJ-${Date.now()}-${trx.wargaId}`,
            userId: trx.wargaId,
            pesan: `❌ Pembayaran '${trx.kategori}' DITOLAK: ${reason}. Mohon kirim ulang bukti yang benar.`,
            tipe: 'IURAN',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    }
    
    setShowVerifModal(null);
    onShowToast("Pembayaran ditolak.", "error");
  };

  // --- HANDLER: Citizen Payment Submission ---
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Bukti untuk metode non-tunai
    if (paymentData.method !== 'TUNAI' && !paymentData.fotoBukti) {
      onShowToast("Mohon unggah foto bukti transfer/bayar.", "error");
      return;
    }

    if (paymentData.type === 'IURAN') {
        if (selectedMonthIndexes.length === 0) {
            onShowToast("Pilih minimal satu bulan untuk dibayar.", "error");
            return;
        }

        let totalPaid = 0;
        selectedMonthIndexes.forEach(monthIdx => {
            const monthName = monthNames[monthIdx];
            const existingBill = keuanganList.find(k => 
              k.wargaId === currentUser.id &&
              k.kategori === currentBillName &&
              k.keterangan.includes(monthName) &&
              k.keterangan.includes(payYear.toString())
            );

            if (existingBill) {
                onDeleteTransaksi(existingBill.id);
                onAddTransaksi({
                    ...existingBill,
                    status: 'MENUNGGU_VERIFIKASI',
                    metodePembayaran: paymentData.method,
                    fotoBukti: paymentData.fotoBukti,
                    tanggal: new Date().toISOString().split('T')[0],
                });
            } else {
                onAddTransaksi({
                    id: `PAY-${Date.now()}-${monthIdx}-${currentUser.id}`,
                    tanggal: new Date().toISOString().split('T')[0],
                    tipe: 'PEMASUKAN',
                    kategori: currentBillName,
                    jumlah: currentTariff,
                    keterangan: `${currentBillName} Bulan ${monthName} ${payYear}`,
                    wargaId: currentUser.id,
                    metodePembayaran: paymentData.method,
                    fotoBukti: paymentData.fotoBukti,
                    status: 'MENUNGGU_VERIFIKASI'
                });
            }
            totalPaid += currentTariff;
        });

        notifyAdmins(`💡 Pembayaran Baru: ${currentUser.namaLengkap} membayar Rp ${totalPaid.toLocaleString('id-ID')} (Perlu Verifikasi)`);
    } else {
        const newTransaction: Keuangan = {
            id: Date.now().toString(),
            tanggal: new Date().toISOString().split('T')[0],
            tipe: 'PEMASUKAN',
            kategori: paymentData.category,
            jumlah: Number(paymentData.amount),
            keterangan: paymentData.note || `Donasi dari ${currentUser.namaLengkap}`,
            wargaId: currentUser.id,
            metodePembayaran: paymentData.method,
            fotoBukti: paymentData.fotoBukti,
            status: 'MENUNGGU_VERIFIKASI'
        };
        onAddTransaksi(newTransaction);
        notifyAdmins(`💡 Donasi Baru: ${currentUser.namaLengkap} sebesar Rp ${Number(paymentData.amount).toLocaleString('id-ID')} (Perlu Verifikasi)`);
    }

    setShowPaymentModal(false);
    setShowSuccessModal(true);
    setSelectedMonthIndexes([]);
  };

  const handleGenerateBills = () => {
    const selectedMonthName = monthNames[parseInt(filterMonth)];
    const selectedYearVal = parseInt(filterYear);

    if(!window.confirm(`Buat tagihan '${currentBillName}' sebesar Rp ${currentTariff.toLocaleString('id-ID')} Periode ${selectedMonthName} ${selectedYearVal}?`)) return;

    let count = 0;
    wargaList.filter(w => w.statusKependudukan === 'AKTIF').forEach((warga, idx) => {
        const exists = keuanganList.find(k => 
            k.wargaId === warga.id && 
            k.kategori === currentBillName && 
            k.keterangan.includes(selectedMonthName) &&
            k.keterangan.includes(selectedYearVal.toString())
        );

        if (!exists) {
            onAddTransaksi({
                id: `BILL-${Date.now()}-${idx}-${warga.id}`,
                tanggal: new Date().toISOString().split('T')[0],
                tipe: 'PEMASUKAN',
                kategori: currentBillName,
                jumlah: currentTariff, 
                keterangan: `${currentBillName} Bulan ${selectedMonthName} ${selectedYearVal}`,
                wargaId: warga.id,
                status: 'TAGIHAN',
                metodePembayaran: undefined
            });
            count++;
        }
    });

    onShowToast(`Berhasil menerbitkan ${count} tagihan baru.`, "success");
  };

  const handleSubmitKas = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaksi({
      ...formData,
      id: Date.now().toString(),
      jumlah: Number(formData.jumlah),
      wargaId: selectedWargaId || undefined
    } as Keuangan);
    setShowForm(false);
    onShowToast("Transaksi berhasil dicatat.", "success");
  };

  // --- DATA COMPUTATION ---
  const pendingVerifications = useMemo(() => 
    keuanganList.filter(k => k.status === 'MENUNGGU_VERIFIKASI'), 
  [keuanganList]);

  const kasRtList = keuanganList.filter(item => {
    const d = new Date(item.tanggal);
    const isDateMatch = d.getMonth() === parseInt(filterMonth) && d.getFullYear() === parseInt(filterYear);
    return isDateMatch && item.status === 'LUNAS';
  }).sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const totalMasuk = kasRtList.filter(k => k.tipe === 'PEMASUKAN').reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalKeluar = kasRtList.filter(k => k.tipe === 'PENGELUARAN').reduce((acc, curr) => acc + curr.jumlah, 0);

  const myUnpaidBills = keuanganList.filter(k => k.wargaId === currentUser.id && (k.status === 'TAGIHAN' || k.status === 'DITOLAK'));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Keuangan & Iuran</h2>
        
        {/* Toggle Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('KAS_RT')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'KAS_RT' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
                <Wallet size={16} /> Kas RT
            </button>
            <button 
                onClick={() => setActiveTab('IURAN')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'IURAN' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
                <Users size={16} /> Iuran Warga
            </button>
            {isAdmin && (
                <button 
                    onClick={() => setActiveTab('VERIFIKASI')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'VERIFIKASI' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    <CheckCircle size={16} /> 
                    Verifikasi
                    {pendingVerifications.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                            {pendingVerifications.length}
                        </span>
                    )}
                </button>
            )}
        </div>
      </div>

      {/* Filter Bar */}
      {activeTab !== 'VERIFIKASI' && (
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex items-center gap-4 flex-wrap">
                {activeTab === 'KAS_RT' ? (
                    <>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2"><Filter size={16} /> Filter Periode:</span>
                        <div className="flex items-center gap-2">
                            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none">
                                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none">
                                {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </>
                ) : (
                    isAdmin && (
                        <>
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2"><Users size={16} /> Filter Warga:</span>
                            <select value={filterWargaId} onChange={(e) => setFilterWargaId(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none max-w-[200px]">
                                <option value="ALL">Semua Warga</option>
                                {wargaList.map(w => <option key={w.id} value={w.id}>{w.namaLengkap}</option>)}
                            </select>
                        </>
                    )
                )}
            </div>
            {isAdmin && activeTab === 'KAS_RT' && (
                <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium">
                    <Plus size={16} /> Catat Manual
                </button>
            )}
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'KAS_RT' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><ArrowUpCircle size={14} className="text-emerald-500"/> Pemasukan Lunas</p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Rp {totalMasuk.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><ArrowDownCircle size={14} className="text-red-500"/> Pengeluaran</p>
                    <h3 className="text-2xl font-bold text-red-500 dark:text-red-400">Rp {totalKeluar.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Surplus Kas</p>
                    <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rp {(totalMasuk - totalKeluar).toLocaleString('id-ID')}</h3>
                </div>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-emerald-100 dark:border-emerald-900 animate-in zoom-in-95">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Catat Transaksi Manual</h3>
                    <form onSubmit={handleSubmitKas} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Tanggal</label>
                            <input type="date" required className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white outline-none" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Tipe</label>
                            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white outline-none" value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value as any})} >
                                <option value="PEMASUKAN">Pemasukan</option>
                                <option value="PENGELUARAN">Pengeluaran</option>
                            </select>
                        </div>
                        <input type="text" placeholder="Kategori (mis: Iuran Warga)" required className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white outline-none" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} />
                        <input type="number" placeholder="Nominal (Rp)" required className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white outline-none" value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: Number(e.target.value)})} />
                        <input type="text" placeholder="Keterangan Lengkap" className="md:col-span-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white outline-none" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-600 dark:text-gray-300">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded text-sm font-bold">Simpan Transaksi</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-4">Tanggal</th>
                            <th className="px-6 py-4">Kategori & Keterangan</th>
                            <th className="px-6 py-4 text-right">Debit</th>
                            <th className="px-6 py-4 text-right">Kredit</th>
                            {isAdmin && <th className="px-6 py-4 text-center">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {kasRtList.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{item.tanggal}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800 dark:text-gray-200">{item.kategori}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.keterangan}</div>
                                </td>
                                <td className="px-6 py-4 text-right text-red-500 dark:text-red-400 font-medium">{item.tipe === 'PENGELUARAN' ? `-Rp ${item.jumlah.toLocaleString('id-ID')}` : '-'}</td>
                                <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{item.tipe === 'PEMASUKAN' ? `+Rp ${item.jumlah.toLocaleString('id-ID')}` : '-'}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => { if(window.confirm('Hapus record ini?')) onDeleteTransaksi(item.id); }} className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"><Trash2 size={16} /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'IURAN' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Citizen Alert: Tunggakan */}
            {isCitizen && myUnpaidBills.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center justify-between gap-4 animate-bounce">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-amber-600 dark:text-amber-500" size={24} />
                        <div>
                            <h4 className="font-bold text-amber-800 dark:text-amber-400">Anda Memiliki {myUnpaidBills.length} Tagihan</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Mohon segera lakukan pembayaran untuk kelancaran RT.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => { setShowPaymentModal(true); setPaymentData({...paymentData, type: 'IURAN'}); }}
                        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg"
                    >
                        Bayar Sekarang
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={20}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Manajemen Iuran Warga</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pantau kepatuhan iuran warga aktif di RT 06.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button onClick={handleGenerateBills} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                            <RefreshCw size={16} /> Terbitkan Tagihan
                        </button>
                    )}
                    <button onClick={() => setShowPaymentModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                        <CreditCard size={16} /> Donasi / Bayar Iuran
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {displayedTransactions.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${
                                item.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                item.status === 'MENUNGGU_VERIFIKASI' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                item.status === 'DITOLAK' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                                {item.status === 'LUNAS' ? <CheckCircle size={20}/> : <Clock size={20}/>}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{item.kategori}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.keterangan} • {item.tanggal}</p>
                                {item.alasanPenolakan && <p className="text-[10px] text-red-500 font-bold mt-1">Alasan Penolakan: {item.alasanPenolakan}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 dark:text-gray-200">Rp {item.jumlah.toLocaleString('id-ID')}</p>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                item.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                item.status === 'MENUNGGU_VERIFIKASI' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                item.status === 'DITOLAK' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {item.status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {iuranTransactions.length > 10 && (
                <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="w-full py-3 text-center text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition border border-emerald-100 dark:border-emerald-900/50">
                    {showAllTransactions ? 'Tampilkan Lebih Sedikit' : `Lihat Semua Riwayat (${iuranTransactions.length})`}
                </button>
            )}
        </div>
      )}

      {activeTab === 'VERIFIKASI' && isAdmin && (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                    <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} /> 
                    Menunggu Verifikasi 
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">{pendingVerifications.length}</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingVerifications.map(trx => {
                        const warga = wargaList.find(w => w.id === trx.wargaId);
                        return (
                            <div key={trx.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col justify-between group hover:border-blue-300 transition shadow-sm">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{trx.metodePembayaran?.replace('_', ' ')}</span>
                                        <span className="text-[10px] text-gray-400 font-mono">#{trx.id.slice(-6)}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{warga?.namaLengkap || 'Warga'}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{trx.kategori} • {trx.tanggal}</p>
                                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-3">Rp {trx.jumlah.toLocaleString('id-ID')}</p>
                                    
                                    {trx.fotoBukti ? (
                                        <button 
                                            onClick={() => setShowVerifModal(trx)}
                                            className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-500 relative group"
                                        >
                                            <img src={trx.fotoBukti} alt="Bukti" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                                <ImageIcon className="text-white" size={24} />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="h-32 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-300 border border-dashed border-gray-200 dark:border-gray-500 text-xs">
                                            Tanpa Bukti Gambar
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleRejectPayment(trx)}
                                        className="flex-1 py-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Tolak
                                    </button>
                                    <button 
                                        onClick={() => handleApprovePayment(trx)}
                                        className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                    >
                                        Setujui
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {pendingVerifications.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 dark:text-gray-500">
                            <CheckCircle size={48} className="mx-auto mb-4 opacity-10" />
                            <p>Semua pembayaran sudah diverifikasi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* PAYMENT MODAL (CITIZEN) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Wallet size={24} /> Konfirmasi Pembayaran
                    </h3>
                    <button onClick={() => setShowPaymentModal(false)}><X size={24}/></button>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPaymentData({...paymentData, type: 'IURAN'})} className={`p-3 rounded-xl border-2 transition ${paymentData.type === 'IURAN' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                            <Banknote className="mx-auto mb-1" />
                            <span className="text-xs font-bold">Iuran Wajib</span>
                        </button>
                        <button type="button" onClick={() => setPaymentData({...paymentData, type: 'DONASI'})} className={`p-3 rounded-xl border-2 transition ${paymentData.type === 'DONASI' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                            <Heart className="mx-auto mb-1" />
                            <span className="text-xs font-bold">Donasi Amal</span>
                        </button>
                    </div>

                    {paymentData.type === 'IURAN' ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
                             <div className="flex justify-between items-center">
                                <button type="button" onClick={() => setPayYear(payYear - 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"><ChevronRight className="rotate-180" size={16}/></button>
                                <span className="font-bold text-gray-800 dark:text-white">Tahun {payYear}</span>
                                <button type="button" onClick={() => setPayYear(payYear + 1)} className="p-1 hover:bg-white dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"><ChevronRight size={16}/></button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {monthNames.map((m, idx) => (
                                    <button 
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedMonthIndexes(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition ${selectedMonthIndexes.includes(idx) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}
                                    >
                                        {m.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-gray-800 dark:text-white">
                                <span>Total Tagihan</span>
                                <span>Rp {(selectedMonthIndexes.length * currentTariff).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <input type="text" placeholder="Kategori Donasi (mis: Perbaikan Jalan)" required className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white outline-none" value={paymentData.category} onChange={e => setPaymentData({...paymentData, category: e.target.value})} />
                            <input type="number" placeholder="Nominal (Rp)" required className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white outline-none" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} />
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">Metode Pembayaran</label>
                        <div className="grid grid-cols-2 gap-2">
                             {['TUNAI', 'TRANSFER', 'QRIS', 'E_WALLET'].map(m => (
                                 <button key={m} type="button" onClick={() => setPaymentData({...paymentData, method: m as any})} className={`p-2 rounded-lg border text-[10px] font-bold ${paymentData.method === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}>
                                     {m.replace('_', ' ')}
                                 </button>
                             ))}
                        </div>
                    </div>

                    {paymentData.method !== 'TUNAI' && (
                        <div className="space-y-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                                <QrCode className="text-blue-600 dark:text-blue-400" />
                                <div className="text-[10px] text-blue-800 dark:text-blue-300">
                                    <p className="font-bold">Transfer ke Rekening RT 06:</p>
                                    <p>Bank BRI: 1234-01-000567-50-1 (A/N Kas RT 06)</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 block">Unggah Bukti Transfer</label>
                                <label className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 relative overflow-hidden transition-colors">
                                    {paymentData.fotoBukti ? (
                                        <img src={paymentData.fotoBukti} className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400" size={20} />
                                            <span className="text-[10px] text-gray-500 mt-1">Upload Bukti Bayar</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleBuktiChange} />
                                </label>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700">
                        Kirim Untuk Verifikasi
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* VERIFICATION LIGHTBOX (ADMIN) */}
      {showVerifModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowVerifModal(null)}>
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden animate-in fade-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white">Detail Bukti Pembayaran</h3>
                    <button onClick={() => setShowVerifModal(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={24}/></button>
                </div>
                <div className="p-6">
                    <img src={showVerifModal.fotoBukti} alt="Bukti" className="w-full max-h-[60vh] object-contain rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" />
                    <div className="mt-6 flex gap-4">
                        <button onClick={() => handleRejectPayment(showVerifModal)} className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30">Tolak Pembayaran</button>
                        <button onClick={() => handleApprovePayment(showVerifModal)} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700">Setujui Pembayaran</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-gray-700">
                 <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Berhasil Dikirim!</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Pembayaran Anda sedang dalam antrean verifikasi oleh Bendahara RT.</p>
                 <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Selesai</button>
             </div>
          </div>
      )}
    </div>
  );
};

export default Finance;
