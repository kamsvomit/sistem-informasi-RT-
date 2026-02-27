
import React, { useState } from 'react';
import { HeartHandshake, TrendingUp, Users, Clock, CreditCard, Camera, X, Check, Search, Filter } from 'lucide-react';
import { WakafProgram, WakafTransaksi, Warga, UserRole, PaymentMethod, UserNotification } from '../types';

interface WakafRWProps {
  programs: WakafProgram[];
  transactions: WakafTransaksi[];
  currentUser: Warga;
  onDonate: (data: WakafTransaksi) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  wargaList: Warga[]; // Added
  onSendNotification: (notif: UserNotification) => void; // Added
}

const WakafRW: React.FC<WakafRWProps> = ({ programs, transactions, currentUser, onDonate, onShowToast, wargaList, onSendNotification }) => {
  const [selectedProgram, setSelectedProgram] = useState<WakafProgram | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'MASJID' | 'SOSIAL' | 'INFRASTRUKTUR'>('ALL');
  
  // Donation Form State
  const [donationForm, setDonationForm] = useState<{
    amount: number;
    method: PaymentMethod;
    doa: string;
    isAnonim: boolean;
    fotoBukti: string;
  }>({
    amount: 50000,
    method: 'QRIS',
    doa: '',
    isAnonim: false,
    fotoBukti: ''
  });

  // Helper: Notify Admin (Ketua RT & Bendahara)
  const notifyAdmins = (message: string) => {
    const admins = wargaList.filter(w => [UserRole.KETUA_RT, UserRole.BENDAHARA].includes(w.role));
    admins.forEach(admin => {
        onSendNotification({
            id: `NOTIF-WAKAF-${Date.now()}-${admin.id}`,
            userId: admin.id,
            pesan: message,
            tipe: 'WAKAF',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("Ukuran file bukti maksimal 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDonationForm(prev => ({ ...prev, fotoBukti: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    if (donationForm.amount < 10000) {
        onShowToast("Minimal wakaf Rp 10.000", 'error');
        return;
    }
    if (donationForm.method !== 'TUNAI' && !donationForm.fotoBukti) {
        onShowToast("Mohon lampirkan bukti transfer.", 'error');
        return;
    }

    const newTransaction: WakafTransaksi = {
        id: `WKF-${Date.now()}`,
        programId: selectedProgram.id,
        wargaId: currentUser.id,
        namaDonatur: donationForm.isAnonim ? "Hamba Allah" : currentUser.namaLengkap,
        jumlah: donationForm.amount,
        tanggal: new Date().toISOString().split('T')[0],
        metode: donationForm.method,
        fotoBukti: donationForm.fotoBukti,
        status: 'MENUNGGU_VERIFIKASI', // Wakaf selalu butuh verifikasi admin
        doa: donationForm.doa,
        isAnonim: donationForm.isAnonim
    };

    onDonate(newTransaction);
    
    // Notify RT & Bendahara
    notifyAdmins(`Wakaf Baru: Rp ${newTransaction.jumlah.toLocaleString('id-ID')} untuk "${selectedProgram.judul}" dari ${newTransaction.namaDonatur}. (Perlu Verifikasi)`);

    setShowDonateModal(false);
    // Reset Form
    setDonationForm({
        amount: 50000,
        method: 'QRIS',
        doa: '',
        isAnonim: false,
        fotoBukti: ''
    });
  };

  const filteredPrograms = programs.filter(p => activeFilter === 'ALL' || p.kategori === activeFilter);
  const recentDonations = transactions
    .filter(t => t.status === 'LUNAS')
    .sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 10);

  // Calculate Global Stats
  const totalWakaf = programs.reduce((acc, curr) => acc + curr.terkumpul, 0);
  const totalWakif = new Set(transactions.map(t => t.wargaId)).size;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
         <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500 text-xs font-bold mb-3 backdrop-blur-md">
                  <HeartHandshake size={14} /> Program Sosial RW 19
               </div>
               <h1 className="text-3xl font-bold mb-2">Wakaf & Amal Jariyah</h1>
               <p className="text-emerald-100 max-w-xl text-sm leading-relaxed">
                  "Apabila manusia meninggal dunia, terputuslah segala amalnya kecuali tiga: sedekah jariyah, ilmu yang bermanfaat, dan anak saleh yang mendoakannya."
               </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
                <p className="text-xs text-emerald-200 uppercase tracking-wider font-bold">Total Terhimpun</p>
                <h2 className="text-3xl font-bold mt-1">Rp {(totalWakaf/1000000).toFixed(1)} Jt</h2>
                <p className="text-xs text-emerald-200 mt-2 flex items-center justify-center gap-1">
                    <Users size={12} /> Dari {totalWakif} Wakif (Donatur)
                </p>
            </div>
         </div>
      </div>

      {/* Program Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
         {['ALL', 'MASJID', 'SOSIAL', 'INFRASTRUKTUR'].map((cat) => (
             <button
                key={cat}
                onClick={() => setActiveFilter(cat as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap border ${
                    activeFilter === cat 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
             >
                {cat === 'ALL' ? 'Semua Program' : cat.charAt(0) + cat.slice(1).toLowerCase()}
             </button>
         ))}
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredPrograms.map(program => {
             const percent = Math.min(100, Math.round((program.terkumpul / program.targetDana) * 100));
             return (
                 <div key={program.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all hover:border-emerald-200 dark:hover:border-emerald-800">
                     <div className="h-48 overflow-hidden relative">
                         <img src={program.imageUrl} alt={program.judul} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                         <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                             {program.kategori}
                         </div>
                     </div>
                     <div className="p-5 flex-1 flex flex-col">
                         <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2 leading-tight">{program.judul}</h3>
                         <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1">{program.deskripsi}</p>
                         
                         {/* Progress Bar */}
                         <div className="mb-4">
                             <div className="flex justify-between text-xs font-bold mb-1">
                                 <span className="text-emerald-600 dark:text-emerald-400">Terkumpul {percent}%</span>
                                 <span className="text-gray-400">Target Rp {(program.targetDana/1000000).toFixed(0)} Jt</span>
                             </div>
                             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                 <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                             </div>
                             <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                 Rp {program.terkumpul.toLocaleString('id-ID')}
                             </p>
                         </div>

                         <button 
                            onClick={() => { setSelectedProgram(program); setShowDonateModal(true); }}
                            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 active:scale-95"
                         >
                            Berwakaf Sekarang
                         </button>
                     </div>
                 </div>
             );
         })}
      </div>

      {/* Wall of Kindness (Donatur Terbaru) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 transition-colors">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                  <TrendingUp size={24} />
              </div>
              <div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Jejak Kebaikan Warga</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daftar donatur terbaru yang telah berpartisipasi.</p>
              </div>
          </div>

          <div className="space-y-4">
              {recentDonations.map((trx) => (
                  <div key={trx.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                          {trx.isAnonim ? 'HA' : trx.namaDonatur.charAt(0)}
                      </div>
                      <div className="flex-1">
                          <div className="flex justify-between">
                              <h4 className="font-bold text-gray-800 dark:text-white text-sm">{trx.namaDonatur}</h4>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                                  Rp {trx.jumlah.toLocaleString('id-ID')}
                              </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                              Berwakaf untuk: {programs.find(p => p.id === trx.programId)?.judul || 'Program Wakaf'}
                          </p>
                          {trx.doa && (
                              <div className="text-xs text-gray-600 dark:text-gray-300 italic bg-white dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                                  "{trx.doa}"
                              </div>
                          )}
                      </div>
                  </div>
              ))}
              {recentDonations.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">Belum ada donasi terbaru.</p>
              )}
          </div>
      </div>

      {/* DONATION MODAL */}
      {showDonateModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 border border-gray-100 dark:border-gray-700">
                <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold">Form Ikrar Wakaf</h3>
                    <button onClick={() => setShowDonateModal(false)}><X size={20}/></button>
                </div>
                
                <form onSubmit={handleDonateSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Program Pilihan:</p>
                        <p className="font-bold text-gray-800 dark:text-white text-sm">{selectedProgram.judul}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nominal Wakaf (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                            <input 
                                type="number" 
                                required
                                min={10000}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-lg"
                                value={donationForm.amount}
                                onChange={e => setDonationForm({...donationForm, amount: Number(e.target.value)})}
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[50000, 100000, 500000, 1000000].map(amt => (
                                <button 
                                    key={amt}
                                    type="button"
                                    onClick={() => setDonationForm({...donationForm, amount: amt})}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-gray-600 dark:text-gray-300"
                                >
                                    {(amt/1000).toFixed(0)}k
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button" 
                            onClick={() => setDonationForm({...donationForm, method: 'QRIS'})}
                            className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-1 ${donationForm.method === 'QRIS' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                        >
                            <CreditCard size={20} /> QRIS / E-Wallet
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setDonationForm({...donationForm, method: 'TRANSFER'})}
                            className={`p-3 rounded-lg border text-sm font-bold flex flex-col items-center justify-center gap-1 ${donationForm.method === 'TRANSFER' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                        >
                            <CreditCard size={20} /> Bank Transfer
                        </button>
                    </div>

                    {donationForm.method !== 'TUNAI' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Upload Bukti Transfer</label>
                            <label className="block w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition relative overflow-hidden">
                                {donationForm.fotoBukti ? (
                                    <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold">
                                        <Check size={20} /> Foto Terupload
                                    </div>
                                ) : (
                                    <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center">
                                        <Camera size={24} className="mb-1" />
                                        <span className="text-xs">Klik untuk upload foto</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Doa / Pesan (Opsional)</label>
                        <textarea 
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none h-20"
                            placeholder="Tuliskan doa atau harapan anda..."
                            value={donationForm.doa}
                            onChange={e => setDonationForm({...donationForm, doa: e.target.value})}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="anonim"
                            checked={donationForm.isAnonim}
                            onChange={e => setDonationForm({...donationForm, isAnonim: e.target.checked})}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="anonim" className="text-sm text-gray-600 dark:text-gray-300">Sembunyikan nama saya (Hamba Allah)</label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg">
                        Bismillah, Wakaf Sekarang
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default WakafRW;
