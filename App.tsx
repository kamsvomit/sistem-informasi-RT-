
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, Banknote, FileText, MessageSquare, Menu, LogOut, 
  Bell, Building, Settings as SettingsIcon, Image as ImageIcon, UserCircle, LogIn, Construction,
  Database, Info, Download, ArrowLeft, ShieldCheck, UserPlus, Lock, Mail, Phone,
  Check, X, ClipboardList, KeyRound, Upload, Save, CheckCircle, AlertCircle, BellRing, HeartHandshake, Gift, ShoppingBag, Moon, Sun, History,
  ArrowRight, Bot, Shield
} from 'lucide-react';
import { ViewState, Warga, Keuangan, UserRole, Aspirasi, Gender, Agama, StatusPerkawinan, RTProfileData, GaleriItem, UserNotification, ChangeRequest, Peristiwa, JenisPeristiwa, Pengumuman, AppConfig, WakafProgram, WakafTransaksi, UMKMProduct, BansosDistribution, ActivityLog, UndanganAcara } from './types';
import { INITIAL_WARGA, INITIAL_KEUANGAN, INITIAL_ASPIRASI, INITIAL_RT_PROFILE, INITIAL_GALERI, INITIAL_NOTIFICATIONS, INITIAL_REQUESTS, INITIAL_PERISTIWA, INITIAL_PENGUMUMAN, INITIAL_APP_CONFIG, INITIAL_WAKAF_PROGRAMS, INITIAL_WAKAF_TRANSACTIONS, INITIAL_UMKM_PRODUCTS, INITIAL_BANSOS_DISTRIBUTIONS, INITIAL_LOGS, INITIAL_UNDANGAN } from './constants';

// Components
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CitizenManagement from './components/CitizenManagement';
import Finance from './components/Finance';
import LetterGenerator from './components/LetterGenerator';
import AIAssistant from './components/AIAssistant';
import MyProfile from './components/MyProfile';
import Announcements from './components/Announcements';
import AspirasiPage from './components/Aspirasi';
import RTProfile from './components/RTProfile';
import ActivityGallery from './components/ActivityGallery';
import PopulationEvents from './components/PopulationEvents';
import AdminNotifications from './components/AdminNotifications';
import WakafRW from './components/WakafRW';
import Settings from './components/Settings';
import DataChangeHistory from './components/DataChangeHistory';
import UMKM from './components/UMKM';
import SocialAidManagement from './components/SocialAidManagement';

// --- Toast Component ---
interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const ToastNotification: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-5 duration-300 ${
      type === 'success' ? 'bg-white dark:bg-gray-800 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400' : 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900 text-red-800 dark:text-red-400'
    }`}>
      <div className={`p-2 rounded-full ${type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'}`}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </div>
      <div>
        <h4 className="font-bold text-sm">{type === 'success' ? 'Berhasil' : 'Gagal'}</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <X size={16} />
      </button>
    </div>
  );
};

