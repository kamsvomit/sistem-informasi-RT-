
import React, { useState } from 'react';
import { FileText, Wand2, Download, RefreshCw, Copy, Check, Printer } from 'lucide-react';
import { UserNotification, UserRole, Warga } from '../types';
import { generateLetterDraft } from '../services/geminiService';

interface LetterGeneratorProps {
  wargaList: Warga[];
  onSendNotification?: (notif: UserNotification) => void;
  onShowToast?: (msg: string, type: 'success' | 'error') => void;
}

const LetterGenerator: React.FC<LetterGeneratorProps> = ({ wargaList, onSendNotification, onShowToast }) => {
  const [selectedWargaId, setSelectedWargaId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Helper to notify admin
  const notifyAdmins = (message: string) => {
    if (!onSendNotification) return;
    const admins = wargaList.filter(w => [UserRole.KETUA_RT, UserRole.SEKRETARIS].includes(w.role));
    admins.forEach(admin => {
        onSendNotification({
            id: `NOTIF-SURAT-${Date.now()}-${admin.id}`,
            userId: admin.id,
            pesan: message,
            tipe: 'SYSTEM',
            isRead: false,
            tanggal: new Date().toISOString().split('T')[0]
        });
    });
  };

  const handleGenerate = async () => {
    const warga = wargaList.find(w => w.id === selectedWargaId);
    if (!warga) {
      if(onShowToast) onShowToast("Pilih warga terlebih dahulu", 'error');
      return;
    }
    if (!recipient || !purpose) {
      if(onShowToast) onShowToast("Lengkapi tujuan dan keperluan surat", 'error');
      return;
    }

    setLoading(true);
    const result = await generateLetterDraft(recipient, purpose, warga.namaLengkap, warga.nik);
    setGeneratedContent(result);
    setLoading(false);

    // Notify Admins
    notifyAdmins(`Permintaan Surat: ${warga.namaLengkap} membuat draf surat untuk '${purpose}'.`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    if(onShowToast) onShowToast("Isi surat disalin ke clipboard", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit transition-colors">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
             <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Buat Surat Pengantar</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Isi form untuk membuat draf otomatis dengan AI.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Warga</label>
            <select 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              value={selectedWargaId}
              onChange={e => setSelectedWargaId(e.target.value)}
            >
              <option value="">-- Cari Nama Warga --</option>
              {wargaList.map(w => (
                <option key={w.id} value={w.id}>{w.namaLengkap} - {w.nik}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tujuan Surat</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="Contoh: Kantor Kelurahan, Bank BRI, Sekolah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keperluan</label>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg h-32 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              placeholder="Jelaskan keperluan pembuatan surat secara singkat..."
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !selectedWargaId}
            className={`w-full py-3 rounded-lg text-white font-bold flex justify-center items-center space-x-2 transition shadow-md ${loading || !selectedWargaId ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-900/20'}`}
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
            <span>{loading ? "AI Sedang Menulis..." : "Buat Draf dengan AI"}</span>
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-colors">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Pratinjau Surat</h3>
            {generatedContent && (
                <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Salin Teks"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            )}
        </div>
        
        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 font-serif text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap overflow-y-auto leading-relaxed shadow-inner">
          {generatedContent ? generatedContent : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <FileText size={48} className="opacity-50" />
              </div>
              <p>Isi formulir di samping untuk melihat hasil surat.</p>
            </div>
          )}
        </div>

        {generatedContent && (
          <div className="mt-4 flex justify-end gap-3">
            <button 
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob([generatedContent], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = `Surat_Pengantar_${new Date().getTime()}.txt`;
                document.body.appendChild(element);
                element.click();
              }}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg transition font-medium"
            >
              <Download size={18} />
              <span>Simpan Teks</span>
            </button>
            <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg transition font-bold shadow-sm"
            >
                <Printer size={18} />
                <span>Cetak / PDF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LetterGenerator;
