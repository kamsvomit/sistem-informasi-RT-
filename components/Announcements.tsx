
import React, { useState } from 'react';
import { Bell, Calendar, Pin, Plus, X, Send, Megaphone, Users, Smartphone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Pengumuman, Warga, UserRole, UserNotification, UndanganAcara } from '../types';

interface AnnouncementsProps {
  currentUser: Warga;
  pengumumanList: Pengumuman[];
  onAddPengumuman: (item: Pengumuman) => void;
  undanganList: UndanganAcara[];
  onAddUndangan: (item: UndanganAcara) => void;
  onRsvp: (id: string, userId: string) => void;
  wargaList: Warga[];
  onSendNotification: (notif: UserNotification) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const Announcements: React.FC<AnnouncementsProps> = ({ 
  currentUser, pengumumanList, onAddPengumuman, undanganList, onAddUndangan, onRsvp,
  wargaList, onSendNotification, onShowToast 
}) => {
  const [activeTab, setActiveTab] = useState<'PENGUMUMAN' | 'UNDANGAN'>('PENGUMUMAN');
  const [showForm, setShowForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState<Partial<Pengumuman>>({
    judul: '',
    isi: '',
    tanggal: new Date().toISOString().split('T')[0],
    penting: false
  });

  const [inviteData, setInviteData] = useState<Partial<UndanganAcara>>({
    judul: '',
    deskripsi: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu: '08:00',
    lokasi: 'Balai Warga RT 06',
    isRsvpRequired: true
  });

  const [broadcast, setBroadcast] = useState(true);

  const canCreate = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);
  const activeWargaCount = wargaList.filter(w => w.statusKependudukan === 'AKTIF').length;

  const handleSubmitPengumuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) return;

    const newPengumuman: Pengumuman = {
      id: Date.now().toString(),
      judul: formData.judul!,
      isi: formData.isi!,
      tanggal: formData.tanggal || new Date().toISOString().split('T')[0],
      penting: formData.penting || false,
      penulis: currentUser.role
    };

    onAddPengumuman(newPengumuman);

    if (broadcast) {
      let count = 0;
      const batchTime = Date.now();
      wargaList.filter(w => w.statusKependudukan === 'AKTIF').forEach((warga, index) => {
        const notif: UserNotification = {
          id: `NOTIF-ANN-${batchTime}-${index}-${warga.id}`,
          userId: warga.id,
          pesan: `📢 Pengumuman RT 06: ${newPengumuman.judul}`,
          tipe: 'PENGUMUMAN',
          isRead: false,
          tanggal: newPengumuman.tanggal
        };
        onSendNotification(notif);
        count++;
      });
      onShowToast(`Pengumuman diterbitkan! Notifikasi terkirim ke ${count} warga.`, 'success');
    } else {
      onShowToast("Pengumuman berhasil diterbitkan.", 'success');
    }

