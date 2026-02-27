import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Building, MapPin, FileText, DollarSign, Info, ShieldAlert } from 'lucide-react';
import { AppConfig, UserRole, Warga } from '../types';
import { INITIAL_APP_CONFIG } from '../constants';

interface SettingsProps {
  appConfig: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  currentUser: Warga;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const Settings: React.FC<SettingsProps> = ({ appConfig, onUpdateConfig, currentUser, onShowToast }) => {
  const [formData, setFormData] = useState<AppConfig>(appConfig);
  const [isDirty, setIsDirty] = useState(false);

  // Update local state when prop changes (e.g. after reset)
  useEffect(() => {
    setFormData(appConfig);
    setIsDirty(false);
  }, [appConfig]);

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);

  const handleChange = (field: keyof AppConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleIuranChange = (field: 'besaran' | 'nama', value: any) => {
    setFormData(prev => ({
      ...prev,
      iuranConfig: {
        besaran: 0,
        nama: 'Iuran Wajib',
        ...(prev.iuranConfig || {}),
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    setIsDirty(false);
    onShowToast("Pengaturan aplikasi berhasil disimpan.", "success");
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan pengaturan ke default?")) {
      onUpdateConfig(INITIAL_APP_CONFIG);
      onShowToast("Pengaturan dikembalikan ke default.", "success");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Akses Ditolak</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Maaf, halaman pengaturan hanya dapat diakses oleh Pengurus RT (Ketua RT & Sekretaris).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Building className="text-emerald-600" />
            Pengaturan Aplikasi
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Konfigurasi identitas wilayah dan parameter sistem.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-bold"
          >
            <RotateCcw size={16} />
            Reset Default
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition shadow-lg ${
              isDirty 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={16} />
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identitas Wilayah */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <MapPin size={18} className="text-emerald-500" />
              Identitas Wilayah
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Aplikasi / Header</label>
                <input 
                  type="text" 
                  value={formData.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white"
                  placeholder="Contoh: SIAGA ERGEN"
                />
                <p className="text-xs text-gray-400 mt-1">Teks utama yang muncul di sidebar dan header.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Wilayah / Sub-Header</label>
                <input 
                  type="text" 
                  value={formData.regionName}
                  onChange={(e) => handleChange('regionName', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white"
                  placeholder="Contoh: RT 06 RW 19 Desa Rancamanyar"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Singkat (Hero)</label>
                <textarea 
                  value={formData.heroDescription}
                  onChange={(e) => handleChange('heroDescription', e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white resize-none"
                  placeholder="Deskripsi singkat tentang aplikasi..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logo URL (Opsional)</label>
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                        {formData.logoUrl ? (
                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-xs font-bold text-gray-400">No Logo</span>
                        )}
                    </div>
                    <input 
                        type="text" 
                        value={formData.logoUrl || ''}
                        onChange={(e) => handleChange('logoUrl', e.target.value)}
                        className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white text-sm"
                        placeholder="https://..."
                    />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <DollarSign size={18} className="text-emerald-500" />
              Konfigurasi Keuangan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Iuran Wajib</label>
                <input 
                  type="text" 
                  value={formData.iuranConfig?.nama || ''}
                  onChange={(e) => handleIuranChange('nama', e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nominal Iuran (Rp)</label>
                <input 
                  type="number" 
                  value={formData.iuranConfig?.besaran || 0}
                  onChange={(e) => handleIuranChange('besaran', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-start gap-3">
              <Info className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Informasi Sistem</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                  Perubahan pengaturan ini akan berdampak langsung pada tampilan seluruh pengguna. Pastikan data yang dimasukkan sudah benar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
             <h3 className="font-bold text-gray-800 dark:text-white mb-4">Versi Aplikasi</h3>
             <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Versi</span>
                    <span className="font-mono font-bold">v1.2.0</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Build</span>
                    <span className="font-mono font-bold">Production</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Terakhir Update</span>
                    <span className="font-mono font-bold">Mei 2024</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