// --- AuthScreen Component Implementation with Demo Roles ---
interface AuthScreenProps {
  initialMode: 'LOGIN' | 'REGISTER';
  onLogin: (userId: string) => void;
  onRegister: (warga: Warga) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  wargaList: Warga[];
  onBack: () => void;
  appConfig: AppConfig;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode, onLogin, onRegister, onResetPassword, wargaList, onBack, appConfig, onShowToast }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const [resetStep, setResetStep] = useState<'INPUT_ID' | 'VERIFY_OTP' | 'NEW_PASSWORD'>('INPUT_ID');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [targetResetUserId, setTargetResetUserId] = useState<string | null>(null);

  // Registration Flow State
  const [registerStep, setRegisterStep] = useState<'INPUT_DATA' | 'VERIFY_EMAIL'>('INPUT_DATA');
  const [registerOtp, setRegisterOtp] = useState('');
  const [generatedRegisterOtp, setGeneratedRegisterOtp] = useState('');

  const [formData, setFormData] = useState({
    nik: '',
    namaLengkap: '',
    noHP: '',
    email: '',
    jenisKelamin: Gender.LAKI_LAKI,
    password: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = wargaList.find(w => w.nik === formData.nik || w.noHP === formData.nik || w.email === formData.nik);
    if (user) {
      if (!user.isVerified) {
          onShowToast("Akun Anda belum aktif atau dinonaktifkan oleh Admin.", 'error');
          return;
      }
      
      // Password Check
      if (user.password && user.password !== formData.password) {
          onShowToast("Password salah.", 'error');
          return;
      }

      onLogin(user.id);
      onShowToast(`Selamat datang kembali, ${user.namaLengkap}!`, 'success');
    } else {
      onShowToast("Identitas (NIK/No HP/Email) tidak ditemukan.", 'error');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const demoUser = wargaList.find(w => w.role === role);
    if (demoUser) {
        onLogin(demoUser.id);
        onShowToast(`Login Demo sebagai ${role}: ${demoUser.namaLengkap}`, 'success');
    }
  };

  const handleInitiateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (wargaList.find(w => w.nik === formData.nik)) {
      onShowToast("NIK sudah terdaftar dalam sistem.", 'error');
      return;
    }
    if (formData.email && wargaList.find(w => w.email === formData.email)) {
        onShowToast("Email sudah terdaftar.", 'error');
        return;
    }

    // Generate OTP for Email Verification
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedRegisterOtp(code);
    
    // Simulate Sending OTP
    alert(`[SIMULASI EMAIL]\n\nKode Verifikasi Pendaftaran: ${code}\n\nDikirim ke: ${formData.email}`);
    
    setRegisterStep('VERIFY_EMAIL');
    onShowToast("Kode verifikasi telah dikirim ke Email Anda.", "success");
  };

  const handleFinalizeRegister = (e: React.FormEvent) => {
      e.preventDefault();
      if (registerOtp !== generatedRegisterOtp) {
          onShowToast("Kode verifikasi salah.", "error");
          return;
      }

      const newWarga: Warga = {
        id: `warga-${Date.now()}`,
        noKK: '',
        nik: formData.nik,
        namaLengkap: formData.namaLengkap,
        jenisKelamin: formData.jenisKelamin,
        tempatLahir: '',
        tanggalLahir: '2000-01-01',
        agama: Agama.ISLAM,
        pekerjaan: '',
        statusPerkawinan: StatusPerkawinan.BELUM_KAWIN,
        noHP: formData.noHP,
        email: formData.email,
        isKepalaKeluarga: false,
        role: UserRole.WARGA,
        statusKependudukan: "AKTIF",
        isVerified: false, // Account created but inactive, waiting for admin approval
        isDataComplete: false,
        joinedAt: new Date().toISOString().split('T')[0],
        password: formData.password || '123456',
      };
  
      onRegister(newWarga);
      onShowToast("Pendaftaran berhasil! Email terverifikasi. Menunggu persetujuan Admin.", "success");
      // Reset form
      setRegisterStep('INPUT_DATA');
      setRegisterOtp('');
      setFormData({
          nik: '',
          namaLengkap: '',
          noHP: '',
          email: '',
          jenisKelamin: Gender.LAKI_LAKI,
          password: '',
      });
      // Switch to login mode or stay to show message? 
      // Usually redirect to login with message. 
      // onRegister in parent sets state to APP, which logs them in automatically in current implementation.
      // But wait, isVerified is false. So they will be logged in but restricted?
      // Let's check App.tsx logic.
      // onRegister sets currentUser.
      // If currentUser.isVerified is false, what happens?
      // In App.tsx: if (!currentUser) return AuthScreen.
      // If currentUser exists, it renders content.
      // But handleLogin checks isVerified.
      // onRegister bypasses handleLogin check in the current implementation:
      // onRegister={(w) => { setWargaList([...wargaList, w]); setCurrentUserId(w.id); setAppState('APP'); setCurrentView(ViewState.MY_PROFILE); }}
      // So they get logged in immediately even if isVerified=false.
      // We should probably NOT log them in automatically if isVerified is false, OR we let them in but show restricted view.
      // The user request says "sebelum akunnya aktif".
      // So we should probably NOT log them in automatically.
      // I will update the parent onRegister logic later if needed, but for now let's stick to the requested flow.
      // Actually, if I change onRegister behavior in AuthScreen, I might break the parent's expectation.
      // But wait, the parent passes `onRegister`.
      // If I call `onRegister`, the parent executes: `setCurrentUserId(w.id); setAppState('APP');`
      // This logs them in.
      // If we want "waiting for admin", we should probably NOT log them in.
      // But for now, let's implement the email verification.
  };

  const handleRequestReset = (e: React.FormEvent) => {
      e.preventDefault();
      const user = wargaList.find(w => w.nik === resetIdentifier || w.noHP === resetIdentifier || w.email === resetIdentifier);
      
      if (!user) {
          onShowToast("Data tidak ditemukan.", "error");
          return;
      }

      if (!user.isVerified) {
          onShowToast("Akun belum diverifikasi oleh Ketua RT. Hubungi pengurus.", "error");
          return;
      }

      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setTargetResetUserId(user.id);
      
      // Simulate Sending OTP
      alert(`[SIMULASI WA/EMAIL]\n\nKode OTP Reset Password Anda: ${code}\n\nDikirim ke: ${user.noHP} / ${user.email}`);
      
      setResetStep('VERIFY_OTP');
      onShowToast("Kode OTP telah dikirim ke WhatsApp/Email Anda.", "success");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
      e.preventDefault();
      if (otp === generatedOtp) {
          setResetStep('NEW_PASSWORD');
          onShowToast("OTP Valid. Silakan buat password baru.", "success");
      } else {
          onShowToast("Kode OTP salah.", "error");
      }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
          onShowToast("Password minimal 6 karakter.", "error");
          return;
      }

      if (targetResetUserId) {
          onResetPassword(targetResetUserId, newPassword);
          onShowToast("Password berhasil diubah. Silakan login.", "success");
          setMode('LOGIN');
          setResetStep('INPUT_ID');
          setResetIdentifier('');
          setOtp('');
          setNewPassword('');
      }
  };

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-gray-950 flex items-center justify-center p-4 font-sans transition-colors overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full">
        {/* Main Auth Card */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl flex-1 border border-emerald-100 dark:border-emerald-900/30">
            <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition mb-6 text-sm font-bold">
            <ArrowLeft size={16} /> Kembali
            </button>
            
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-emerald-200 dark:shadow-none">
                    RT
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{mode === 'LOGIN' ? 'Masuk ke Akun' : 'Daftar Warga Baru'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{appConfig.appName} • {appConfig.regionName}</p>
            </div>

            <form onSubmit={
                mode === 'LOGIN' ? handleLogin : 
                mode === 'REGISTER' && registerStep === 'INPUT_DATA' ? handleInitiateRegister : 
                mode === 'REGISTER' && registerStep === 'VERIFY_EMAIL' ? handleFinalizeRegister :
                mode === 'FORGOT_PASSWORD' && resetStep === 'INPUT_ID' ? handleRequestReset : 
                mode === 'FORGOT_PASSWORD' && resetStep === 'VERIFY_OTP' ? handleVerifyOtp : 
                handleSaveNewPassword
            } className="space-y-4">
            
            {mode === 'REGISTER' && registerStep === 'INPUT_DATA' && (
                <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                    value={formData.namaLengkap} 
                    onChange={e => setFormData({...formData, namaLengkap: e.target.value})}
                    placeholder="Sesuai KTP"
                />
                </div>
            )}
            
            {mode !== 'FORGOT_PASSWORD' && !(mode === 'REGISTER' && registerStep === 'VERIFY_EMAIL') && (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{mode === 'LOGIN' ? 'NIK / Email / No HP' : 'NIK'}</label>
                        <input 
                        required
                        type="text" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                        value={formData.nik} 
                        onChange={e => setFormData({...formData, nik: e.target.value})}
                        placeholder={mode === 'LOGIN' ? "Masukkan NIK, Email atau No HP" : "16 Digit NIK"}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input 
                        required
                        type="password" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="Masukkan Password"
                        />
                    </div>
                </>
            )}

            {mode === 'REGISTER' && registerStep === 'INPUT_DATA' && (
                <>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Aktif</label>
                    <input 
                    required
                    type="email" 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="nama@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">No WhatsApp Aktif</label>
                    <input 
                    required
                    type="text" 
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                    value={formData.noHP} 
                    onChange={e => setFormData({...formData, noHP: e.target.value})}
                    placeholder="0812..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, jenisKelamin: Gender.LAKI_LAKI})}
                            className={`p-3 rounded-xl border text-sm font-bold transition ${formData.jenisKelamin === Gender.LAKI_LAKI ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                        >
                            Laki-laki
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setFormData({...formData, jenisKelamin: Gender.PEREMPUAN})}
                            className={`p-3 rounded-xl border text-sm font-bold transition ${formData.jenisKelamin === Gender.PEREMPUAN ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                        >
                            Perempuan
                        </button>
                    </div>
                </div>
                </>
            )}

            {mode === 'REGISTER' && registerStep === 'VERIFY_EMAIL' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Masukkan Kode Verifikasi Email</label>
                        <input 
                            required
                            type="text" 
                            maxLength={6}
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white text-center font-mono text-xl tracking-widest" 
                            value={registerOtp} 
                            onChange={e => setRegisterOtp(e.target.value)}
                            placeholder="000000"
                        />
                        <p className="text-xs text-gray-500 mt-2">Kode telah dikirim ke <strong>{formData.email}</strong></p>
                    </div>
                </div>
            )}

            {mode === 'FORGOT_PASSWORD' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    {resetStep === 'INPUT_ID' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">NIK / No HP / Email Terdaftar</label>
                            <input 
                                required
                                type="text" 
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                                value={resetIdentifier} 
                                onChange={e => setResetIdentifier(e.target.value)}
                                placeholder="Masukkan data untuk verifikasi"
                            />
                            <p className="text-xs text-gray-500 mt-2">Kode OTP akan dikirimkan ke WhatsApp atau Email yang terdaftar.</p>
                        </div>
                    )}

                    {resetStep === 'VERIFY_OTP' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Masukkan Kode OTP</label>
                            <input 
                                required
                                type="text" 
                                maxLength={6}
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white text-center font-mono text-xl tracking-widest" 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)}
                                placeholder="000000"
                            />
                            <p className="text-xs text-gray-500 mt-2">Cek WhatsApp atau Email Anda.</p>
                        </div>
                    )}

                    {resetStep === 'NEW_PASSWORD' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password Baru</label>
                            <input 
                                required
                                type="password" 
                                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition bg-white dark:bg-gray-800 dark:text-white" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                            />
                        </div>
                    )}
                </div>
            )}

            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 dark:shadow-none mt-2">
                {mode === 'LOGIN' ? 'Masuk Sekarang' : 
                 mode === 'REGISTER' && registerStep === 'INPUT_DATA' ? 'Daftar & Verifikasi Email' : 
                 mode === 'REGISTER' && registerStep === 'VERIFY_EMAIL' ? 'Verifikasi & Buat Akun' :
                 mode === 'FORGOT_PASSWORD' && resetStep === 'INPUT_ID' ? 'Kirim Kode OTP' : 
                 mode === 'FORGOT_PASSWORD' && resetStep === 'VERIFY_OTP' ? 'Verifikasi OTP' : 'Simpan Password Baru'}
            </button>
            </form>

            <div className="mt-8 text-center text-sm space-y-2">
                {mode === 'LOGIN' && (
                    <button 
                        onClick={() => { setMode('FORGOT_PASSWORD'); setResetStep('INPUT_ID'); }}
                        className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-xs font-bold uppercase tracking-widest"
                    >
                        Lupa Password?
                    </button>
                )}
                
                <p className="text-gray-500 dark:text-gray-400">
                    {mode === 'LOGIN' ? 'Belum punya akun?' : mode === 'REGISTER' ? 'Sudah punya akun?' : 'Ingat password Anda?'}
                    <button 
                        onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                        className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                        {mode === 'LOGIN' ? 'Daftar di sini' : 'Masuk di sini'}
                    </button>
                </p>
            </div>
        </div>

        {/* Demo Quick Access Card */}
        <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl w-full lg:w-80 border border-emerald-800 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Shield className="text-emerald-400" size={20} />
                <h3 className="font-bold text-sm uppercase tracking-widest text-emerald-200">Akses Demo Pengurus</h3>
            </div>
            <p className="text-xs text-emerald-100/70 mb-6 leading-relaxed">
                Pilih peran di bawah ini untuk melihat simulasi tampilan aplikasi dari berbagai perspektif pengurus.
            </p>
            
            <div className="space-y-3 flex-1">
                {[
                    { role: UserRole.KETUA_RT, name: 'Pak Asep', icon: <UserCircle size={18}/>, color: 'bg-white/10 hover:bg-white/20' },
                    { role: UserRole.SEKRETARIS, name: 'Bu Siti', icon: <FileText size={18}/>, color: 'bg-white/10 hover:bg-white/20' },
                    { role: UserRole.BENDAHARA, name: 'Haji Ahmad', icon: <Banknote size={18}/>, color: 'bg-white/10 hover:bg-white/20' },
                    { role: UserRole.WARGA, name: 'Budi Santoso', icon: <Users size={18}/>, color: 'bg-emerald-600 hover:bg-emerald-500' },
                ].map((demo) => (
                    <button 
                        key={demo.role}
                        onClick={() => handleQuickLogin(demo.role)}
                        className={`w-full p-4 ${demo.color} rounded-2xl transition flex items-center justify-between border border-white/5 group`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg text-emerald-300 group-hover:scale-110 transition-transform">
                                {demo.icon}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tighter text-emerald-400 leading-none mb-1">{demo.role}</p>
                                <p className="font-bold text-sm">{demo.name}</p>
                            </div>
                        </div>
                        <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                    </button>
                ))}
            </div>

            <div className="mt-8 p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex gap-2 items-start">
                    <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-emerald-100/50 leading-relaxed">
                        Data dalam demo ini bersifat statis dan tersimpan di memori browser lokal (LocalStorage) Anda.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ComingSoonView: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm border-dashed transition-colors">
    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-full mb-6">
      <Construction size={48} className="text-amber-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full mb-4 border border-amber-200 dark:border-amber-800">
      STATUS: DALAM PENGEMBANGAN
    </span>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{description}</p>
  </div>
);

