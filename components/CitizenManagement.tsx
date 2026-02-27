
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Save, X, AlertTriangle, CheckCircle, 
  Filter, FileInput, Check, XCircle, Users, Upload, Image as ImageIcon, 
  ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, BadgeCheck, MapPin, Phone, 
  Gift, UserCheck, Eye, MoreHorizontal, Calendar, Briefcase, Heart, Sparkles, Download 
} from 'lucide-react';
import { Warga, Gender, Agama, StatusPerkawinan, UserRole, ChangeRequest, StatusTinggal, ViewState } from '../types';
import CitizenBulkUpload from './CitizenBulkUpload';
import CitizenExportModal from './CitizenExportModal';

interface CitizenManagementProps {
  wargaList: Warga[];
  requests: ChangeRequest[];
  currentUser: Warga;
  onAddWarga: (warga: Warga) => void;
  onUpdateWarga: (warga: Warga) => void;
  onDeleteWarga: (id: string) => void;
  onUpdateRequestStatus: (id: string, status: 'DISETUJUI' | 'DITOLAK', catatan?: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  onNavigate: (view: ViewState) => void;
  onLogActivity: (activity: string) => void;
}

const CitizenManagement: React.FC<CitizenManagementProps> = ({ 
  wargaList, requests, currentUser, onAddWarga, onUpdateWarga, onDeleteWarga, 
  onUpdateRequestStatus, onShowToast, onNavigate, onLogActivity
}) => {
  const [activeTab, setActiveTab] = useState<'DATA' | 'REQUESTS' | 'USERS'>('DATA');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCOMPLETE' | 'UNVERIFIED' | 'BANSOS' | 'NEWLY_REGISTERED'>('ALL');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMode, activeTab]);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedWarga, setSelectedWarga] = useState<Partial<Warga>>({});
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');

  // Enhanced Form State
  const [familyMode, setFamilyMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [searchKK, setSearchKK] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<Warga | null>(null); // Represents the Head of Family found

  const isAdmin = [
    UserRole.SUPER_ADMIN, 
    UserRole.KETUA_RT, 
    UserRole.SEKRETARIS, 
    UserRole.BENDAHARA, 
    UserRole.PENGURUS
  ].includes(currentUser.role);

  // ... (rest of existing functions)

  const handleResetPassword = (warga: Warga) => {
      if(window.confirm(`Reset password untuk ${warga.namaLengkap} menjadi default (123456)?`)) {
          onUpdateWarga({ ...warga, password: '123456' }); // Mock logic
          onShowToast("Password berhasil direset.", "success");
      }
  };

  const handleToggleStatus = (warga: Warga) => {
      const newStatus = !warga.isVerified;
      if(window.confirm(`${newStatus ? 'Aktifkan' : 'Nonaktifkan'} akses login untuk ${warga.namaLengkap}?`)) {
          onUpdateWarga({ ...warga, isVerified: newStatus });
          onShowToast(`Akses akun berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, "success");
      }
  };

  const getMissingFields = (warga: Partial<Warga>) => {
    const missing: string[] = [];
    if (!warga.nik) missing.push('NIK');
    if (!warga.namaLengkap) missing.push('Nama Lengkap');
    if (!warga.alamatRumah) missing.push('Alamat Rumah');
    if (!warga.noHP) missing.push('No. HP');
    return missing;
  };

  const filteredWarga = wargaList.filter(w => {
    const matchesSearch = 
      w.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.nik.includes(searchTerm) ||
      w.noKK.includes(searchTerm) ||
      (w.alamatRumah && w.alamatRumah.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (w.alamatKTP && w.alamatKTP.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterMode === 'INCOMPLETE') {
        if (getMissingFields(w).length === 0) return false;
    } else if (filterMode === 'UNVERIFIED') {
        if (!w.isDataComplete || w.isVerified) return false;
    } else if (filterMode === 'BANSOS') {
        if (!w.isPenerimaBansos) return false;
    } else if (filterMode === 'NEWLY_REGISTERED') {
        if (!w.joinedAt) return false;
        const joinedDate = new Date(w.joinedAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (joinedDate < oneWeekAgo) return false;
    }
    
    return matchesSearch;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWarga.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWarga.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleOpenAdd = () => {
    setSelectedWarga({
      jenisKelamin: Gender.LAKI_LAKI,
      agama: Agama.ISLAM,
      statusPerkawinan: StatusPerkawinan.BELUM_KAWIN,
      role: UserRole.WARGA,
      statusKependudukan: 'AKTIF',
      isPenerimaBansos: false,
      statusTinggal: StatusTinggal.TETAP
    });
    setFormMode('ADD');
    setFamilyMode('NEW');
    setSearchKK('');
    setSelectedFamily(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (warga: Warga) => {
    setSelectedWarga({ ...warga });
    setFormMode('EDIT');
    // Determine family mode based on existing data? Not strictly necessary for edit, usually just edit fields.
    setIsFormOpen(true);
  };

  const handleOpenDetail = (warga: Warga) => {
    setSelectedWarga(warga);
    setIsDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'ADD') {
      const newWarga: Warga = {
        ...selectedWarga as Warga,
        id: `warga-${Date.now()}`,
        joinedAt: new Date().toISOString().split('T')[0],
        isVerified: true, // Admin added assumed verified
        isDataComplete: true,
        // Ensure family data is consistent
        noKK: familyMode === 'EXISTING' && selectedFamily ? selectedFamily.noKK : selectedWarga.noKK!,
        alamatRumah: familyMode === 'EXISTING' && selectedFamily ? selectedFamily.alamatRumah : selectedWarga.alamatRumah!
      };
      onAddWarga(newWarga);
      onShowToast("Warga baru berhasil ditambahkan", "success");
    } else {
      onUpdateWarga(selectedWarga as Warga);
      onShowToast("Data warga berhasil diperbarui", "success");
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
      onDeleteWarga(id);
      onShowToast("Data warga berhasil dihapus", "success");
    }
  };

  const handleBulkUpload = (data: Warga[]) => {
    data.forEach(w => onAddWarga(w));
    onShowToast(`Berhasil mengimpor ${data.length} data warga.`, "success");
    setIsUploadModalOpen(false);
  };

  // Helper to find family
  const searchFamily = (query: string) => {
    if (!query) return;
    const found = wargaList.find(w => w.noKK === query || w.namaLengkap.toLowerCase().includes(query.toLowerCase()));
    if (found) {
      // Find the head of this family if possible, or just use the found member to get KK/Address
      const head = wargaList.find(w => w.noKK === found.noKK && w.isKepalaKeluarga) || found;
      setSelectedFamily(head);
      // Auto-fill form
      setSelectedWarga(prev => ({
        ...prev,
        noKK: head.noKK,
        alamatRumah: head.alamatRumah
      }));
    } else {
      setSelectedFamily(null);
      onShowToast("Keluarga tidak ditemukan", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
      <CitizenBulkUpload 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleBulkUpload}
        existingNiks={wargaList.map(w => w.nik)}
      />

      <CitizenExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        wargaList={wargaList}
        currentUser={currentUser}
        onLogActivity={onLogActivity}
      />

      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-center gap-4">

        <div>
           <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manajemen Data Penduduk</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">
             {isAdmin 
               ? "Verifikasi pendaftaran warga dan kelola database kependudukan." 
               : "Informasi Data Warga RT 06 RW 19 (Read-Only)."}
           </p>
        </div>

        {isAdmin && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button onClick={() => setActiveTab('DATA')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'DATA' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>Data Warga</button>
                <button onClick={() => setActiveTab('REQUESTS')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'REQUESTS' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    Permintaan Perubahan
                    {requests.filter(r => r.status === 'DIAJUKAN').length > 0 && (
                        <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">{requests.filter(r => r.status === 'DIAJUKAN').length}</span>
                    )}
                </button>
                <button onClick={() => setActiveTab('USERS')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-white dark:bg-gray-600 shadow text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    Akun Pengguna
                </button>
            </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'DATA' ? (
        <>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 md:w-64 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder={isAdmin ? "Cari Nama / NIK / Alamat..." : "Cari Nama / Alamat..."} className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                
                {isAdmin && (
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <select 
                            value={filterMode} 
                            onChange={(e) => setFilterMode(e.target.value as any)}
                            className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none"
                        >
                            <option value="ALL">Semua Warga</option>
                            <option value="NEWLY_REGISTERED">Warga Baru (7 Hari)</option>
                            <option value="UNVERIFIED">Menunggu Verifikasi</option>
                            <option value="INCOMPLETE">Data Tidak Lengkap</option>
                            <option value="BANSOS">Penerima Bansos</option>
                        </select>
                        <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition whitespace-nowrap">
                            <Upload size={16} /> Import Data
                        </button>
                        {[UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role) && (
                          <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition whitespace-nowrap">
                              <Download size={16} /> Export Data
                          </button>
                        )}
                        <button onClick={handleOpenAdd} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition whitespace-nowrap">
                            <Plus size={16} /> Tambah Warga
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                {filterMode === 'NEWLY_REGISTERED' && (
                    <div className="mx-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-400">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Warga Baru Bergabung</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Menampilkan {filteredWarga.length} warga yang terdaftar dalam 7 hari terakhir.
                            </p>
                        </div>
                    </div>
                )}

                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase w-12">No</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nama Lengkap</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Alamat</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status Tinggal</th>
                            {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>}
                            {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase text-center">Verifikasi</th>}
                            {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase text-right">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {currentItems.map((warga, index) => {
                            const isWaitingVerif = warga.isDataComplete && !warga.isVerified;
                            const isNew = warga.joinedAt && new Date(warga.joinedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            
                            return (
                                <tr key={warga.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${isWaitingVerif ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''} ${filterMode === 'NEWLY_REGISTERED' ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{warga.namaLengkap}</span>
                                                {isNew && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 shadow-sm animate-pulse">
                                                        <Sparkles size={10} /> WARGA BARU
                                                    </span>
                                                )}
                                                {warga.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                                                {warga.isPenerimaBansos && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] rounded font-bold border border-amber-200 dark:border-amber-800" title="Penerima Bansos">
                                                        <Gift size={10} /> Bansos
                                                    </span>
                                                )}
                                                {isWaitingVerif && <span className="animate-pulse bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Menunggu</span>}
                                            </div>
                                            {isAdmin && <span className="text-xs text-gray-500 font-mono">{warga.nik}</span>}
                                            {isNew && <span className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5 font-medium">Bergabung: {warga.joinedAt}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {warga.alamatRumah || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase border ${
                                            (warga.statusTinggal || StatusTinggal.TETAP) === StatusTinggal.TETAP ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            warga.statusTinggal === StatusTinggal.TETAP_DOMISILI ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            'bg-orange-100 text-orange-700 border-orange-200'
                                        }`}>
                                            {warga.statusTinggal || StatusTinggal.TETAP}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase ${warga.statusKependudukan === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {warga.statusKependudukan || 'AKTIF'}
                                            </span>
                                        </td>
                                    )}
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-center">
                                            {warga.isVerified ? (
                                                <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                                            ) : warga.isDataComplete ? (
                                                <button onClick={() => onNavigate('ADMIN_NOTIFICATIONS')} className="text-blue-600 hover:underline text-xs font-bold flex items-center gap-1 mx-auto">
                                                    <UserCheck size={14} /> Proses
                                                </button>
                                            ) : (
                                                <AlertTriangle size={18} className="text-amber-500 mx-auto" />
                                            )}
                                        </td>
                                    )}
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenDetail(warga)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Lihat Detail">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => handleOpenEdit(warga)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="Ubah Data">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(warga.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Hapus">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredWarga.length)} dari {filteredWarga.length} data
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-300"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Logic to show window of pages could be more complex, but simple version for now
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition ${currentPage === pageNum ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-300"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </>
      ) : activeTab === 'USERS' ? (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 dark:text-white">Manajemen Akun Pengguna</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Cari User..." className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white dark:bg-gray-700 dark:text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Pengguna</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status Login</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase text-right">Aksi Akun</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {currentItems.map((warga, index) => (
                            <tr key={warga.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold overflow-hidden">
                                            {warga.fotoProfil ? <img src={warga.fotoProfil} alt="" className="w-full h-full object-cover" /> : warga.namaLengkap.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{warga.namaLengkap}</p>
                                            <p className="text-xs text-gray-500 font-mono">{warga.nik}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] rounded-full font-bold uppercase ${
                                        warga.role === UserRole.WARGA ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}>
                                        {warga.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleToggleStatus(warga)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition ${
                                            warga.isVerified 
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {warga.isVerified ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {warga.isVerified ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleResetPassword(warga)}
                                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold transition"
                                        >
                                            Reset Password
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEdit(warga)}
                                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold transition"
                                        >
                                            Ubah Role
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700 gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredWarga.length)} dari {filteredWarga.length} data
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-300"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalPages > 5 && currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition ${currentPage === pageNum ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-gray-600 dark:text-gray-300"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="p-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">Permintaan Perubahan Data</h3>
            {requests.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Belum ada permintaan perubahan data.</div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => {
                        const warga = wargaList.find(w => w.id === req.wargaId);
                        return (
                            <div key={req.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-800 dark:text-white">{warga?.namaLengkap || 'Warga Tidak Dikenal'}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            req.status === 'DIAJUKAN' ? 'bg-blue-100 text-blue-700' : 
                                            req.status === 'DISETUJUI' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>{req.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Mengajukan perubahan <span className="font-bold">{req.field}</span> dari <span className="line-through text-red-500 opacity-70">{req.oldValue}</span> menjadi <span className="text-emerald-600 font-bold">{req.newValue}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Alasan: {req.alasan}</p>
                                </div>
                                {req.status === 'DIAJUKAN' && (
                                    <div className="flex gap-2 items-center">
                                        <button onClick={() => onUpdateRequestStatus(req.id, 'DISETUJUI')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700">Setujui</button>
                                        <button onClick={() => {
                                            const reason = prompt("Alasan penolakan:");
                                            if (reason) onUpdateRequestStatus(req.id, 'DITOLAK', reason);
                                        }} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Tolak</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedWarga && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Users className="text-emerald-600" /> Detail Warga
                    </h3>
                    <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0">
                            {selectedWarga.fotoProfil ? (
                                <img src={selectedWarga.fotoProfil} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedWarga.namaLengkap}</h2>
                            <p className="text-gray-500 font-mono mb-3">{selectedWarga.nik}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-2 py-1 text-xs rounded-lg font-bold ${selectedWarga.jenisKelamin === Gender.LAKI_LAKI ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                    {selectedWarga.jenisKelamin}
                                </span>
                                <span className="px-2 py-1 text-xs rounded-lg font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                    {selectedWarga.agama}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-lg font-bold border ${
                                    (selectedWarga.statusTinggal || StatusTinggal.TETAP) === StatusTinggal.TETAP ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    selectedWarga.statusTinggal === StatusTinggal.TETAP_DOMISILI ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-orange-100 text-orange-700 border-orange-200'
                                }`}>
                                    {selectedWarga.statusTinggal || StatusTinggal.TETAP}
                                </span>
                                {selectedWarga.isPenerimaBansos && (
                                    <span className="px-2 py-1 text-xs rounded-lg font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                                        <Gift size={12} /> Penerima Bansos
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Tempat, Tanggal Lahir</label>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 dark:text-white">
                                    <Calendar size={16} className="text-emerald-500" />
                                    {selectedWarga.tempatLahir}, {selectedWarga.tanggalLahir}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 dark:text-white">
                                    <Briefcase size={16} className="text-emerald-500" />
                                    {selectedWarga.pekerjaan || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Status Perkawinan</label>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 dark:text-white">
                                    <Heart size={16} className="text-emerald-500" />
                                    {selectedWarga.statusPerkawinan}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Alamat Rumah</label>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 dark:text-white">
                                    <MapPin size={16} className="text-emerald-500" />
                                    {selectedWarga.alamatRumah}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Nomor HP / WA</label>
                                <div className="flex items-center gap-2 mt-1 text-gray-800 dark:text-white">
                                    <Phone size={16} className="text-emerald-500" />
                                    {selectedWarga.noHP}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Status Kependudukan</label>
                                <div className="mt-1">
                                    <span className={`px-2 py-1 text-xs rounded font-bold ${selectedWarga.statusKependudukan === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedWarga.statusKependudukan}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                    <button onClick={() => setIsDetailOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {formMode === 'ADD' ? 'Tambah Warga Baru' : 'Edit Data Warga'}
                    </h3>
                    <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {formMode === 'ADD' && (
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Mode Input Keluarga</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="familyMode" 
                              checked={familyMode === 'NEW'} 
                              onChange={() => {
                                setFamilyMode('NEW');
                                setSelectedWarga(prev => ({...prev, noKK: '', alamatRumah: ''}));
                                setSelectedFamily(null);
                              }}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Keluarga Baru (KK Baru)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="familyMode" 
                              checked={familyMode === 'EXISTING'} 
                              onChange={() => setFamilyMode('EXISTING')}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Tambah Anggota Keluarga (KK Ada)</span>
                          </label>
                        </div>

                        {familyMode === 'EXISTING' && (
                          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Cari No KK atau Nama Kepala Keluarga..." 
                                className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
                                value={searchKK}
                                onChange={(e) => setSearchKK(e.target.value)}
                              />
                              <button 
                                type="button" 
                                onClick={() => searchFamily(searchKK)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                              >
                                Cari
                              </button>
                            </div>
                            {selectedFamily && (
                              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600">
                                  <CheckCircle size={16} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-800 dark:text-white">KK: {selectedFamily.noKK}</p>
                                  <p className="text-xs text-gray-500">Kepala: {selectedFamily.namaLengkap}</p>
                                  <p className="text-xs text-gray-500">{selectedFamily.alamatRumah}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                            <input required type="text" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.namaLengkap || ''} onChange={e => setSelectedWarga({...selectedWarga, namaLengkap: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">NIK</label>
                            <input required type="text" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.nik || ''} onChange={e => setSelectedWarga({...selectedWarga, nik: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No KK</label>
                            <input 
                              required 
                              type="text" 
                              className={`w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 ${familyMode === 'EXISTING' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                              value={selectedWarga.noKK || ''} 
                              onChange={e => setSelectedWarga({...selectedWarga, noKK: e.target.value})}
                              readOnly={familyMode === 'EXISTING'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
                            <input required type="text" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.tempatLahir || ''} onChange={e => setSelectedWarga({...selectedWarga, tempatLahir: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                            <input required type="date" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.tanggalLahir || ''} onChange={e => setSelectedWarga({...selectedWarga, tanggalLahir: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                            <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.jenisKelamin} onChange={e => setSelectedWarga({...selectedWarga, jenisKelamin: e.target.value as Gender})}>
                                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Agama</label>
                            <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.agama} onChange={e => setSelectedWarga({...selectedWarga, agama: e.target.value as Agama})}>
                                {Object.values(Agama).map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pekerjaan</label>
                            <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.pekerjaan || ''} onChange={e => setSelectedWarga({...selectedWarga, pekerjaan: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status Perkawinan</label>
                            <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.statusPerkawinan} onChange={e => setSelectedWarga({...selectedWarga, statusPerkawinan: e.target.value as StatusPerkawinan})}>
                                {Object.values(StatusPerkawinan).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status Tinggal</label>
                            <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.statusTinggal || StatusTinggal.TETAP} onChange={e => setSelectedWarga({...selectedWarga, statusTinggal: e.target.value as StatusTinggal})}>
                                {Object.values(StatusTinggal).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Alamat Rumah</label>
                            <textarea 
                              className={`w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 ${familyMode === 'EXISTING' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                              rows={2} 
                              value={selectedWarga.alamatRumah || ''} 
                              onChange={e => setSelectedWarga({...selectedWarga, alamatRumah: e.target.value})}
                              readOnly={familyMode === 'EXISTING'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No HP / WA</label>
                            <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.noHP || ''} onChange={e => setSelectedWarga({...selectedWarga, noHP: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Role Akun</label>
                            <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={selectedWarga.role} onChange={e => setSelectedWarga({...selectedWarga, role: e.target.value as UserRole})}>
                                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        
                        <div className="col-span-2 mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-3">Status Khusus</h4>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" checked={selectedWarga.isKepalaKeluarga || false} onChange={e => setSelectedWarga({...selectedWarga, isKepalaKeluarga: e.target.checked})} />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Kepala Keluarga</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" checked={selectedWarga.isPenerimaBansos || false} onChange={e => setSelectedWarga({...selectedWarga, isPenerimaBansos: e.target.checked})} />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <Gift size={14} className="text-amber-500" /> Penerima Bansos
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
                    <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Batal
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none">
                        Simpan Data
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CitizenManagement;
