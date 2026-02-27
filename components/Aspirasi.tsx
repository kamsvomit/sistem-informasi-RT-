
import React, { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Clock } from 'lucide-react';
import { Aspirasi, Warga, UserRole, UserNotification } from '../types';

interface AspirasiPageProps {
  currentUser: Warga;
  aspirasiList: Aspirasi[];
  onAddAspirasi: (item: Aspirasi) => void;
  onUpdateStatus: (id: string, status: Aspirasi['status']) => void;
  wargaList?: Warga[]; // Needed for notifications
  onSendNotification?: (notif: UserNotification) => void; // Needed for notifications
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const AspirasiPage: React.FC<AspirasiPageProps> = ({ currentUser, aspirasiList, onAddAspirasi, onUpdateStatus, wargaList, onSendNotification }) => {
  const [aspirasiText, setAspirasiText] = useState('');
  
  // Logic: Admin see ALL, Warga see OWN
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);
  
  const displayedList = isAdmin 
    ? aspirasiList 
    : aspirasiList.filter(a => a.wargaId === currentUser.id);

  const handleSend = () => {
    if (!aspirasiText) return;
    const newAspirasi: Aspirasi = {
        id: Date.now().toString(),
        wargaId: currentUser.id,
        pengirim: currentUser.namaLengkap,
        isi: aspirasiText,
        tanggal: new Date().toISOString().split('T')[0],
        status: 'BARU'
    };
    onAddAspirasi(newAspirasi);
    setAspirasiText('');
    
    // Notify Admins
    if (onSendNotification && wargaList) {
        const admins = wargaList.filter(w => [UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(w.role));
        admins.forEach(admin => {
            onSendNotification({
                id: `NOTIF-ASPIRASI-${Date.now()}-${admin.id}`,
                userId: admin.id,
                pesan: `Aspirasi Baru dari ${currentUser.namaLengkap}: "${newAspirasi.isi.substring(0, 30)}..." (Perlu Tindak Lanjut)`,
                tipe: 'SYSTEM',
                isRead: false,
                tanggal: new Date().toISOString().split('T')[0]
            });
        });
    }

    alert('Aspirasi berhasil dikirim!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Input hanya untuk Warga (non-Admin) atau Admin juga boleh kirim tapi biasanya admin yang proses */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit transition-colors">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="text-emerald-600 dark:text-emerald-400" /> Aspirasi Warga – SIAGA ERGEN
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Wadah penyampaian saran, masukan, dan aspirasi warga RT 06 RW 19 secara tertib dan bertanggung jawab.
        </p>
        <textarea 
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Tulis aspirasi anda dengan sopan dan jelas..."
            value={aspirasiText}
            onChange={(e) => setAspirasiText(e.target.value)}
        />
        <button 
            onClick={handleSend}
            className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2"
        >
            <Send size={18} /> Kirim Aspirasi
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full min-h-[400px] transition-colors">
         <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            {isAdmin ? "Daftar Aspirasi Masuk (Admin)" : "Riwayat Aspirasi Anda"}
         </h2>
         <div className="flex-1 overflow-y-auto space-y-4">
            {displayedList.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                    <div className="flex justify-between mb-2">
                        <div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">{item.pengirim}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.tanggal}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                             <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                item.status === 'SELESAI' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                item.status === 'DIPROSES' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 mb-3">{item.isi}</p>
                    
                    {/* Admin Actions */}
                    {isAdmin && item.status !== 'SELESAI' && (
                        <div className="flex gap-2 justify-end border-t border-gray-200 dark:border-gray-600 pt-2">
                            {item.status === 'BARU' && (
                                <button 
                                    onClick={() => onUpdateStatus(item.id, 'DIPROSES')}
                                    className="text-xs flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                                >
                                    <Clock size={12} /> Proses
                                </button>
                            )}
                            <button 
                                onClick={() => onUpdateStatus(item.id, 'SELESAI')}
                                className="text-xs flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                            >
                                <CheckCircle size={12} /> Selesai
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {displayedList.length === 0 && (
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-10">Belum ada data aspirasi.</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default AspirasiPage;
