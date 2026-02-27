
import React, { useState, useRef } from 'react';
import { ShoppingBag, Search, Plus, Filter, MessageCircle, Tag, Store, Trash2, X, Camera, Check } from 'lucide-react';
import { UMKMProduct, Warga, UMKMCategory, UserRole } from '../types';

interface UMKMProps {
  products: UMKMProduct[];
  onAddProduct: (product: UMKMProduct) => void;
  onDeleteProduct: (id: string) => void;
  currentUser: Warga;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const UMKM: React.FC<UMKMProps> = ({ products, onAddProduct, onDeleteProduct, currentUser, onShowToast }) => {
  const [activeCategory, setActiveCategory] = useState<UMKMCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<UMKMProduct>>({
    name: '',
    description: '',
    price: 0,
    category: 'MAKANAN',
    imageUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.sellerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast("Ukuran foto maksimal 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.imageUrl) {
        onShowToast("Nama, Harga, dan Foto wajib diisi.", 'error');
        return;
    }

    const newProduct: UMKMProduct = {
        id: `PROD-${Date.now()}`,
        sellerId: currentUser.id,
        sellerName: currentUser.namaLengkap,
        name: formData.name!,
        description: formData.description || '',
        price: Number(formData.price),
        category: formData.category as UMKMCategory,
        imageUrl: formData.imageUrl!,
        whatsapp: currentUser.noHP || '', // Fallback empty if no HP, but user should have one
        isAvailable: true,
        createdAt: new Date().toISOString().split('T')[0]
    };

    if (!newProduct.whatsapp) {
        onShowToast("Anda belum mengatur No HP di profil.", 'error');
        return;
    }

    onAddProduct(newProduct);
    setShowForm(false);
    setFormData({
        name: '', description: '', price: 0, category: 'MAKANAN', imageUrl: ''
    });
  };

  const handleWhatsAppClick = (product: UMKMProduct) => {
      const message = `Halo ${product.sellerName}, saya warga RT 06 tertarik dengan produk *${product.name}* yang ada di Aplikasi ERGEN. Masih tersedia?`;
      const url = `https://wa.me/62${product.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
         <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-bold mb-3 backdrop-blur-md">
                  <Store size={14} /> Etalase Ekonomi Warga
               </div>
               <h1 className="text-3xl font-bold mb-2">UMKM Ergen</h1>
               <p className="text-orange-50 max-w-xl text-sm leading-relaxed">
                  Dukung usaha tetangga sendiri! Temukan aneka jajanan, katering, jasa, dan produk kreatif dari warga RT 06 RW 19.
               </p>
            </div>
            <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold shadow-lg hover:bg-orange-50 transition flex items-center gap-2 active:scale-95"
            >
                <Plus size={18} /> Jual Produk
            </button>
         </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-0 z-20 bg-gray-100 dark:bg-gray-900 pt-2 pb-4">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-3">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari nasi uduk, jasa laundry, dll..."
                    className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
                {['ALL', 'MAKANAN', 'MINUMAN', 'JASA', 'FASHION', 'KERAJINAN'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                            activeCategory === cat 
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {cat === 'ALL' ? 'Semua' : cat}
                    </button>
                ))}
             </div>
          </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {filteredProducts.map(product => (
             <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col">
                 <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                     <div className="absolute top-2 left-2">
                         <span className="px-2 py-1 bg-white/90 dark:bg-black/70 backdrop-blur-sm text-[10px] font-bold rounded text-gray-800 dark:text-gray-200 uppercase">
                             {product.category}
                         </span>
                     </div>
                     {(product.sellerId === currentUser.id || isAdmin) && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); if(window.confirm('Hapus produk ini?')) onDeleteProduct(product.id); }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-600"
                         >
                             <Trash2 size={14} />
                         </button>
                     )}
                 </div>
                 <div className="p-3 flex-1 flex flex-col">
                     <h3 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                     <p className="text-orange-600 dark:text-orange-400 font-bold text-sm mb-2">Rp {product.price.toLocaleString('id-ID')}</p>
                     
                     <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                         <div className="flex items-center gap-1.5 overflow-hidden">
                             <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[10px] font-bold text-orange-700 dark:text-orange-400 shrink-0">
                                 {product.sellerName.charAt(0)}
                             </div>
                             <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.sellerName}</span>
                         </div>
                         <button 
                            onClick={() => handleWhatsAppClick(product)}
                            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-sm"
                            title="Chat via WhatsApp"
                         >
                             <MessageCircle size={16} />
                         </button>
                     </div>
                 </div>
             </div>
         ))}
      </div>

      {filteredProducts.length === 0 && (
          <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Belum ada produk di kategori ini.</p>
          </div>
      )}

      {/* Add Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 border border-gray-100 dark:border-gray-700">
                <div className="bg-orange-500 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Store size={20} /> Jual Produk Anda</h3>
                    <button onClick={() => setShowForm(false)}><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Nama Produk</label>
                        <input 
                            required
                            type="text"
                            placeholder="Contoh: Nasi Goreng Spesial"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Harga (Rp)</label>
                            <input 
                                required
                                type="number"
                                placeholder="15000"
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Kategori</label>
                            <select 
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value as any})}
                            >
                                <option value="MAKANAN">Makanan</option>
                                <option value="MINUMAN">Minuman</option>
                                <option value="JASA">Jasa</option>
                                <option value="FASHION">Fashion</option>
                                <option value="KERAJINAN">Kerajinan</option>
                                <option value="LAINNYA">Lainnya</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Deskripsi Singkat</label>
                        <textarea 
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none text-sm"
                            placeholder="Jelaskan produk anda..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Foto Produk</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition h-32 relative overflow-hidden"
                        >
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Camera size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Klik Upload Foto</span>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-2">
                        <MessageCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                            Pembeli akan diarahkan ke nomor WhatsApp Anda: <strong>{currentUser.noHP || 'Belum diatur'}</strong>. Pastikan nomor aktif di profil.
                        </p>
                    </div>

                    <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg flex justify-center items-center gap-2">
                        <Check size={18} /> Posting Produk
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UMKM;
