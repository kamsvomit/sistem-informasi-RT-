
import React, { useState } from 'react';
import { 
  BellRing, CheckCircle, Clock, FileText, CreditCard, MessageSquare, 
  ChevronRight, Filter, AlertTriangle, UserCheck, Eye, Check, X, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { Warga, Keuangan, ChangeRequest, Aspirasi, ViewState } from '../types';

interface AdminNotificationsProps {
  requests: ChangeRequest[];
  keuanganList: Keuangan[];
  aspirasiList: Aspirasi[];
  wargaList: Warga[];
  onNavigate: (view: ViewState) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string, reason: string) => void;
  onApproveWarga: (warga: Warga) => void;
  onRejectWarga: (warga: Warga, reason: string) => void;
}

const AdminNotifications: React.FC<AdminNotificationsProps> = ({ 
  requests, 
  keuanganList, 
  aspirasiList, 
  wargaList,
  onNavigate,
  onApproveRequest,
  onRejectRequest,
  onApproveWarga,
  onRejectWarga
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DATA' | 'KEUANGAN' | 'ASPIRASI' | 'AKUN'>('ALL');
  const [previewDoc, setPreviewDoc] = useState<{title: string, url: string} | null>(null);

  // --- Aggregate Pending Tasks ---
  
  // 0. New Account Verification (Status: Data Complete but NOT Verified)
  const pendingAccounts = wargaList.filter(w => w.isDataComplete && !w.isVerified).map(w => ({
    id: w.id,
    type: 'AKUN' as const,
    title: 'Verifikasi Akun Warga Baru',
    description: `${w.namaLengkap} telah melengkapi profil & dokumen. Mohon verifikasi keaslian data.`,
    date: w.joinedAt || '-',
    actionLabel: 'Lihat Dokumen',
    targetView: 'DATA_WARGA' as ViewState,
    data: w
  }));

  // 1. Data Change Requests (Status: DIAJUKAN)
  const pendingRequests = requests.filter(r => r.status === 'DIAJUKAN').map(req => {
    const warga = wargaList.find(w => w.id === req.wargaId);
    return {
      id: req.id,
      type: 'DATA' as const,
      title: 'Perubahan Data Kependudukan',
      description: `${warga?.namaLengkap || 'Warga'} ingin mengubah ${req.field} dari "${req.oldValue}" menjadi "${req.newValue}".`,
      date: req.tanggalPengajuan,
      actionLabel: 'Proses Perubahan',
      targetView: 'DATA_WARGA' as ViewState,
      data: req
    };
  });

  // 2. Pending Payments (Status: MENUNGGU_VERIFIKASI)
  const pendingPayments = keuanganList.filter(k => k.status === 'MENUNGGU_VERIFIKASI').map(pay => {
    const warga = wargaList.find(w => w.id === pay.wargaId);
    return {
      id: pay.id,
      type: 'KEUANGAN' as const,
      title: 'Verifikasi Pembayaran',
      description: `${warga?.namaLengkap || 'Warga'} membayar ${pay.kategori} (Rp ${pay.jumlah.toLocaleString('id-ID')}).`,
      date: pay.tanggal,
      actionLabel: 'Cek Bukti Kas',
      targetView: 'KEUANGAN' as ViewState,
      data: pay
    };
  });

  // 3. New Aspirations (Status: BARU)
  const newAspirations = aspirasiList.filter(a => a.status === 'BARU').map(asp => ({
    id: asp.id,
    type: 'ASPIRASI' as const,
    title: 'Aspirasi Warga Baru',
    description: `Pesan dari ${asp.pengirim}: "${asp.isi.substring(0, 40)}..."`,
    date: asp.tanggal,
    actionLabel: 'Tindak Lanjuti',
    targetView: 'ASPIRASI' as ViewState,
    data: asp
  }));

  const allTasks = [...pendingAccounts, ...pendingRequests, ...pendingPayments, ...newAspirations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredTasks = allTasks.filter(t => filter === 'ALL' || t.type === filter);

  const handleAutoApprove = () => {
    const eligible = pendingAccounts.filter(task => 
        task.data.nik && 
        task.data.nik.length === 16 && 
        task.data.fotoKTP
    );

    if (eligible.length === 0) {
        alert("Tidak ada warga yang memenuhi kriteria setuju otomatis (NIK 16 digit & Foto KTP).");
        return;
    }

    if (confirm(`Setujui otomatis ${eligible.length} warga yang datanya lengkap?`)) {
        eligible.forEach(task => onApproveWarga(task.data));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BellRing className="text-emerald-600 dark:text-emerald-400" /> Pusat Verifikasi & Tugas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola persetujuan data kependudukan dan transaksi keuangan warga dalam satu pintu.
            </p>
          </div>
          
          {pendingAccounts.length > 0 && (
              <button 
                onClick={handleAutoApprove}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 dark:shadow-none hover:scale-105 transition-transform flex items-center gap-2"
                title="Setujui semua warga dengan NIK 16 digit & Foto KTP"
              >
                <ShieldCheck size={18} /> 
                Setujui Otomatis ({pendingAccounts.filter(t => t.data.nik?.length === 16 && t.data.fotoKTP).length})
              </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar border-b border-gray-100 dark:border-gray-700">
           <Filter size={16} className="text-gray-400 dark:text-gray-500 ml-1" />
           <button 
             onClick={() => setFilter('ALL')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === 'ALL' ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             Semua ({allTasks.length})
           </button>
           <button 
             onClick={() => setFilter('AKUN')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${filter === 'AKUN' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             <UserCheck size={14} /> Verifikasi Akun ({pendingAccounts.length})
           </button>
           <button 
             onClick={() => setFilter('DATA')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${filter === 'DATA' ? 'bg-orange-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             <FileText size={14} /> Perubahan Data ({pendingRequests.length})
           </button>
           <button 
             onClick={() => setFilter('KEUANGAN')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${filter === 'KEUANGAN' ? 'bg-emerald-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             <CreditCard size={14} /> Keuangan ({pendingPayments.length})
           </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
           {filteredTasks.length === 0 ? (
             <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                <CheckCircle size={48} className="mx-auto text-emerald-200 dark:text-emerald-800 mb-3" />
                <h3 className="text-gray-800 dark:text-white font-bold text-lg">Antrean Bersih</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Semua permohonan warga telah diproses.</p>
             </div>
           ) : (
             filteredTasks.map((task) => (
                <div key={`${task.type}-${task.id}`} className="group p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                   <div className="flex items-start gap-4 flex-1">
                      <div className={`p-4 rounded-2xl shrink-0 ${
                          task.type === 'AKUN' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          task.type === 'DATA' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          task.type === 'KEUANGAN' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      }`}>
                          {task.type === 'AKUN' && <UserCheck size={24} />}
                          {task.type === 'DATA' && <FileText size={24} />}
                          {task.type === 'KEUANGAN' && <CreditCard size={24} />}
                          {task.type === 'ASPIRASI' && <MessageSquare size={24} />}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-gray-800 dark:text-white text-base">{task.title}</h4>
                             <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full font-bold uppercase tracking-wider">
                                {task.date}
                             </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{task.description}</p>
                          
                          {/* Quick Actions for AKUN Verification */}
                          {task.type === 'AKUN' && (
                              <div className="flex flex-wrap gap-2">
                                  {task.data.fotoKTP && (
                                      <button 
                                        onClick={() => setPreviewDoc({title: `KTP: ${task.data.namaLengkap}`, url: task.data.fotoKTP})}
                                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition"
                                      >
                                          <Eye size={14} /> Lihat KTP
                                      </button>
                                  )}
                                  {task.data.fotoKK && (
                                      <button 
                                        onClick={() => setPreviewDoc({title: `KK: ${task.data.namaLengkap}`, url: task.data.fotoKK})}
                                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition"
                                      >
                                          <Eye size={14} /> Lihat KK
                                      </button>
                                  )}
                              </div>
                          )}
                      </div>
                   </div>
                   
                   <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                     {task.type === 'AKUN' ? (
                         <>
                            <button 
                                onClick={() => onApproveWarga(task.data)}
                                className="flex-1 md:w-32 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <Check size={14} /> Setujui
                            </button>
                            <button 
                                onClick={() => {
                                    const r = prompt("Alasan Penolakan Akun:");
                                    if(r) onRejectWarga(task.data, r);
                                }}
                                className="flex-1 md:w-32 py-2.5 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                            >
                                <X size={14} /> Tolak
                            </button>
                         </>
                     ) : (
                        <button 
                            onClick={() => onNavigate(task.targetView)}
                            className="w-full md:w-32 px-4 py-2.5 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            Detail <ChevronRight size={14} />
                        </button>
                     )}
                   </div>
                </div>
             ))
           )}
        </div>
      </div>

      {/* Verification Legend/Tip */}
      <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-4">
         <ShieldAlert size={24} className="text-amber-600 dark:text-amber-500 shrink-0 mt-1" />
         <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">Penting bagi Pengurus</h4>
            <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
               Verifikasi dokumen (KTP/KK) adalah langkah krusial untuk memastikan validitas data kependudukan SIAGA ERGEN. Pastikan foto dokumen terbaca jelas sebelum menyetujui akun warga baru.
            </p>
         </div>
      </div>

      {/* Document Lightbox */}
      {previewDoc && (
          <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
              <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                          <Eye className="text-blue-600" size={20} /> {previewDoc.title}
                      </h3>
                      <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition">
                          <X size={24} className="text-gray-500" />
                      </button>
                  </div>
                  <div className="p-6 flex justify-center bg-gray-100 dark:bg-gray-950">
                      <img src={previewDoc.url} alt="Pratinjau Dokumen" className="max-h-[70vh] object-contain rounded-xl shadow-lg" />
                  </div>
                  <div className="p-4 text-center text-xs text-gray-400">
                      Klik area luar atau tombol silang untuk menutup.
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminNotifications;
