
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Calendar, Tag, X, Upload, ZoomIn, Search } from 'lucide-react';
import { GaleriItem, Warga, UserRole } from '../types';

interface ActivityGalleryProps {
  items: GaleriItem[];
  onAdd: (item: GaleriItem) => void;
  onDelete: (id: string) => void;
  currentUser: Warga;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const ActivityGallery: React.FC<ActivityGalleryProps> = ({ items, onAdd, onDelete, currentUser, onShowToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GaleriItem | null>(null);
  const [filterKategori, setFilterKategori] = useState<string>('ALL');
  const [filePreview, setFilePreview] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<GaleriItem>>({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    kategori: 'KERJA_BAKTI',
    deskripsi: '',
    imageUrl: ''
  });

  const canEdit = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("Ukuran file terlalu besar. Maksimal 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFilePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.imageUrl) {
        onShowToast("Judul dan Foto wajib diisi.", 'error');
        return;
    }

    const newItem: GaleriItem = {
      id: Date.now().toString(),
      judul: formData.judul!,
      tanggal: formData.tanggal!,
      kategori: formData.kategori as GaleriItem['kategori'],
      deskripsi: formData.deskripsi || '',
      imageUrl: formData.imageUrl!,
      uploadedBy: currentUser.role
    };

    onAdd(newItem);
    setShowForm(false);
    // Reset Form
    setFormData({
      judul: '',
      tanggal: new Date().toISOString().split('T')[0],
      kategori: 'KERJA_BAKTI',
      deskripsi: '',
      imageUrl: ''
    });
    setFilePreview('');
  };

  const filteredItems = items.filter(item => 
    filterKategori === 'ALL' || item.kategori === filterKategori
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ImageIcon className="text-emerald-600 dark:text-emerald-400" /> Galeri Kegiatan
           </h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">Arsip dokumentasi kegiatan warga RT 06.</p>
        </div>
        
        {canEdit && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
          >
            <Plus size={18} /> Tambah Kegiatan
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {['ALL', 'KERJA_BAKTI', 'RAPAT', 'LOMBA', 'SOSIAL', 'LAINNYA'].map((cat) => (
            <button
                key={cat}
                onClick={() => setFilterKategori(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    filterKategori === cat 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                }`}
            >
                {cat === 'ALL' ? 'Semua' : cat.replace('_', ' ')}
            </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-md transition dark:hover:border-gray-600">
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(item)}>
                    <img 
                        src={item.imageUrl} 
                        alt={item.judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="text-white drop-shadow-md" size={32} />
                    </div>
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-bold text-emerald-800 dark:text-emerald-400 rounded">
                        {item.kategori.replace('_', ' ')}
                    </span>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">{item.judul}</h3>
                        {canEdit && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm('Hapus foto kegiatan ini?')) onDelete(item.id);
                                }}
                                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-10">{item.deskripsi}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Calendar size={12} /> {item.tanggal}
                    </div>
                </div>
            </div>
        ))}
        {filteredItems.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <p>Belum ada foto kegiatan.</p>
            </div>
        )}
      </div>

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tambah Kegiatan Baru</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Foto</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            {filePreview ? (
                                <img src={filePreview} alt="Preview" className="h-40 object-contain rounded" />
                            ) : (
                                <>
                                    <Upload size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Klik untuk upload foto (Max 2MB)</span>
                                </>
                            )}
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                hidden 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Kegiatan</label>
                            <input 
                                required
                                type="text"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                value={formData.judul}
                                onChange={e => setFormData({...formData, judul: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                            <input 
                                required
                                type="date"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                value={formData.tanggal}
                                onChange={e => setFormData({...formData, tanggal: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                        <select 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                            value={formData.kategori}
                            onChange={e => setFormData({...formData, kategori: e.target.value as GaleriItem['kategori']})}
                        >
                            <option value="KERJA_BAKTI">Kerja Bakti</option>
                            <option value="RAPAT">Rapat / Musyawarah</option>
                            <option value="LOMBA">Lomba / HUT RI</option>
                            <option value="SOSIAL">Sosial / Kunjungan</option>
                            <option value="LAINNYA">Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Singkat</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg h-24 resize-none focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                            value={formData.deskripsi}
                            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-md">
                        Simpan Kegiatan
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Lightbox / View Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X size={32} />
            </button>
            <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img 
                    src={selectedImage.imageUrl} 
                    alt={selectedImage.judul} 
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-gray-900" 
                />
                <div className="mt-4 text-center text-white">
                    <h3 className="text-xl font-bold">{selectedImage.judul}</h3>
                    <p className="text-white/80 mt-1">{selectedImage.deskripsi}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">
                        {selectedImage.tanggal} • {selectedImage.kategori.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGallery;
