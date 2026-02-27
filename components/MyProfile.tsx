
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, CreditCard, Bell, Shield, Users as UsersIcon, 
  Lock, Edit3, History, FileInput, CheckCircle, XCircle, Clock,
  AlertCircle, Camera, LogOut, Check, FileText, Wallet, Calendar,
  Upload, Save, AlertTriangle, MapPin, Home, X, Sparkles, Loader2,
  ChevronRight, ChevronLeft, Info, ShieldCheck, BadgeCheck, UserCircle, Smartphone
} from 'lucide-react';
import { Warga, Keuangan, ChangeRequest, UserNotification, ActivityLog, ViewState, UserRole, StatusTinggal, Gender, Agama, StatusPerkawinan } from '../types';
import { INITIAL_LOGS } from '../constants';
import { getRegionZipCode, extractKTPData } from '../services/geminiService';

interface MyProfileProps {
  currentUser: Warga;
  familyMembers: Warga[];
  financialHistory: Keuangan[];
  notifications: UserNotification[];
  requests: ChangeRequest[];
  wargaList: Warga[];
  onUpdateProfile: (updatedWarga: Warga) => void;
  onLogout: () => void;
  onMarkAsRead: (id: string) => void;
  onAddRequest: (req: ChangeRequest) => void;
  onNavigate: (view: ViewState) => void;
  onSendNotification: (notif: UserNotification) => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

type TabType = 'IKHTISAR' | 'KEUANGAN' | 'EDIT_AKUN' | 'PENGAJUAN' | 'LOG';

interface DetailedAddress {
  jalan: string;
  blok: string;
  nomor: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  kodepos: string;
}

const MyProfile: React.FC<MyProfileProps> = ({ currentUser, familyMembers, financialHistory, notifications, requests, wargaList, onUpdateProfile, onLogout, onMarkAsRead, onAddRequest, onNavigate, onSendNotification, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<TabType>('IKHTISAR');
  const [logs] = useState<ActivityLog[]>(INITIAL_LOGS.filter(l => l.userId === currentUser.id));
  
  // Wizard State
  const [showEditModal, setShowEditModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [completionForm, setCompletionForm] = useState<Partial<Warga>>(currentUser);
  const [domisiliSamaKTP, setDomisiliSamaKTP] = useState(true);
  const [statusTinggal, setStatusTinggal] = useState<StatusTinggal>(StatusTinggal.TETAP);
  const [infoPemilikRumah, setInfoPemilikRumah] = useState({ nama: '', noHP: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address States
  const initialAddressState: DetailedAddress = {
    jalan: '', blok: '', nomor: '', rt: '06', rw: '19', kelurahan: 'Rancamanyar', kecamatan: 'Baleendah', kota: 'Bandung', kodepos: ''
  };
  const [ktpAddress, setKtpAddress] = useState<DetailedAddress>(initialAddressState);
  const [domisiliAddress, setDomisiliAddress] = useState<DetailedAddress>(initialAddressState);
  const [loadingZipKTP, setLoadingZipKTP] = useState(false);
  const [loadingZipDom, setLoadingZipDom] = useState(false);
  const [isScanningKTP, setIsScanningKTP] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const isDataIncomplete = !currentUser.isDataComplete;
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Proper Case for Indonesian addresses (handles abbreviations)
  const toProperCase = (str: string) => {
    if (!str) return "";
    const exclusions = ['RT', 'RW', 'KTP', 'KK', 'NIK', 'ID', 'AC', 'WA', 'KAV', 'BTN', 'PT', 'CV'];
    return str.split(' ').map(word => {
      const upperWord = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (exclusions.includes(upperWord)) return word.toUpperCase();
      if (upperWord === 'JL' || upperWord === 'JLN') return 'Jl.';
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    }).join(' ');
  };

  const handleScanKTP = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsScanningKTP(true);
      onShowToast("Sedang memindai KTP dengan AI...", "success");
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          const data = await extractKTPData(base64);
          
          if (data) {
              // Helper to normalize Enum values
              const normalizeEnum = (val: string | undefined, enumObj: any, map: Record<string, string> = {}) => {
                  if (!val) return undefined;
                  const upper = val.toUpperCase().trim();
                  // Check direct match
                  if (Object.values(enumObj).includes(upper)) return upper;
                  // Check map
                  for (const [k, v] of Object.entries(map)) {
                      if (upper.includes(k)) return v;
                  }
                  return undefined;
              };

              const genderMap = { 'LAKI': Gender.LAKI_LAKI, 'PRIA': Gender.LAKI_LAKI, 'PEREMPUAN': Gender.PEREMPUAN, 'WANITA': Gender.PEREMPUAN };
              const agamaMap = { 'ISLAM': Agama.ISLAM, 'KRISTEN': Agama.KRISTEN, 'KATOLIK': Agama.KATOLIK, 'HINDU': Agama.HINDU, 'BUDDHA': Agama.BUDDHA, 'KONGHUCU': Agama.KONGHUCU };
              const statusMap = { 'BELUM': StatusPerkawinan.BELUM_KAWIN, 'LAJANG': StatusPerkawinan.BELUM_KAWIN, 'KAWIN': StatusPerkawinan.KAWIN, 'NIKAH': StatusPerkawinan.KAWIN, 'CERAI HIDUP': StatusPerkawinan.CERAI_HIDUP, 'CERAI MATI': StatusPerkawinan.CERAI_MATI };

              setCompletionForm(prev => ({
                  ...prev,
                  nik: data.nik ? data.nik.replace(/\D/g, '') : prev.nik,
                  namaLengkap: toProperCase(data.nama) || prev.namaLengkap,
                  tempatLahir: toProperCase(data.tempatLahir) || prev.tempatLahir,
                  tanggalLahir: data.tanggalLahir || prev.tanggalLahir,
                  pekerjaan: toProperCase(data.pekerjaan) || prev.pekerjaan,
                  jenisKelamin: normalizeEnum(data.jenisKelamin, Gender, genderMap) as Gender || prev.jenisKelamin,
                  agama: normalizeEnum(data.agama, Agama, agamaMap) as Agama || prev.agama,
                  statusPerkawinan: normalizeEnum(data.statusPerkawinan, StatusPerkawinan, statusMap) as StatusPerkawinan || prev.statusPerkawinan,
              }));
              
              setKtpAddress(prev => ({
                  ...prev,
                  jalan: toProperCase(data.alamat) || prev.jalan,
                  rt: data.rt ? data.rt.replace(/\D/g, '') : prev.rt,
                  rw: data.rw ? data.rw.replace(/\D/g, '') : prev.rw,
                  kelurahan: toProperCase(data.kelurahan) || prev.kelurahan,
                  kecamatan: toProperCase(data.kecamatan) || prev.kecamatan,
                  kota: toProperCase(data.kota) || prev.kota,
              }));
              
              onShowToast("Data berhasil diekstrak dari KTP!", "success");
          } else {
              onShowToast("Gagal mengekstrak data. Pastikan foto jelas.", "error");
          }
          setIsScanningKTP(false);
      };
      reader.readAsDataURL(file);
  };

  // Helper: Pad numbers (RT/RW)
  const padNumber = (val: string) => {
    if (!val) return "";
    const num = val.replace(/\D/g, '');
    return num.length === 1 ? `0${num}` : num.slice(-3);
  };

  // Parsing & Formatting Alamat
  const parseAddress = (addrString?: string): DetailedAddress => {
    if (!addrString || addrString === 'N/A') return { ...initialAddressState };
    
    const result: DetailedAddress = { ...initialAddressState };
    
    // Extract known patterns
    const rtMatch = addrString.match(/RT\s+(\d+)/i);
    if (rtMatch) result.rt = rtMatch[1];
    
    const rwMatch = addrString.match(/RW\s+(\d+)/i);
    if (rwMatch) result.rw = rwMatch[1];
    
    const kelMatch = addrString.match(/Kel\.\s+([^,]+)/i);
    if (kelMatch) result.kelurahan = kelMatch[1].trim();
    
    const kecMatch = addrString.match(/Kec\.\s+([^,]+)/i);
    if (kecMatch) result.kecamatan = kecMatch[1].trim();
    
    const zipMatch = addrString.match(/\b\d{5}\b/);
    if (zipMatch) result.kodepos = zipMatch[0];
    
    const blokMatch = addrString.match(/Blok\s+([^,]+)/i);
    if (blokMatch) result.blok = blokMatch[1].trim();
    
    const noMatch = addrString.match(/No\.\s+([^,]+)/i);
    if (noMatch) result.nomor = noMatch[1].trim();
    
    // Jalan is usually the first part
    const parts = addrString.split(',');
    if (parts.length > 0) {
        result.jalan = parts[0].trim();
    }

    // Try to find Kota (usually before zip or last text part)
    // This is a heuristic
    const kotaMatch = addrString.match(/Kec\.[^,]+,\s*([^,]+)(?:,|$)/i);
    if (kotaMatch) {
         // If we found Kec, Kota is likely next
         const potentialKota = kotaMatch[1].trim();
         if (!potentialKota.match(/\d{5}/)) { // Ensure it's not the zip
             result.kota = potentialKota;
         }
    } else {
        // Fallback: check parts
        // If last part is zip, second to last might be Kota
        if (parts.length >= 2 && parts[parts.length-1].match(/\d{5}/)) {
             const potentialKota = parts[parts.length-2].trim();
             if (!potentialKota.startsWith('Kec.') && !potentialKota.startsWith('Kel.')) {
                 result.kota = potentialKota;
             }
        }
    }
    
    return result;
  };

  const formatAddress = (addr: DetailedAddress): string => {
    const parts: string[] = [];
    
    if (addr.jalan) parts.push(toProperCase(addr.jalan));
    if (addr.blok) parts.push(`Blok ${addr.blok.toUpperCase()}`);
    if (addr.nomor) parts.push(`No. ${addr.nomor}`);
    
    if (addr.rt && addr.rw) {
        parts.push(`RT ${addr.rt} RW ${addr.rw}`);
    } else if (addr.rt) {
        parts.push(`RT ${addr.rt}`);
    } else if (addr.rw) {
        parts.push(`RW ${addr.rw}`);
    }
    
    if (addr.kelurahan) parts.push(`Kel. ${toProperCase(addr.kelurahan)}`);
    if (addr.kecamatan) parts.push(`Kec. ${toProperCase(addr.kecamatan)}`);
    if (addr.kota) parts.push(toProperCase(addr.kota));
    if (addr.kodepos) parts.push(addr.kodepos);
    
    return parts.join(', ');
  };

  const handleAutoZip = async (type: 'KTP' | 'DOMISILI') => {
    const targetAddr = type === 'KTP' ? ktpAddress : domisiliAddress;
    const setTargetAddr = type === 'KTP' ? setKtpAddress : setDomisiliAddress;
    const setLoading = type === 'KTP' ? setLoadingZipKTP : setLoadingZipDom;
    
    if (!targetAddr.kelurahan || !targetAddr.kecamatan || !targetAddr.kota) {
        onShowToast("Mohon lengkapi Kelurahan, Kecamatan, dan Kota dahulu.", 'error');
        return;
    }
    
    setLoading(true);
    const zip = await getRegionZipCode(targetAddr.kelurahan, targetAddr.kecamatan, targetAddr.kota);
    setLoading(false);
    
    if (zip) {
        setTargetAddr(prev => ({ ...prev, kodepos: zip }));
        onShowToast(`AI menemukan Kode Pos: ${zip}`, 'success');
    } else {
        onShowToast("Gagal mencari kode pos secara otomatis.", 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProfile({ ...currentUser, fotoProfil: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
      setCompletionForm({ ...currentUser });
      setKtpAddress(parseAddress(currentUser.alamatKTP));
      setDomisiliAddress(parseAddress(currentUser.alamatRumah));
      setDomisiliSamaKTP(!currentUser.alamatKTP || currentUser.alamatKTP === currentUser.alamatRumah);
      setWizardStep(1);
      setShowEditModal(true);
  };

  const handleCompletionSubmit = () => {
      setIsSubmitting(true);
      const fullKtpAddress = formatAddress(ktpAddress);
      const fullDomisiliAddress = domisiliSamaKTP ? fullKtpAddress : formatAddress(domisiliAddress);

      setTimeout(() => {
          onUpdateProfile({
              ...currentUser,
              ...completionForm,
              alamatKTP: fullKtpAddress,
              alamatRumah: fullDomisiliAddress,
              isDataComplete: true,
              isVerified: false
          } as Warga);
          
          const admins = wargaList.filter(w => [UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(w.role));
          admins.forEach(admin => {
              onSendNotification({
                  id: `NOTIF-ADMIN-VERIF-${Date.now()}-${admin.id}`,
                  userId: admin.id,
                  pesan: `🔍 Verifikasi Data: ${currentUser.namaLengkap} telah melengkapi profil. Silakan tinjau berkasnya.`,
                  tipe: 'SYSTEM',
                  isRead: false,
                  tanggal: new Date().toISOString().split('T')[0]
              });
          });
          
          setIsSubmitting(false);
          setShowEditModal(false);
          setShowSubmissionSuccess(true);
      }, 1500);
  };

  const isNextDisabled = () => {
    if (wizardStep === 1) {
        return !completionForm.nik || completionForm.nik.length !== 16 || 
               !completionForm.noKK || completionForm.noKK.length !== 16 || 
               !completionForm.namaLengkap || 
               !completionForm.tempatLahir || 
               !completionForm.tanggalLahir ||
               !completionForm.jenisKelamin ||
               !completionForm.agama ||
               !completionForm.statusPerkawinan ||
               !completionForm.pekerjaan;
    }
    if (wizardStep === 2) return !ktpAddress.jalan || !ktpAddress.kelurahan || !ktpAddress.kodepos;
    if (wizardStep === 3 && !domisiliSamaKTP) return !domisiliAddress.jalan || !domisiliAddress.kodepos;
    if (wizardStep === 4) return !completionForm.fotoKTP || !completionForm.fotoKK;
    return false;
  };

  // --- WIZARD COMPONENTS ---
  const StepIndicator = () => (
    <div className="mb-10">
        <div className="flex items-center justify-between relative px-2 max-w-md mx-auto">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                        wizardStep === s 
                        ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-lg shadow-emerald-100' 
                        : wizardStep > s 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800' 
                        : 'bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-700'
                    }`}>
                        {wizardStep > s ? <Check size={20} strokeWidth={3} /> : s}
                    </div>
                    <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${wizardStep === s ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>
                        {s === 1 ? 'Data Diri' : s === 2 ? 'Alamat KTP' : s === 3 ? 'Domisili' : 'Berkas'}
                    </span>
                </div>
            ))}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-100 dark:bg-gray-800 -z-0"></div>
            <div 
                className="absolute top-5 left-10 h-0.5 bg-emerald-500 transition-all duration-500 -z-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                style={{ width: `${(wizardStep - 1) * 29}%` }}
            ></div>
        </div>
    </div>
  );

  const AddressForm = ({ data, setData, onAutoZip, loadingZip, isKtp }: { data: DetailedAddress, setData: any, onAutoZip: any, loadingZip: boolean, isKtp: boolean }) => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                <Info size={18} />
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                {isKtp 
                    ? "Masukkan alamat sesuai KTP. Gunakan fitur AI untuk melengkapi kode pos otomatis." 
                    : "Lengkapi alamat tempat Anda tinggal saat ini di wilayah RT 06 RW 19."}
            </p>
        </div>

        <div className="space-y-5">
            <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Nama Jalan / Komplek <span className="text-red-500">*</span></label>
                <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Contoh: Jl. Rancamanyar Indah Utama" 
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
                        value={data.jalan}
                        onChange={e => setData({...data, jalan: e.target.value})}
                        onBlur={e => setData({...data, jalan: toProperCase(e.target.value)})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Blok</label>
                        <input type="text" placeholder="A1" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase text-center font-bold" value={data.blok} onChange={e => setData({...data, blok: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">No</label>
                        <input type="text" placeholder="12" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center font-bold" value={data.nomor} onChange={e => setData({...data, nomor: e.target.value})} />
                    </div>
                </div>

                <div className="flex items-end gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">RT</label>
                        <input 
                            type="text" 
                            maxLength={3}
                            placeholder="000" 
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono font-bold" 
                            value={data.rt} 
                            onChange={e => setData({...data, rt: e.target.value.replace(/\D/g, '')})}
                            onBlur={e => setData({...data, rt: padNumber(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">RW</label>
                        <input 
                            type="text" 
                            maxLength={3}
                            placeholder="000" 
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center font-mono font-bold" 
                            value={data.rw} 
                            onChange={e => setData({...data, rw: e.target.value.replace(/\D/g, '')})}
                            onBlur={e => setData({...data, rw: padNumber(e.target.value)})}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Kelurahan / Desa <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Rancamanyar" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium" 
                        value={data.kelurahan} 
                        onChange={e => setData({...data, kelurahan: e.target.value})}
                        onBlur={e => setData({...data, kelurahan: toProperCase(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Kecamatan <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Baleendah" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium" 
                        value={data.kecamatan} 
                        onChange={e => setData({...data, kecamatan: e.target.value})}
                        onBlur={e => setData({...data, kecamatan: toProperCase(e.target.value)})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Kota / Kabupaten <span className="text-red-500">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Bandung" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium" 
                        value={data.kota} 
                        onChange={e => setData({...data, kota: e.target.value})}
                        onBlur={e => setData({...data, kota: toProperCase(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">Kode Pos <span className="text-red-500">*</span></label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            maxLength={5} 
                            placeholder="40375"
                            className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold" 
                            value={data.kodepos} 
                            onChange={e => setData({...data, kodepos: e.target.value.replace(/\D/g, '')})} 
                        />
                        <button 
                            type="button" 
                            onClick={onAutoZip}
                            disabled={loadingZip}
                            className="absolute right-2 top-2 p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition disabled:opacity-50"
                            title="Cari Kode Pos AI"
                        >
                            {loadingZip ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isDataIncomplete && (
        <div className="p-5 rounded-2xl border flex items-start gap-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 transition-colors">
            <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <AlertTriangle size={28} />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">Profil Anda Belum Lengkap</h3>
                <p className="text-sm mt-1 text-amber-700/80 dark:text-amber-300/80 leading-relaxed font-medium">Lengkapi NIK, KK, Alamat Domisili, dan Unggah Dokumen untuk mendapatkan akses penuh ke layanan administrasi RT 06.</p>
                <button onClick={handleEditClick} className="mt-4 px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-amber-700 transition shadow-lg shadow-amber-200 dark:shadow-none">
                    Lengkapi Sekarang
                </button>
            </div>
        </div>
      )}

      {/* Header Profile */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8 transition-colors">
        <div className="relative group">
            <div className="w-32 h-32 bg-gradient-to-tr from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border-4 border-white dark:border-gray-700 shadow-md overflow-hidden transition-transform group-hover:scale-105">
                {currentUser.fotoProfil ? <img src={currentUser.fotoProfil} alt="Profile" className="w-full h-full object-cover" /> : <User size={56} />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-600 text-white rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg hover:bg-emerald-700 transition transform hover:scale-110">
                <Camera size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        </div>
        <div className="text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white leading-tight">{currentUser.namaLengkap}</h2>
            {currentUser.isVerified && (
                <div className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded-full text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    <CheckCircle size={18} fill="currentColor" className="text-white dark:text-gray-900" />
                </div>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1 tracking-tight">{currentUser.nik || 'NIK Belum Diatur'}</p>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
             <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">
               WARGA RT 06
             </span>
             <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800">
               KK: {currentUser.noKK || 'N/A'}
             </span>
          </div>
        </div>
        <div className="md:border-l border-gray-100 dark:border-gray-700 pl-8 hidden md:block">
            <button onClick={handleEditClick} className="p-4 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-800">
                <Edit3 size={28} />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 hide-scrollbar">
        {[
            { id: 'IKHTISAR', label: 'Informasi Diri', icon: <User size={18} /> },
            { id: 'KEUANGAN', label: 'Riwayat Iuran', icon: <CreditCard size={18} />, count: financialHistory.filter(f => f.wargaId === currentUser.id && f.status === 'TAGIHAN').length },
            { id: 'PENGAJUAN', label: 'Layanan Data', icon: <FileInput size={18} /> },
            { id: 'EDIT_AKUN', label: 'Pengaturan Akun', icon: <Lock size={18} /> },
            { id: 'LOG', label: 'Log Aktivitas', icon: <History size={18} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 relative ${
              activeTab === tab.id 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100 dark:shadow-none' 
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-white dark:border-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.count && tab.count > 0 ? (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] flex items-center justify-center">
                    {tab.count}
                </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'IKHTISAR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-xl">
                            <User size={24} className="text-emerald-600" /> Data Kependudukan
                        </h3>
                        <button onClick={handleEditClick} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">Ubah Data</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { l: 'Nama Lengkap', v: currentUser.namaLengkap },
                            { l: 'Tempat, Tgl Lahir', v: `${currentUser.tempatLahir || '-'}, ${currentUser.tanggalLahir || '-'}` },
                            { l: 'Pekerjaan', v: currentUser.pekerjaan || '-' },
                            { l: 'Status Perkawinan', v: currentUser.statusPerkawinan || '-' },
                            { l: 'Agama', v: currentUser.agama || '-' },
                            { l: 'Status Tinggal', v: currentUser.statusTinggal || 'TETAP' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col border-b border-gray-50 dark:border-gray-700 pb-3 last:border-0">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">{item.l}</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.v}</span>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors flex flex-col">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-8 text-xl">
                        <Home size={24} className="text-blue-600" /> Domisili & Keluarga
                    </h3>
                    <div className="space-y-8 flex-1">
                        <div>
                            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-3">Alamat Domisili Saat Ini</span>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-600 leading-relaxed font-medium italic">
                                {currentUser.alamatRumah || 'Alamat domisili belum dilengkapi.'}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Anggota Keluarga (KK)</span>
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase">{familyMembers.length} Orang</span>
                            </div>
                            <div className="space-y-3">
                                {familyMembers.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm">
                                                {m.namaLengkap.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold dark:text-white leading-none mb-1">{m.namaLengkap}</p>
                                                <p className="text-[11px] text-gray-400 font-mono tracking-tighter">{m.nik}</p>
                                            </div>
                                        </div>
                                        {m.isKepalaKeluarga && (
                                            <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg uppercase border border-blue-200 dark:border-blue-800">KK</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
              </div>
          )}

          {activeTab === 'KEUANGAN' && (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-xl">
                          <Wallet size={24} className="text-emerald-600" /> Riwayat Iuran & Pembayaran
                      </h3>
                      <button onClick={() => onNavigate('KEUANGAN')} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline">Bayar Iuran</button>
                  </div>

                  <div className="space-y-8">
                      {/* Tagihan Belum Lunas */}
                      <div>
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Tagihan Belum Lunas</h4>
                          {financialHistory.filter(f => f.wargaId === currentUser.id && f.status === 'TAGIHAN').length > 0 ? (
                              <div className="space-y-3">
                                  {financialHistory.filter(f => f.wargaId === currentUser.id && f.status === 'TAGIHAN').map(item => (
                                      <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl">
                                          <div className="flex items-center gap-4">
                                              <div className="p-3 bg-white dark:bg-red-900/30 rounded-xl text-red-500 dark:text-red-400 shadow-sm">
                                                  <AlertCircle size={20} />
                                              </div>
                                              <div>
                                                  <p className="font-bold text-gray-800 dark:text-white">{item.keterangan}</p>
                                                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">Jatuh Tempo: {item.tanggal}</p>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-black text-red-600 dark:text-red-400">Rp {item.jumlah.toLocaleString('id-ID')}</p>
                                              <button onClick={() => onNavigate('KEUANGAN')} className="text-[10px] font-bold bg-red-600 text-white px-3 py-1 rounded-lg mt-1 hover:bg-red-700 transition">Bayar</button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-700">
                                  <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tidak ada tagihan tertunggak. Terima kasih!</p>
                              </div>
                          )}
                      </div>

                      {/* Riwayat Pembayaran */}
                      <div>
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Riwayat Transaksi Terakhir</h4>
                          {financialHistory.filter(f => f.wargaId === currentUser.id && f.status !== 'TAGIHAN').length > 0 ? (
                              <div className="space-y-3">
                                  {financialHistory
                                      .filter(f => f.wargaId === currentUser.id && f.status !== 'TAGIHAN')
                                      .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                                      .map(item => (
                                      <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                          <div className="flex items-center gap-4">
                                              <div className={`p-3 rounded-xl shadow-sm ${
                                                  item.status === 'LUNAS' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                  item.status === 'MENUNGGU_VERIFIKASI' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                              }`}>
                                                  {item.status === 'LUNAS' ? <CheckCircle size={20} /> : item.status === 'MENUNGGU_VERIFIKASI' ? <Clock size={20} /> : <XCircle size={20} />}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-gray-800 dark:text-white">{item.keterangan}</p>
                                                  <div className="flex items-center gap-2 mt-1">
                                                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.tanggal}</span>
                                                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300 font-bold uppercase">{item.metodePembayaran}</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="text-right">
                                              <p className={`font-black ${
                                                  item.status === 'LUNAS' ? 'text-emerald-600 dark:text-emerald-400' : 
                                                  item.status === 'MENUNGGU_VERIFIKASI' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                                              }`}>
                                                  Rp {item.jumlah.toLocaleString('id-ID')}
                                              </p>
                                              <p className={`text-[10px] font-bold uppercase mt-1 ${
                                                  item.status === 'LUNAS' ? 'text-emerald-600' : 
                                                  item.status === 'MENUNGGU_VERIFIKASI' ? 'text-amber-600' : 'text-red-600'
                                              }`}>
                                                  {item.status === 'MENUNGGU_VERIFIKASI' ? 'Menunggu Konfirmasi' : item.status}
                                              </p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
                                  Belum ada riwayat pembayaran.
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

      {activeTab === 'PENGAJUAN' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-xl">
                      <FileInput size={24} className="text-blue-600" /> Riwayat Pengajuan Data
                  </h3>
                  <button onClick={() => onNavigate('SURAT')} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline">Buat Surat Baru</button>
              </div>

              {requests.filter(r => r.wargaId === currentUser.id).length > 0 ? (
                  <div className="space-y-4">
                      {requests.filter(r => r.wargaId === currentUser.id).map(req => (
                          <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                              <div>
                                  <p className="font-bold text-gray-800 dark:text-white text-sm">Perubahan {req.field}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dari: <span className="line-through opacity-50">{req.oldValue}</span> → <span className="font-bold text-emerald-600 dark:text-emerald-400">{req.newValue}</span></p>
                                  <p className="text-[10px] text-gray-400 mt-2">{req.tanggal}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                  req.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  req.status === 'DITOLAK' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                  {req.status}
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-3xl">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                          <FileInput size={32} />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Belum ada riwayat pengajuan perubahan data.</p>
                  </div>
              )}
          </div>
      )}

      {activeTab === 'EDIT_AKUN' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-xl mb-8">
                  <Lock size={24} className="text-emerald-600" /> Pengaturan Akun
              </h3>

              <div className="space-y-8 max-w-2xl">
                  {/* Contact Info */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <Smartphone size={18} className="text-blue-500" /> Kontak & Notifikasi
                      </h4>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Nomor WhatsApp</label>
                              <div className="flex gap-3">
                                  <input 
                                      type="text" 
                                      className="flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                      defaultValue={currentUser.noHP}
                                      placeholder="0812..."
                                  />
                                  <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none">
                                      Simpan
                                  </button>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-2">Nomor ini digunakan untuk login dan menerima notifikasi penting dari RT.</p>
                          </div>
                      </div>
                  </div>

                  {/* Security */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                          <Shield size={18} className="text-emerald-500" /> Keamanan Login
                      </h4>
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600">
                              <div>
                                  <p className="font-bold text-sm text-gray-700 dark:text-gray-200">Metode Login</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Menggunakan NIK/No HP & Password</p>
                              </div>
                              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full">Aktif</span>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-600">
                              <div>
                                  <p className="font-bold text-sm text-gray-700 dark:text-gray-200">Kata Sandi</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Terakhir diubah: -</p>
                              </div>
                              <button 
                                onClick={() => {
                                    // Generate OTP
                                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                                    
                                    // Simulate Sending OTP
                                    alert(`[SIMULASI WA]\n\nKode OTP Ubah Password: ${code}\n\nDikirim ke: ${currentUser.noHP}`);
                                    
                                    const inputOtp = prompt("Masukkan Kode OTP yang dikirim ke WhatsApp Anda:");
                                    
                                    if (inputOtp === code) {
                                        const newPass = prompt("Masukkan password baru (min 6 karakter):");
                                        if(newPass && newPass.length >= 6) {
                                            onUpdateProfile({ ...currentUser, password: newPass });
                                            onShowToast("Password berhasil diubah.", "success");
                                        } else if (newPass) {
                                            onShowToast("Password minimal 6 karakter.", "error");
                                        }
                                    } else if (inputOtp) {
                                        onShowToast("Kode OTP salah.", "error");
                                    }
                                }}
                                className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
                              >
                                Ubah
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30">
                      <h4 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                          <AlertTriangle size={18} /> Zona Bahaya
                      </h4>
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="font-bold text-sm text-gray-800 dark:text-white">Keluar dari Aplikasi</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Akhiri sesi login Anda di perangkat ini.</p>
                          </div>
                          <button onClick={onLogout} className="px-4 py-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition text-xs uppercase tracking-widest">
                              Logout
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'LOG' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-3 text-xl mb-8">
                  <History size={24} className="text-gray-600 dark:text-gray-400" /> Log Aktivitas
              </h3>
              <div className="space-y-6 relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 pl-8">
                  {logs.length > 0 ? logs.map((log, i) => (
                      <div key={i} className="relative">
                          <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900"></div>
                          <p className="text-xs text-gray-400 font-mono mb-1">{log.timestamp}</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-white">{log.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                      </div>
                  )) : (
                      <p className="text-sm text-gray-400 italic">Belum ada aktivitas tercatat.</p>
                  )}
              </div>
          </div>
      )}
      </div>

      {/* --- WIZARD COMPLETION MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-0 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col border border-gray-100 dark:border-gray-800 my-4 max-h-[95vh]">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Kelengkapan Data Warga</h3>
                        <p className="text-xs text-gray-500 font-bold mt-1 tracking-wide uppercase">Tahap {wizardStep} dari 4</p>
                    </div>
                    <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition"><X size={28}/></button>
                </div>

                <div className="px-8 pt-8">
                    <StepIndicator />
                </div>
                
                <div className="p-8 pt-2 overflow-y-auto flex-1 hide-scrollbar">
                    {wizardStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex gap-4">
                                <UserCircle className="text-emerald-600 shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Informasi Kependudukan Utama</h4>
                                    <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 leading-relaxed font-medium mt-1">Pastikan data sesuai dengan Kartu Keluarga terbaru.</p>
                                </div>
                            </div>
                            
                            <div className="my-4">
                                <button 
                                    onClick={() => scanInputRef.current?.click()}
                                    disabled={isScanningKTP}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    {isScanningKTP ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                                    <span className="relative z-10">{isScanningKTP ? "Sedang Memindai..." : "Scan KTP (Isi Otomatis dengan AI)"}</span>
                                </button>
                                <input ref={scanInputRef} type="file" accept="image/*" hidden onChange={handleScanKTP} />
                                <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                                    <Sparkles size={12} className="text-emerald-500" />
                                    Didukung oleh AI untuk mengekstrak data dari foto KTP secara instan
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Nama Lengkap Sesuai Identitas <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg transition-all shadow-sm focus:shadow-md" 
                                            placeholder="Nama Lengkap"
                                            value={completionForm.namaLengkap || ''} 
                                            onChange={e => setCompletionForm({...completionForm, namaLengkap: e.target.value})} 
                                            onBlur={e => setCompletionForm({...completionForm, namaLengkap: toProperCase(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">NIK (16 Digit) <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            maxLength={16} 
                                            placeholder="3204..." 
                                            className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 outline-none font-mono font-bold transition-all ${
                                                (completionForm.nik?.length === 16) 
                                                ? 'border-emerald-200 focus:ring-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30' 
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                                            }`} 
                                            value={completionForm.nik || ''} 
                                            onChange={e => setCompletionForm({...completionForm, nik: e.target.value.replace(/\D/g, '')})} 
                                        />
                                        {completionForm.nik && completionForm.nik.length === 16 && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                        )}
                                    </div>
                                    {completionForm.nik && completionForm.nik.length > 0 && completionForm.nik.length < 16 && (
                                        <p className="text-[10px] text-red-500 font-bold px-1">NIK harus 16 digit (kurang {16 - completionForm.nik.length} digit)</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">No. KK (16 Digit) <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            maxLength={16} 
                                            placeholder="3204..." 
                                            className={`w-full pl-12 pr-4 py-3 border rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 outline-none font-mono font-bold transition-all ${
                                                (completionForm.noKK?.length === 16) 
                                                ? 'border-emerald-200 focus:ring-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30' 
                                                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                                            }`} 
                                            value={completionForm.noKK || ''} 
                                            onChange={e => setCompletionForm({...completionForm, noKK: e.target.value.replace(/\D/g, '')})} 
                                        />
                                        {completionForm.noKK && completionForm.noKK.length === 16 && (
                                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Tempat Lahir <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all" 
                                            placeholder="Kota Kelahiran"
                                            value={completionForm.tempatLahir || ''} 
                                            onChange={e => setCompletionForm({...completionForm, tempatLahir: e.target.value})} 
                                            onBlur={e => setCompletionForm({...completionForm, tempatLahir: toProperCase(e.target.value)})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input 
                                            type="date" 
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all" 
                                            value={completionForm.tanggalLahir || ''} 
                                            onChange={e => setCompletionForm({...completionForm, tanggalLahir: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Jenis Kelamin <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                                            value={completionForm.jenisKelamin || ''}
                                            onChange={e => setCompletionForm({...completionForm, jenisKelamin: e.target.value as Gender})}
                                        >
                                            <option value="" disabled>Pilih Jenis Kelamin</option>
                                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Agama <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                                            value={completionForm.agama || ''}
                                            onChange={e => setCompletionForm({...completionForm, agama: e.target.value as Agama})}
                                        >
                                            <option value="" disabled>Pilih Agama</option>
                                            {Object.values(Agama).map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Status Perkawinan <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                                            value={completionForm.statusPerkawinan || ''}
                                            onChange={e => setCompletionForm({...completionForm, statusPerkawinan: e.target.value as StatusPerkawinan})}
                                        >
                                            <option value="" disabled>Pilih Status</option>
                                            {Object.values(StatusPerkawinan).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Pekerjaan <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all" 
                                        placeholder="Contoh: Karyawan Swasta"
                                        value={completionForm.pekerjaan || ''} 
                                        onChange={e => setCompletionForm({...completionForm, pekerjaan: e.target.value})} 
                                        onBlur={e => setCompletionForm({...completionForm, pekerjaan: toProperCase(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {wizardStep === 2 && (
                        <AddressForm data={ktpAddress} setData={setKtpAddress} onAutoZip={() => handleAutoZip('KTP')} loadingZip={loadingZipKTP} isKtp={true} />
                    )}

                    {wizardStep === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                             <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 px-1">Verifikasi Domisili Saat Ini</label>
                                <button 
                                    type="button" 
                                    onClick={() => setDomisiliSamaKTP(!domisiliSamaKTP)}
                                    className={`w-full p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                                        domisiliSamaKTP 
                                        ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20' 
                                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-5 text-left">
                                        <div className={`p-4 rounded-2xl ${domisiliSamaKTP ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                            <CheckCircle size={28} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-base ${domisiliSamaKTP ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-500'}`}>Alamat Domisili SAMA dengan KTP</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1 tracking-tight">Saya menetap tinggal di alamat yang tertera di KTP</p>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${domisiliSamaKTP ? 'border-emerald-500 bg-emerald-500 text-white scale-110' : 'border-gray-200 dark:border-gray-700'}`}>
                                        {domisiliSamaKTP && <Check size={18} strokeWidth={4} />}
                                    </div>
                                </button>
                             </div>

                             {!domisiliSamaKTP && (
                                <div className="pt-2 animate-in slide-in-from-top-4 duration-300 space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 px-1 border-l-4 border-blue-500 pl-3">Alamat Domisili Baru di Wilayah RT 06</label>
                                        <AddressForm data={domisiliAddress} setData={setDomisiliAddress} onAutoZip={() => handleAutoZip('DOMISILI')} loadingZip={loadingZipDom} isKtp={false} />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">Status Tempat Tinggal</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => setStatusTinggal(StatusTinggal.TETAP)}
                                                className={`p-4 rounded-xl border-2 text-sm font-bold transition ${statusTinggal === StatusTinggal.TETAP ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                            >
                                                Milik Sendiri / Tetap
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setStatusTinggal(StatusTinggal.KONTRAK)}
                                                className={`p-4 rounded-xl border-2 text-sm font-bold transition ${statusTinggal === StatusTinggal.KONTRAK ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                            >
                                                Kontrak / Kost (Musiman)
                                            </button>
                                        </div>
                                    </div>

                                    {statusTinggal === StatusTinggal.KONTRAK && (
                                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 animate-in slide-in-from-top-2">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm mb-4 flex items-center gap-2">
                                                <Home size={16} /> Informasi Pemilik Rumah / Kost
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Nama Pemilik</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={infoPemilikRumah.nama}
                                                        onChange={e => setInfoPemilikRumah({...infoPemilikRumah, nama: e.target.value})}
                                                        placeholder="Bpk/Ibu Pemilik"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">No. HP Pemilik</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                        value={infoPemilikRumah.noHP}
                                                        onChange={e => setInfoPemilikRumah({...infoPemilikRumah, noHP: e.target.value})}
                                                        placeholder="08..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    )}

                    {wizardStep === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Foto KTP Asli</label>
                                    <label className="block group cursor-pointer">
                                        <div className={`aspect-[3/2] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative shadow-inner ${completionForm.fotoKTP ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                            {completionForm.fotoKTP ? (
                                                <>
                                                    <img src={completionForm.fotoKTP} alt="KTP" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                        <Upload className="text-white" size={32} />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform">
                                                        <Camera size={32} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ambil Foto / Upload</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" hidden onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if(f) {
                                                    const r = new FileReader();
                                                    r.onloadend = () => setCompletionForm({...completionForm, fotoKTP: r.result as string});
                                                    r.readAsDataURL(f);
                                                }
                                            }} />
                                        </div>
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Foto Kartu Keluarga</label>
                                    <label className="block group cursor-pointer">
                                        <div className={`aspect-[3/2] rounded-3xl border-4 border-dashed flex flex-col items-center justify-center p-4 transition-all overflow-hidden relative shadow-inner ${completionForm.fotoKK ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                            {completionForm.fotoKK ? (
                                                <>
                                                    <img src={completionForm.fotoKK} alt="KK" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                        <Upload className="text-white" size={32} />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform">
                                                        <FileText size={32} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ambil Foto / Upload</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" hidden onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if(f) {
                                                    const r = new FileReader();
                                                    r.onloadend = () => setCompletionForm({...completionForm, fotoKK: r.result as string});
                                                    r.readAsDataURL(f);
                                                }
                                            }} />
                                        </div>
                                    </label>
                                </div>
                             </div>
                             <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] flex items-start gap-5">
                                <div className="p-3 bg-white dark:bg-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-tighter">Privasi & Keamanan Data</p>
                                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/70 mt-1 leading-relaxed font-medium">Dokumen Anda hanya digunakan untuk verifikasi kependudukan oleh Pengurus RT dan tersimpan terenkripsi.</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-50 dark:border-gray-800 flex justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {wizardStep > 1 ? (
                        <button 
                            onClick={() => setWizardStep(prev => prev - 1)}
                            className="px-8 py-4 text-gray-500 dark:text-gray-400 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 rounded-2xl transition flex items-center gap-2 active:scale-95"
                        >
                            <ChevronLeft size={20} /> Kembali
                        </button>
                    ) : (
                        <div />
                    )}

                    {wizardStep < 4 ? (
                        <button 
                            onClick={() => setWizardStep(prev => prev + 1)}
                            disabled={isNextDisabled()}
                            className={`px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl transition-all active:scale-95 ${
                                isNextDisabled() 
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-100 dark:border-gray-700' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none'
                            }`}
                        >
                            Selanjutnya <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleCompletionSubmit}
                            disabled={isSubmitting || isNextDisabled()}
                            className="px-10 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none flex items-center gap-2 transition-all active:scale-95 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400"
                        >
                            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Update Data
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Submission Success Modal */}
      {showSubmissionSuccess && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-12 max-w-sm w-full text-center scale-100 animate-in zoom-in-95 duration-300 border border-emerald-100 dark:border-emerald-900/50">
                <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-50 dark:shadow-none">
                    <CheckCircle size={64} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-3 uppercase tracking-tighter leading-tight">Data Terkirim!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-sm font-medium leading-relaxed">
                    Terima kasih! Profil Anda telah masuk antrean verifikasi. Pengurus RT akan meninjau kelengkapan dokumen Anda segera.
                </p>
                <button 
                    onClick={() => setShowSubmissionSuccess(false)}
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition shadow-2xl shadow-emerald-200 dark:shadow-none active:scale-95 tracking-widest uppercase text-xs"
                >
                    Selesai
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