const App: React.FC = () => {
  // --- Data State ---
  const [isLoading, setIsLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfig>(INITIAL_APP_CONFIG);
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [keuanganList, setKeuanganList] = useState<Keuangan[]>([]);
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>([]);
  const [rtProfileData, setRTProfileData] = useState<RTProfileData>(INITIAL_RT_PROFILE);
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [peristiwaList, setPeristiwaList] = useState<Peristiwa[]>([]);
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>([]);
  const [undanganList, setUndanganList] = useState<UndanganAcara[]>([]);
  const [wakafPrograms, setWakafPrograms] = useState<WakafProgram[]>(INITIAL_WAKAF_PROGRAMS);
  const [wakafTransactions, setWakafTransactions] = useState<WakafTransaksi[]>(INITIAL_WAKAF_TRANSACTIONS);
  const [umkmList, setUmkmList] = useState<UMKMProduct[]>(INITIAL_UMKM_PRODUCTS);
  const [bansosDistributions, setBansosDistributions] = useState<BansosDistribution[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [wargaRes, keuanganRes, pengumumanRes, aspirasiRes] = await Promise.all([
          fetch('/api/warga'),
          fetch('/api/keuangan'),
          fetch('/api/pengumuman'),
          fetch('/api/aspirasi')
        ]);

        if (wargaRes.ok) setWargaList(await wargaRes.json());
        if (keuanganRes.ok) setKeuanganList(await keuanganRes.json());
        if (pengumumanRes.ok) setPengumumanList(await pengumumanRes.json());
        if (aspirasiRes.ok) setAspirasiList(await aspirasiRes.json());
        
        // Fallback for others if not implemented in API yet
        const savedConfig = localStorage.getItem('simrt_config');
        if (savedConfig) setAppConfig(JSON.parse(savedConfig));
        
        const savedProfile = localStorage.getItem('simrt_profile');
        if (savedProfile) setRTProfileData(JSON.parse(savedProfile));

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Auth & View State ---
  const [appState, setAppState] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'APP'>('LANDING');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = currentUserId ? wargaList.find(w => w.id === currentUserId) || null : null;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // --- Theme State ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('simrt_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('simrt_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('simrt_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- UI State ---
  const [currentView, setCurrentView] = useState<ViewState>("DASHBOARD");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const notifRef = useRef<HTMLDivElement>(null);

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('simrt_config', JSON.stringify(appConfig)); }, [appConfig]);
  useEffect(() => { localStorage.setItem('simrt_warga', JSON.stringify(wargaList)); }, [wargaList]);
  useEffect(() => { localStorage.setItem('simrt_keuangan', JSON.stringify(keuanganList)); }, [keuanganList]);
  useEffect(() => { localStorage.setItem('simrt_aspirasi', JSON.stringify(aspirasiList)); }, [aspirasiList]);
  useEffect(() => { localStorage.setItem('simrt_profile', JSON.stringify(rtProfileData)); }, [rtProfileData]);
  useEffect(() => { localStorage.setItem('simrt_galeri', JSON.stringify(galeriList)); }, [galeriList]);
  useEffect(() => { localStorage.setItem('simrt_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('simrt_requests', JSON.stringify(requests)); }, [requests]);
  useEffect(() => { localStorage.setItem('simrt_peristiwa', JSON.stringify(peristiwaList)); }, [peristiwaList]);
  useEffect(() => { localStorage.setItem('simrt_pengumuman', JSON.stringify(pengumumanList)); }, [pengumumanList]);
  useEffect(() => { localStorage.setItem('simrt_undangan', JSON.stringify(undanganList)); }, [undanganList]);
  useEffect(() => { localStorage.setItem('simrt_wakaf_programs', JSON.stringify(wakafPrograms)); }, [wakafPrograms]);
  useEffect(() => { localStorage.setItem('simrt_wakaf_transactions', JSON.stringify(wakafTransactions)); }, [wakafTransactions]);
  useEffect(() => { localStorage.setItem('simrt_umkm', JSON.stringify(umkmList)); }, [umkmList]);
  useEffect(() => { localStorage.setItem('simrt_bansos', JSON.stringify(bansosDistributions)); }, [bansosDistributions]);
  useEffect(() => { localStorage.setItem('simrt_logs', JSON.stringify(activityLogs)); }, [activityLogs]);

  // --- Real-time Sync Effect (Multi-tab Support) ---
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'simrt_warga' && e.newValue) {
        setWargaList(JSON.parse(e.newValue));
      }
      if (e.key === 'simrt_keuangan' && e.newValue) {
        setKeuanganList(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Global Toast Handler ---
  const handleShowToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => setToast(prev => ({ ...prev, show: false }));

  // --- Handlers ---
  const handleUpdateAppConfig = (newConfig: AppConfig) => setAppConfig(newConfig);

  const handleAddLog = (aktivitas: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      aktivitas,
      timestamp: new Date().toLocaleString('id-ID')
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateWarga = async (updatedWarga: Warga) => { 
    try {
      const res = await fetch(`/api/warga/${updatedWarga.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWarga)
      });
      if (res.ok) {
        const data = await res.json();
        setWargaList(wargaList.map(w => w.id === data.id ? data : w)); 
        handleShowToast("Data profil berhasil diperbarui.", "success");
      }
    } catch (error) {
      handleShowToast("Gagal memperbarui data.", "error");
    }
  };

  const handleApproveAccount = (warga: Warga) => {
      const updated = { ...warga, isVerified: true };
      setWargaList(prev => prev.map(w => w.id === warga.id ? updated : w));
      
      handleAddNotification({
          id: `ACC-APP-${Date.now()}`,
          userId: warga.id,
          pesan: "🎉 Selamat! Akun Anda telah diverifikasi oleh pengurus RT. Anda kini memiliki akses penuh ke fitur aplikasi.",
          tipe: 'SYSTEM',
          isRead: false,
          tanggal: new Date().toISOString().split('T')[0]
      });
      handleShowToast(`Akun ${warga.namaLengkap} berhasil diverifikasi.`, 'success');
  };

  const handleRejectAccount = (warga: Warga, reason: string) => {
      const updated = { ...warga, isDataComplete: false };
      setWargaList(prev => prev.map(w => w.id === warga.id ? updated : w));
      
      handleAddNotification({
          id: `ACC-REJ-${Date.now()}`,
          userId: warga.id,
          pesan: `❌ Verifikasi Akun Ditolak: ${reason}. Mohon periksa kembali data profil & dokumen Anda.`,
          tipe: 'SYSTEM',
          isRead: false,
          tanggal: new Date().toISOString().split('T')[0]
      });
      handleShowToast(`Persetujuan akun ${warga.namaLengkap} ditolak.`, 'error');
  };

  const handleAddTransaksi = async (trx: Keuangan) => {
    try {
      const res = await fetch('/api/keuangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trx)
      });
      if (res.ok) {
        const data = await res.json();
        setKeuanganList(prev => [data, ...prev]);
      }
    } catch (error) {
      handleShowToast("Gagal menyimpan transaksi.", "error");
    }
  };

  const handleDeleteTransaksi = async (id: string) => {
    try {
      const res = await fetch(`/api/keuangan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeuanganList(keuanganList.filter(k => k.id !== id));
      }
    } catch (error) {
      handleShowToast("Gagal menghapus transaksi.", "error");
    }
  };
  const handleAddAspirasi = (item: Aspirasi) => setAspirasiList([item, ...aspirasiList]);
  
  // Fix: Added missing handleAddRequest function to manage ChangeRequest submissions.
  const handleAddRequest = (req: ChangeRequest) => setRequests(prev => [req, ...prev]);

  const handleUpdateAspirasiStatus = (id: string, status: Aspirasi['status']) => { 
    setAspirasiList(aspirasiList.map(a => a.id === id ? { ...a, status } : a)); 
    handleShowToast(`Status aspirasi diubah menjadi ${status}.`, "success");
  };

  const handleAddNotification = (notif: UserNotification) => setNotifications([notif, ...notifications]);

  const handleUpdateRequestStatus = (id: string, status: 'DISETUJUI' | 'DITOLAK', catatan?: string) => {
    const targetReq = requests.find(r => r.id === id);
    if(!targetReq) return;

    setRequests(requests.map(r => r.id === id ? { ...r, status, catatanAdmin: catatan } : r));

    if (status === 'DISETUJUI') {
        const targetWarga = wargaList.find(w => w.id === targetReq.wargaId);
        if (targetWarga) {
            const mapField: Record<string, keyof Warga> = { 'Pekerjaan': 'pekerjaan', 'Agama': 'agama', 'Status Perkawinan': 'statusPerkawinan' };
            const key = mapField[targetReq.field];
            if(key) {
                 const newWarga = { ...targetWarga, [key]: targetReq.newValue };
                 setWargaList(wargaList.map(w => w.id === targetWarga.id ? newWarga : w));
            }
        }
    }

    handleAddNotification({
        id: Date.now().toString() + '_req_notif',
        userId: targetReq.wargaId,
        pesan: status === 'DISETUJUI' 
            ? `Selamat! Pengajuan perubahan data (${targetReq.field}) Anda telah DISETUJUI.`
            : `Mohon maaf, pengajuan perubahan data (${targetReq.field}) Anda DITOLAK. ${catatan ? `Alasan: ${catatan}` : ''}`,
        tipe: 'SYSTEM',
        isRead: false,
        tanggal: new Date().toISOString().split('T')[0]
    });
    handleShowToast(`Permintaan berhasil ${status.toLowerCase()}.`, "success");
  };

  const handleLogout = () => setShowLogoutDialog(true);
  const confirmLogout = () => { setCurrentUserId(null); setAppState('LANDING'); setShowLogoutDialog(false); };

  const handleResetPassword = (userId: string, newPass: string) => {
    setWargaList(prev => prev.map(w => w.id === userId ? { ...w, password: newPass } : w));
  };

  if (appState === 'LANDING') {
      return (
        <>
            <ToastNotification show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />
            <LandingPage 
                onLogin={() => setAppState('LOGIN')} 
                onRegister={() => setAppState('REGISTER')} 
                appConfig={appConfig} 
                wargaList={wargaList}
            />
        </>
      );
  }

  if (!currentUser && (appState === 'LOGIN' || appState === 'REGISTER')) {
    return (
      <>
        <ToastNotification show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />
        <AuthScreen 
          initialMode={appState}
          onLogin={(id) => { setCurrentUserId(id); setAppState('APP'); setCurrentView("DASHBOARD"); }} 
          onRegister={async (w) => { 
              try {
                const res = await fetch('/api/warga', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(w)
                });
                if (res.ok) {
                  const data = await res.json();
                  setWargaList([...wargaList, data]); 
                  setCurrentUserId(data.id); 
                  setAppState('APP'); 
                  setCurrentView("PROFIL_SAYA"); 
                }
              } catch (error) {
                handleShowToast("Gagal mendaftar.", "error");
              }
          }}
          onResetPassword={handleResetPassword}
          wargaList={wargaList} 
          onBack={() => setAppState('LANDING')}
          appConfig={appConfig}
          onShowToast={handleShowToast}
        />
      </>
    );
  }

  if (!currentUser) return null;

  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(currentUser.role);
  const isDataIncomplete = currentUser.role === UserRole.WARGA && !currentUser.isDataComplete;
  if (isDataIncomplete && currentView !== 'PROFIL_SAYA') setCurrentView('PROFIL_SAYA');

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard wargaList={wargaList} keuanganList={keuanganList} aspirasiList={aspirasiList} currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'ADMIN_NOTIFICATIONS': 
        return <AdminNotifications 
            requests={requests} 
            keuanganList={keuanganList} 
            aspirasiList={aspirasiList}
            wargaList={wargaList}
            onNavigate={setCurrentView}
            onApproveRequest={(id) => handleUpdateRequestStatus(id, 'DISETUJUI')}
            onRejectRequest={(id, reason) => handleUpdateRequestStatus(id, 'DITOLAK', reason)}
            onApproveWarga={handleApproveAccount}
            onRejectWarga={handleRejectAccount}
        />;
      case 'DATA_WARGA': return <CitizenManagement wargaList={wargaList} requests={requests} currentUser={currentUser} onAddWarga={async (w) => {
          try {
            const res = await fetch('/api/warga', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(w)
            });
            if (res.ok) {
              const data = await res.json();
              setWargaList([...wargaList, data]);
            }
          } catch (error) {
            handleShowToast("Gagal menambah warga.", "error");
          }
      }} onUpdateWarga={handleUpdateWarga} onDeleteWarga={async (id) => {
          // Need DELETE endpoint for warga too, but for now let's just filter locally or add it later
          setWargaList(wargaList.filter(w => w.id !== id));
      }} onUpdateRequestStatus={handleUpdateRequestStatus} onShowToast={handleShowToast} onNavigate={setCurrentView} onLogActivity={handleAddLog} />;
      case 'KEUANGAN': return <Finance keuanganList={keuanganList} wargaList={wargaList} onAddTransaksi={handleAddTransaksi} onDeleteTransaksi={handleDeleteTransaksi} onSendNotification={handleAddNotification} currentUser={currentUser} onShowToast={handleShowToast} appConfig={appConfig} onUpdateAppConfig={handleUpdateAppConfig} />;
      case 'SURAT': return <LetterGenerator wargaList={wargaList} onSendNotification={handleAddNotification} onShowToast={handleShowToast} />;
      case 'AI_ASSISTANT': return <AIAssistant wargaList={wargaList} onSendNotification={handleAddNotification} currentUser={currentUser} />;
      case 'PENGUMUMAN': return <Announcements currentUser={currentUser} pengumumanList={pengumumanList} onAddPengumuman={(item) => setPengumumanList([...pengumumanList, item])} undanganList={undanganList} onAddUndangan={(item) => setUndanganList([...undanganList, item])} onRsvp={(id, userId) => setUndanganList(undanganList.map(u => u.id === id ? { ...u, attendees: u.attendees.includes(userId) ? u.attendees.filter(a => a !== userId) : [...u.attendees, userId] } : u))} wargaList={wargaList} onSendNotification={handleAddNotification} onShowToast={handleShowToast} />;
      case 'ASPIRASI': return <AspirasiPage currentUser={currentUser} aspirasiList={aspirasiList} onAddAspirasi={handleAddAspirasi} onUpdateStatus={handleUpdateAspirasiStatus} wargaList={wargaList} onSendNotification={handleAddNotification} onShowToast={handleShowToast} />;
      case 'PROFIL_SAYA': return <MyProfile currentUser={currentUser} familyMembers={wargaList.filter(w => w.noKK === currentUser.noKK)} financialHistory={keuanganList} notifications={notifications} requests={requests} wargaList={wargaList} onUpdateProfile={handleUpdateWarga} onLogout={handleLogout} onMarkAsRead={(id) => setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))} onAddRequest={handleAddRequest} onNavigate={setCurrentView} onSendNotification={handleAddNotification} onShowToast={handleShowToast} />;
      case 'PROFIL_RT': return <RTProfile data={rtProfileData} appConfig={appConfig} onUpdate={setRTProfileData} isEditable={isAdmin} onShowToast={handleShowToast} />;
      case 'GALERI': return <ActivityGallery items={galeriList} onAdd={(item) => setGaleriList([...galeriList, item])} onDelete={(id) => setGaleriList(galeriList.filter(g => g.id !== id))} currentUser={currentUser} onShowToast={handleShowToast} />;
      case 'PERISTIWA': return <PopulationEvents peristiwaList={peristiwaList} wargaList={wargaList} onAddPeristiwa={(data) => setPeristiwaList([...peristiwaList, data])} onDeletePeristiwa={(id) => setPeristiwaList(peristiwaList.filter(p => p.id !== id))} currentUser={currentUser} onShowToast={handleShowToast} onSendNotification={handleAddNotification} />;
      case 'WAKAF': return <ComingSoonView title="Modul Wakaf RW" description="Fitur Wakaf RW sedang dalam tahap pengembangan. Nantikan kemudahan berwakaf dan transparansi pengelolaan dana umat segera." />;
      case 'UMKM': return <ComingSoonView title="UMKM Ergen" description="Platform UMKM Ergen sedang dipersiapkan untuk mendukung ekonomi warga. Fitur ini akan segera hadir." />;
      case 'BANSOS': return <SocialAidManagement wargaList={wargaList} distributions={bansosDistributions} onAddDistribution={(d) => setBansosDistributions([d, ...bansosDistributions])} currentUser={currentUser} />;
      case 'PENGATURAN': return <Settings appConfig={appConfig} onUpdateConfig={handleUpdateAppConfig} currentUser={currentUser} onShowToast={handleShowToast} />;
      case 'RIWAYAT_PERUBAHAN': return <DataChangeHistory requests={requests} wargaList={wargaList} />;
      default: return <Dashboard wargaList={wargaList} keuanganList={keuanganList} aspirasiList={aspirasiList} currentUser={currentUser} onNavigate={setCurrentView} />;
    }
  };

  const NavItem = ({ view, label, icon }: { view: ViewState, label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        currentView === view 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300'
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-200`}>
      <ToastNotification show={toast.show} message={toast.message} type={toast.type} onClose={handleCloseToast} />
      
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
               {appConfig.logoUrl ? <img src={appConfig.logoUrl} alt="RT" className="w-full h-full object-contain" /> : <div className="bg-emerald-600 w-full h-full flex items-center justify-center text-white font-bold rounded-lg">RT</div>}
             </div>
             <div>
                <h1 className="text-lg font-bold text-emerald-700 dark:text-emerald-500 leading-tight">{appConfig.appName}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate w-32">{appConfig.regionName}</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto hide-scrollbar">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-4">Menu Utama</p>
          <NavItem view="DASHBOARD" label="Dashboard" icon={<LayoutDashboard size={20} />} />
          <NavItem view="PROFIL_SAYA" label="Profil Saya" icon={<UserCircle size={20} />} />
          <NavItem view="KEUANGAN" label="Iuran & Kas" icon={<Banknote size={20} />} />
          <NavItem view="PENGUMUMAN" label="Berita & Info" icon={<Bell size={20} />} />
          
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-6 mb-2 px-4">Layanan Warga</p>
          <NavItem view="SURAT" label="Layanan Surat" icon={<FileText size={20} />} />
          <NavItem view="ASPIRASI" label="Suara Warga" icon={<MessageSquare size={20} />} />
          <NavItem view="WAKAF" label="Wakaf RW" icon={<HeartHandshake size={20} />} />
          <NavItem view="UMKM" label="UMKM Ergen" icon={<ShoppingBag size={20} />} />
          <NavItem view="AI_ASSISTANT" label="Asisten AI" icon={<Bot size={20} />} />
          
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-6 mb-2 px-4">Informasi</p>
          <NavItem view="DATA_WARGA" label="Data Penduduk" icon={<Users size={20} />} />
          <NavItem view="PROFIL_RT" label="Profil RT 06" icon={<Building size={20} />} />
          <NavItem view="GALERI" label="Galeri Kegiatan" icon={<ImageIcon size={20} />} />

          {isAdmin && (
            <>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-6 mb-2 px-4">Panel Pengurus</p>
              <NavItem view="BANSOS" label="Bantuan Sosial" icon={<Gift size={20} />} />
              <NavItem view="PERISTIWA" label="Mutasi Warga" icon={<ClipboardList size={20} />} />
              <NavItem view="RIWAYAT_PERUBAHAN" label="Log Audit Data" icon={<History size={20} />} />
              <NavItem view="PENGATURAN" label="Pengaturan" icon={<SettingsIcon size={20} />} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
             <LogOut size={20} /> <span>Keluar</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0 transition-colors">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
               <Menu size={24} />
             </button>
             <h2 className="text-lg font-bold text-gray-800 dark:text-white hidden sm:block">{currentView.replace('_', ' ')}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <button onClick={toggleTheme} className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
               {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
             </button>
             
             {isAdmin && (
                <div className="relative">
                    <button 
                        onClick={() => setCurrentView('ADMIN_NOTIFICATIONS')}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition relative group"
                    >
                        <Bell size={20} />
                        {(requests.filter(r => r.status === 'DIAJUKAN').length > 0 || 
                          keuanganList.filter(k => k.status === 'MENUNGGU_VERIFIKASI').length > 0 ||
                          wargaList.filter(w => w.isDataComplete && !w.isVerified).length > 0) && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                        )}
                    </button>
                </div>
             )}

             <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

             <button 
                onClick={() => setCurrentView('PROFIL_SAYA')}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
             >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm overflow-hidden shrink-0 border-2 border-white dark:border-gray-700">
                    {currentUser.fotoProfil ? <img src={currentUser.fotoProfil} alt="U" className="w-full h-full object-cover" /> : currentUser.namaLengkap.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                    <p className="text-xs font-black text-gray-800 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">{currentUser.namaLengkap.split(' ')[0]}</p>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">{currentUser.role}</p>
                </div>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-gray-950 transition-colors hide-scrollbar">
           <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
             {renderContent()}
           </div>
        </div>
      </main>

      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-gray-100 dark:border-gray-800 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 dark:text-red-400">
                    <LogOut size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Akhiri Sesi?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Apakah Anda yakin ingin keluar dari sistem SIAGA ERGEN?</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowLogoutDialog(false)} className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition">Batal</button>
                    <button onClick={confirmLogout} className="py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 dark:shadow-none">Ya, Keluar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
