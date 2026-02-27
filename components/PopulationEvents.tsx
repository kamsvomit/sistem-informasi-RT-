
import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Calendar, User, Trash2, Baby, Skull, Truck, Home, AlertCircle, X, Check } from 'lucide-react';
import { Peristiwa, Warga, JenisPeristiwa, UserRole, UserNotification } from '../types';

interface PopulationEventsProps {
  peristiwaList: Peristiwa[];
  wargaList: Warga[];
  onAddPeristiwa: (data: Peristiwa) => void;
  onDeletePeristiwa: (id: string) => void;
  currentUser: Warga;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  onSendNotification: (notif: UserNotification) => void; // Added prop
}

const PopulationEvents: React.FC<PopulationEventsProps> = ({ peristiwaList, wargaList, onAddPeristiwa, onDeletePeristiwa, currentUser, onShowToast, onSendNotification }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>('ALL');

  // Form State
  const [formData, setFormData] = useState<Partial<Peristiwa>>({
    jenisPeristiwa: JenisPeristiwa.LAHIR,
    tanggalPeristiwa: new Date().toISOString().split('T')[0],
    keterangan: '',
    wargaId: ''
  });

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);

  // Helper stats
  const stats = {
    lahir: peristiwaList.filter(p => p.jenisPeristiwa === JenisPeristiwa.LAHIR).length,
    meninggal: peristiwaList.filter(p => p.jenisPeristiwa === JenisPeristiwa.MENINGGAL).length,
    pindah: peristiwaList.filter(p => p.jenisPeristiwa === JenisPeristiwa.PINDAH).length,
    datang: peristiwaList.filter(p => p.jenisPeristiwa === JenisPeristiwa.DATANG).length,
  };

  // Helper: Notify Admin (Ketua RT & Sekretaris)
  const notifyAdmins = (message: string) => {
    const admins = wargaList.filter(w => [UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(w.role));
    admins.forEach(admin => {
        onSendNotification({
            id: `NOTIF-EVENT-${Date.now()}-${admin.id}`,
            userId: admin.id,
            pesan: message,
            tipe: 'SYSTEM',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    });
  };

  const getEventColor = (type: JenisPeristiwa) => {
    switch (type) {
      case JenisPeristiwa.LAHIR: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case JenisPeristiwa.MENINGGAL: return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case JenisPeristiwa.DATANG: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case JenisPeristiwa.PINDAH: return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEventIcon = (type: JenisPeristiwa) => {
    switch (type) {
      case JenisPeristiwa.LAHIR: return <Baby size={16} />;
      case JenisPeristiwa.MENINGGAL: return <Skull size={16} />;
      case JenisPeristiwa.DATANG: return <Truck size={16} className="transform scale-x-[-1]" />;
      case JenisPeristiwa.PINDAH: return <Truck size={16} />;
      default: return <User size={16} />;
    }
  };

  // Filter list for Table
  const filteredEvents = peristiwaList.filter(p => {
    const warga = wargaList.find(w => w.id === p.wargaId);
    const nameMatch = warga?.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const typeMatch = filterType === 'ALL' || p.jenisPeristiwa === filterType;
    return nameMatch && typeMatch;
  }).sort((a,b) => new Date(b.tanggalPeristiwa).getTime() - new Date(a.tanggalPeristiwa).getTime());

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION: Ensure all fields are filled
    if (!formData.wargaId || !formData.jenisPeristiwa || !formData.tanggalPeristiwa || !formData.keterangan?.trim()) {
      onShowToast("Mohon lengkapi semua data peristiwa (Warga, Jenis, Tanggal, dan Keterangan).", 'error');
      return;
    }

    const newEvent: Peristiwa = {
      id: Date.now().toString(),
      wargaId: formData.wargaId,
      jenisPeristiwa: formData.jenisPeristiwa,
      tanggalPeristiwa: formData.tanggalPeristiwa!,
      keterangan: formData.keterangan || '',
      dicatatOleh: currentUser.namaLengkap,
      createdAt: new Date().toISOString()
    };

    if (window.confirm(`Konfirmasi pencatatan peristiwa ${formData.jenisPeristiwa}? \n\nPERINGATAN: Status warga akan diperbarui otomatis.`)) {
        onAddPeristiwa(newEvent);
        
        // Notify Admins
        const subjectWarga = wargaList.find(w => w.id === newEvent.wargaId);
        notifyAdmins(`Peristiwa Baru: ${newEvent.jenisPeristiwa} atas nama ${subjectWarga?.namaLengkap || 'Warga'}. Dicatat oleh ${currentUser.namaLengkap}.`);

        setShowForm(false);
        setFormData({
            jenisPeristiwa: JenisPeristiwa.LAHIR,
            tanggalPeristiwa: new Date().toISOString().split('T')[0],
            keterangan: '',
            wargaId: ''
        });
    }
  };

  // Filter Warga options based on Event Type
  const relevantWarga = wargaList.filter(w => {
    if (formData.jenisPeristiwa === JenisPeristiwa.MENINGGAL || formData.jenisPeristiwa === JenisPeristiwa.PINDAH) {
        return w.statusKependudukan === 'AKTIF';
    }
    return true; 
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex items-center gap-3 transition-colors">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full"><Baby size={20} /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Kelahiran</p><h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.lahir}</h3></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm flex items-center gap-3 transition-colors">
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full"><Skull size={20} /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Meninggal</p><h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.meninggal}</h3></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-100 dark:border-green-900/30 shadow-sm flex items-center gap-3 transition-colors">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full"><Truck size={20} className="transform scale-x-[-1]"/></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Warga Datang</p><h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.datang}</h3></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 shadow-sm flex items-center gap-3 transition-colors">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full"><Truck size={20} /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Warga Pindah</p><h3 className="text-xl font-bold text-gray-800 dark:text-white">{stats.pindah}</h3></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
         <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                 <ClipboardList className="text-emerald-600 dark:text-emerald-400" size={24} /> Peristiwa Kependudukan
               </h2>
               <p className="text-sm text-gray-500 dark:text-gray-400">Pencatatan dinamika penduduk (Lahir, Mati, Pindah, Datang).</p>
            </div>
            {isAdmin && (
                <button 
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                    <Plus size={18} /> Catat Peristiwa
                </button>
            )}
         </div>

         {/* Filters */}
         <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Cari Nama Warga..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white dark:bg-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none"
            >
                <option value="ALL">Semua Jenis</option>
                <option value={JenisPeristiwa.LAHIR}>Kelahiran</option>
                <option value={JenisPeristiwa.MENINGGAL}>Kematian</option>
                <option value={JenisPeristiwa.DATANG}>Datang</option>
                <option value={JenisPeristiwa.PINDAH}>Pindah</option>
            </select>
         </div>

         {/* Event List */}
         <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredEvents.map(event => {
                const warga = wargaList.find(w => w.id === event.wargaId);
                return (
                    <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-start gap-4">
                        <div className={`p-3 rounded-xl border ${getEventColor(event.jenisPeristiwa)}`}>
                            {getEventIcon(event.jenisPeristiwa)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{warga?.namaLengkap || 'Unknown Warga'}</h4>
                                    <div className="flex items-center gap-2 text-sm mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getEventColor(event.jenisPeristiwa)}`}>
                                            {event.jenisPeristiwa}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} /> {event.tanggalPeristiwa}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{event.keterangan}"</p>
                                </div>
                                {isAdmin && (
                                    <button 
                                        onClick={() => { if(window.confirm('Hapus catatan peristiwa ini?')) onDeletePeristiwa(event.id); }}
                                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-right">
                                Dicatat oleh: {event.dicatatOleh}
                            </div>
                        </div>
                    </div>
                );
            })}
            {filteredEvents.length === 0 && (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                    Tidak ada data peristiwa ditemukan.
                </div>
            )}
         </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Catat Peristiwa Kependudukan</h3>
                    <button onClick={() => setShowForm(false)}><X size={24} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Alert Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                        <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            Pencatatan ini akan <strong>otomatis memperbarui status kependudukan warga</strong> terkait di database utama.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Peristiwa</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[JenisPeristiwa.LAHIR, JenisPeristiwa.MENINGGAL, JenisPeristiwa.DATANG, JenisPeristiwa.PINDAH].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, jenisPeristiwa: type})}
                                    className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition ${
                                        formData.jenisPeristiwa === type 
                                        ? getEventColor(type) + ' ring-2 ring-offset-1 dark:ring-offset-gray-800' 
                                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {getEventIcon(type)} {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Warga</label>
                        <select 
                            required
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.wargaId}
                            onChange={e => setFormData({...formData, wargaId: e.target.value})}
                        >
                            <option value="">-- Cari Nama Warga --</option>
                            {relevantWarga.map(w => (
                                <option key={w.id} value={w.id}>{w.namaLengkap} - {w.nik}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formData.jenisPeristiwa === JenisPeristiwa.LAHIR ? "*Pilih Kepala Keluarga / Ibu" : "*Hanya menampilkan warga yang sesuai"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Peristiwa</label>
                        <input 
                            type="date" 
                            required
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.tanggalPeristiwa}
                            onChange={e => setFormData({...formData, tanggalPeristiwa: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan / Catatan</label>
                        <textarea 
                            required
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                            placeholder="Contoh: Pindah tugas ke luar kota, Lahir di RS Al-Ihsan..."
                            value={formData.keterangan}
                            onChange={e => setFormData({...formData, keterangan: e.target.value})}
                        />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex justify-center items-center gap-2">
                            <Check size={18} /> Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default PopulationEvents;