    setShowForm(false);
    setFormData({ judul: '', isi: '', tanggal: new Date().toISOString().split('T')[0], penting: false });
    setBroadcast(true);
  };

  const handleSubmitUndangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.judul || !inviteData.deskripsi) return;

    const newInvite: UndanganAcara = {
      id: `inv-${Date.now()}`,
      judul: inviteData.judul!,
      deskripsi: inviteData.deskripsi!,
      tanggal: inviteData.tanggal || new Date().toISOString().split('T')[0],
      waktu: inviteData.waktu || '08:00',
      lokasi: inviteData.lokasi || 'Balai Warga',
      isRsvpRequired: inviteData.isRsvpRequired || false,
      createdAt: new Date().toISOString(),
      penulis: currentUser.role,
      attendees: []
    };

    onAddUndangan(newInvite);

    if (broadcast) {
      let count = 0;
      const batchTime = Date.now();
      wargaList.filter(w => w.statusKependudukan === 'AKTIF').forEach((warga, index) => {
        const notif: UserNotification = {
          id: `NOTIF-INV-${batchTime}-${index}-${warga.id}`,
          userId: warga.id,
          pesan: `✉️ Undangan Acara: ${newInvite.judul}`,
          tipe: 'PENGUMUMAN',
          isRead: false,
          tanggal: newInvite.tanggal
        };
        onSendNotification(notif);
        count++;
      });
      onShowToast(`Undangan diterbitkan! Notifikasi terkirim ke ${count} warga.`, 'success');
    } else {
      onShowToast("Undangan berhasil diterbitkan.", 'success');
    }

    setShowInviteForm(false);
    setInviteData({ judul: '', deskripsi: '', tanggal: new Date().toISOString().split('T')[0], waktu: '08:00', lokasi: 'Balai Warga RT 06', isRsvpRequired: true });
    setBroadcast(true);
  };

  return (
    <div className="space-y-6 relative">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Bell className="text-emerald-600 dark:text-emerald-400" size={24} /> Informasi & Agenda RT
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pusat informasi resmi dan jadwal kegiatan warga.</p>
        </div>
        
        {canCreate && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
            >
              <Megaphone size={16} /> Info Baru
            </button>
            <button 
              onClick={() => setShowInviteForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
            >
              <Calendar size={16} /> Buat Undangan
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('PENGUMUMAN')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'PENGUMUMAN' 
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Pengumuman
        </button>
        <button
          onClick={() => setActiveTab('UNDANGAN')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'UNDANGAN' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Undangan Acara
        </button>
      </div>

      {/* Content Area */}
      <div className="grid gap-4">
        {activeTab === 'PENGUMUMAN' ? (
          // --- PENGUMUMAN LIST ---
          <>
            {[...pengumumanList].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((item) => (
              <div key={item.id} className={`p-6 rounded-2xl border relative transition hover:shadow-md ${
                item.penting 
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {item.penting && (
                        <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                            <Pin size={10} className="fill-amber-700 dark:fill-amber-400" /> Penting
                        </span>
                    )}
                    <h3 className={`font-bold text-lg ${item.penting ? 'text-amber-900 dark:text-amber-300' : 'text-gray-800 dark:text-white'}`}>
                        {item.judul}
                    </h3>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                    <Calendar size={12} /> {item.tanggal}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{item.isi}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {item.penulis.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{item.penulis}</span>
                    </div>
                </div>
              </div>
            ))}
            {pengumumanList.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Megaphone size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                    <h3 className="text-gray-400 dark:text-gray-500 font-bold">Belum ada pengumuman</h3>
                </div>
            )}
          </>
        ) : (
          // --- UNDANGAN LIST ---
          <>
            {[...undanganList].sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((item) => {
              const isAttending = item.attendees.includes(currentUser.id);
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md transition relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg mb-2 inline-block">
                          UNDANGAN RESMI
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{item.judul}</h3>
                      </div>
                      {isAttending && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={14} /> Hadir
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">{item.deskripsi}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                        <Calendar className="text-blue-500" size={18} />
                        <div>
                          <p className="text-xs text-gray-400">Tanggal</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{item.tanggal}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                        <Clock className="text-amber-500" size={18} />
                        <div>
                          <p className="text-xs text-gray-400">Waktu</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{item.waktu} WIB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                        <MapPin className="text-red-500" size={18} />
                        <div>
                          <p className="text-xs text-gray-400">Lokasi</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{item.lokasi}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          <strong>{item.attendees.length}</strong> warga akan hadir
                        </span>
                      </div>
                      
                      {item.isRsvpRequired && (
                        <button 
                          onClick={() => onRsvp(item.id, currentUser.id)}
                          className={`px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                            isAttending 
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none'
                          }`}
                        >
                          {isAttending ? 'Batalkan Kehadiran' : 'Konfirmasi Hadir'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {undanganList.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Calendar size={48} className="mx-auto text-gray-200 dark:text-gray-600 mb-4" />
                    <h3 className="text-gray-400 dark:text-gray-500 font-bold">Belum ada undangan acara</h3>
                </div>
            )}
          </>
        )}
      </div>

      {/* MODAL FORM PENGUMUMAN */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Terbitkan Pengumuman</h3>
                    </div>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmitPengumuman} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Judul Informasi</label>
                        <input required type="text" placeholder="Contoh: Jadwal Kerja Bakti" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tanggal Terbit</label>
                        <input required type="date" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Isi Pesan</label>
                        <textarea required className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl h-36 resize-none bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="Detail pengumuman..." value={formData.isi} onChange={(e) => setFormData({...formData, isi: e.target.value})} />
                    </div>

                    <div className="space-y-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.penting} onChange={(e) => setFormData({...formData, penting: e.target.checked})} className="w-5 h-5 text-amber-600 rounded-md" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5"><Pin size={14} className="text-amber-600" /> Tandai Penting</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer border-t pt-2 border-emerald-100/50">
                            <input type="checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} className="w-5 h-5 text-emerald-600 rounded-md" />
                            <span className="text-sm text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5"><Smartphone size={14} /> Broadcast ke {activeWargaCount} Warga</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition">Terbitkan</button>
                </form>
            </div>
        </div>
      )}

      {/* MODAL FORM UNDANGAN */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Buat Undangan Acara</h3>
                    </div>
                    <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmitUndangan} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nama Acara</label>
                        <input required type="text" placeholder="Contoh: Halal Bihalal Warga" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={inviteData.judul} onChange={(e) => setInviteData({...inviteData, judul: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Tanggal</label>
                          <input required type="date" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={inviteData.tanggal} onChange={(e) => setInviteData({...inviteData, tanggal: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Waktu</label>
                          <input required type="time" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={inviteData.waktu} onChange={(e) => setInviteData({...inviteData, waktu: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Lokasi</label>
                        <input required type="text" placeholder="Contoh: Lapangan RT 06" className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white" value={inviteData.lokasi} onChange={(e) => setInviteData({...inviteData, lokasi: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Deskripsi Acara</label>
                        <textarea required className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl h-24 resize-none bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="Jelaskan detail acara..." value={inviteData.deskripsi} onChange={(e) => setInviteData({...inviteData, deskripsi: e.target.value})} />
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={inviteData.isRsvpRequired} onChange={(e) => setInviteData({...inviteData, isRsvpRequired: e.target.checked})} className="w-5 h-5 text-blue-600 rounded-md" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5"><CheckCircle size={14} className="text-blue-600" /> Aktifkan Konfirmasi Kehadiran (RSVP)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer border-t pt-2 border-blue-100/50">
                            <input type="checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} className="w-5 h-5 text-blue-600 rounded-md" />
                            <span className="text-sm text-blue-800 dark:text-blue-400 font-bold flex items-center gap-1.5"><Smartphone size={14} /> Broadcast Undangan ke {activeWargaCount} Warga</span>
                        </label>
                    </div>

                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Sebar Undangan</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
