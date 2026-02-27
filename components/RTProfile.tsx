
import React, { useState } from 'react';
import { Target, Users, MapPin, Award, History, Landmark, Shield, Heart, Zap, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { RTProfileData, SeksiOrganisasi, AppConfig } from '../types';

interface RTProfileProps {
  data: RTProfileData;
  appConfig: AppConfig;
  onUpdate: (newData: RTProfileData) => void;
  isEditable: boolean;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const RTProfile: React.FC<RTProfileProps> = ({ data, appConfig, onUpdate, isEditable, onShowToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<RTProfileData>(data);

  // Handlers for Form Updates
  const handleVisiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, visi: e.target.value });
  };

  const handleSejarahChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, sejarah: e.target.value });
  };

  const handleDeskripsiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, deskripsi: e.target.value });
  };

  // Misi Handlers
  const handleMisiChange = (index: number, value: string) => {
    const newMisi = [...formData.misi];
    newMisi[index] = value;
    setFormData({ ...formData, misi: newMisi });
  };

  const handleAddMisi = () => {
    setFormData({ ...formData, misi: [...formData.misi, ""] });
  };

  const handleRemoveMisi = (index: number) => {
    const newMisi = formData.misi.filter((_, i) => i !== index);
    setFormData({ ...formData, misi: newMisi });
  };

  // Struktur Handlers
  const handlePejabatChange = (field: 'ketuaRT' | 'sekretaris' | 'bendahara', value: string) => {
    setFormData({
      ...formData,
      struktur: { ...formData.struktur, [field]: value }
    });
  };

  // Seksi Handlers
  const handleAddSeksi = () => {
    const newSeksi: SeksiOrganisasi = {
      id: Date.now().toString(),
      jabatan: "",
      namaPejabat: ""
    };
    setFormData({
      ...formData,
      struktur: { ...formData.struktur, seksi: [...formData.struktur.seksi, newSeksi] }
    });
  };

  const handleSeksiChange = (id: string, field: 'jabatan' | 'namaPejabat', value: string) => {
    const newSeksi = formData.struktur.seksi.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    setFormData({
      ...formData,
      struktur: { ...formData.struktur, seksi: newSeksi }
    });
  };

  const handleRemoveSeksi = (id: string) => {
    const newSeksi = formData.struktur.seksi.filter(s => s.id !== id);
    setFormData({
      ...formData,
      struktur: { ...formData.struktur, seksi: newSeksi }
    });
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-10 relative">
      {/* Admin Action Bar */}
      {isEditable && (
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              <Edit size={16} /> Edit Profil RT
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <X size={16} /> Batal
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <Save size={16} /> Simpan Perubahan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-emerald-900 text-white min-h-[240px] flex items-center border border-emerald-800">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10 p-8 md:p-12 max-w-3xl w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-sm shadow-sm">
            <Landmark size={12} /> Profil Wilayah
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-sm">{appConfig.appName}</h1>
          
          {isEditing ? (
             <div className="bg-black/20 rounded-lg p-1 backdrop-blur-sm">
                <textarea 
                    value={formData.deskripsi || ""}
                    onChange={handleDeskripsiChange}
                    className="w-full bg-transparent border border-white/30 rounded-md p-3 text-emerald-100 text-lg leading-relaxed focus:bg-black/30 focus:outline-none resize-none h-32 placeholder-emerald-200/50"
                    placeholder="Masukkan deskripsi profil wilayah..."
                />
             </div>
          ) : (
             <p className="text-emerald-100 text-lg leading-relaxed drop-shadow-sm">
               {formData.deskripsi || `Mewujudkan lingkungan ${appConfig.regionName} yang guyub, rukun, aman, dan sejahtera melalui gotong royong dan digitalisasi pelayanan.`}
             </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Visi Misi & Sejarah */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Visi & Misi */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${isEditing ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-100 dark:border-gray-700'} overflow-hidden transition-all`}>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 border-b border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
              <Target className="text-emerald-600 dark:text-emerald-400" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Visi & Misi</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Visi</h3>
                {isEditing ? (
                  <textarea 
                    value={formData.visi}
                    onChange={handleVisiChange}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px] bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Masukkan Visi RT..."
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 italic border-l-4 border-emerald-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                    "{formData.visi}"
                  </p>
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white">Misi</h3>
                   {isEditing && (
                     <button onClick={handleAddMisi} className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                       <Plus size={14} /> Tambah Misi
                     </button>
                   )}
                </div>
                <ul className="space-y-3">
                  {formData.misi.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 group">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      {isEditing ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={item}
                            onChange={(e) => handleMisiChange(idx, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                          />
                          <button onClick={() => handleRemoveMisi(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="leading-relaxed">{item}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sejarah Singkat */}
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${isEditing ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-100 dark:border-gray-700'} overflow-hidden transition-all`}>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2">
              <History className="text-blue-600 dark:text-blue-400" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Sekilas Sejarah</h2>
            </div>
            <div className="p-6 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
              {isEditing ? (
                <textarea 
                  value={formData.sejarah}
                  onChange={handleSejarahChange}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px] bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Ceritakan sejarah pembentukan RT..."
                />
              ) : (
                formData.sejarah.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                ))
              )}
            </div>
          </div>

          {/* Peta Lokasi (Static for MVP) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <MapPin className="text-red-500 dark:text-red-400" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Lokasi Wilayah</h2>
            </div>
            <div className="h-80 w-full bg-gray-200 dark:bg-gray-700 relative">
               {/* Embed Google Maps (Pointing to Rancamanyar Area) */}
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15841.66622846465!2d107.592!3d-6.985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e906b3286b5b%3A0x401e8f1fc28c6f0!2sRancamanyar%2C%20Baleendah%2C%20Bandung%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1620000000000!5m2!1sen!2sid"
                width="100%" 
                height="100%" 
                style={{border:0, filter: 'grayscale(0.2) contrast(1.1) opacity(0.9)'}} 
                allowFullScreen={true} 
                loading="lazy" 
                title="Peta Rancamanyar"
              ></iframe>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-white dark:bg-gray-800">
               <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-1">Kecamatan</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Baleendah</span>
               </div>
               <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wider mb-1">Kabupaten</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Bandung</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Struktur Organisasi */}
        <div className="space-y-8">
           <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${isEditing ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-100 dark:border-gray-700'} overflow-hidden transition-all`}>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 border-b border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
              <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
              <h2 className="font-bold text-gray-800 dark:text-white">Struktur Pengurus</h2>
            </div>
            
            <div className="p-6 relative">
              {/* Vertical Line Connector */}
              {!isEditing && <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-200 dark:bg-gray-700"></div>}

              {/* Ketua RT */}
              <div className="relative flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-emerald-100 dark:bg-emerald-900 z-10 flex items-center justify-center overflow-hidden shrink-0">
                   <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=200&h=200" alt="Ketua RT" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                   <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ketua RT</span>
                   {isEditing ? (
                     <input 
                      type="text" 
                      value={formData.struktur.ketuaRT}
                      onChange={(e) => handlePejabatChange('ketuaRT', e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                     />
                   ) : (
                     <>
                        <h4 className="font-bold text-gray-800 dark:text-white">{formData.struktur.ketuaRT}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Periode 2023 - 2028</p>
                     </>
                   )}
                </div>
              </div>

              {/* Sekretaris */}
              <div className="relative flex items-center gap-4 mb-8">
                 {!isEditing && <div className="absolute left-8 -ml-[33px] top-1/2 w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>}
                 <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-blue-100 dark:bg-blue-900 z-10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    S
                 </div>
                 <div className="flex-1">
                   <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Sekretaris</span>
                   {isEditing ? (
                     <input 
                      type="text" 
                      value={formData.struktur.sekretaris}
                      onChange={(e) => handlePejabatChange('sekretaris', e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                     />
                   ) : (
                     <h4 className="font-bold text-gray-800 dark:text-white">{formData.struktur.sekretaris}</h4>
                   )}
                 </div>
              </div>

              {/* Bendahara */}
              <div className="relative flex items-center gap-4 mb-8">
                 {!isEditing && <div className="absolute left-8 -ml-[33px] top-1/2 w-8 h-0.5 bg-gray-200 dark:bg-gray-700"></div>}
                 <div className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-amber-100 dark:bg-amber-900 z-10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
                    B
                 </div>
                 <div className="flex-1">
                   <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Bendahara</span>
                   {isEditing ? (
                     <input 
                      type="text" 
                      value={formData.struktur.bendahara}
                      onChange={(e) => handlePejabatChange('bendahara', e.target.value)}
                      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                     />
                   ) : (
                     <h4 className="font-bold text-gray-800 dark:text-white">{formData.struktur.bendahara}</h4>
                   )}
                 </div>
              </div>

              {/* Seksi Seksi */}
              <div className={`${isEditing ? '' : 'pl-20'} space-y-4`}>
                 <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase">Seksi - Seksi</h5>
                    {isEditing && (
                        <button onClick={handleAddSeksi} className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
                        <Plus size={14} />
                        </button>
                    )}
                 </div>
                 
                 {formData.struktur.seksi.map((seksi) => (
                    <div key={seksi.id} className={`flex items-start gap-3 ${isEditing ? 'bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600' : ''}`}>
                        <div className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 shrink-0 ${isEditing ? 'hidden' : 'block'}`}>
                            {seksi.jabatan.toLowerCase().includes('aman') ? <Shield size={16}/> : 
                             seksi.jabatan.toLowerCase().includes('bangun') ? <Zap size={16}/> : <Heart size={16}/>}
                        </div>
                        <div className="flex-1">
                           {isEditing ? (
                             <div className="space-y-2">
                                <input 
                                  type="text" 
                                  placeholder="Nama Jabatan"
                                  value={seksi.jabatan}
                                  onChange={(e) => handleSeksiChange(seksi.id, 'jabatan', e.target.value)}
                                  className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Nama Pejabat"
                                  value={seksi.namaPejabat}
                                  onChange={(e) => handleSeksiChange(seksi.id, 'namaPejabat', e.target.value)}
                                  className="w-full p-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium focus:ring-1 focus:ring-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white"
                                />
                             </div>
                           ) : (
                             <>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{seksi.jabatan}</p>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{seksi.namaPejabat}</p>
                             </>
                           )}
                        </div>
                        {isEditing && (
                            <button onClick={() => handleRemoveSeksi(seksi.id)} className="text-red-400 hover:text-red-600 p-1 self-center">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                 ))}
              </div>
            </div>
           </div>

           {/* Quick Stats */}
           <div className="bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-800 dark:to-teal-900 rounded-xl shadow-lg p-6 text-white border border-emerald-500 dark:border-emerald-700">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Award size={20} /> Prestasi Lingkungan
              </h3>
              <ul className="space-y-3 text-sm text-emerald-100">
                 <li className="flex gap-2">
                    <span className="text-yellow-400">★</span> Juara 1 Lomba Kebersihan Desa (2023)
                 </li>
                 <li className="flex gap-2">
                    <span className="text-yellow-400">★</span> RT Teladan Taat Pajak (2022)
                 </li>
                 <li className="flex gap-2">
                    <span className="text-yellow-400">★</span> Poskamling Terbaik se-RW 19 (2024)
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RTProfile;
