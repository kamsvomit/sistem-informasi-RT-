import React, { useState, useRef } from 'react';
import { Upload, Download, X, AlertTriangle, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import { Warga, Gender, Agama, StatusPerkawinan, UserRole, StatusTinggal } from '../types';

interface CitizenBulkUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: Warga[]) => void;
  existingNiks: string[];
}

const CSV_TEMPLATE = `NO_KK,NIK,NAMA_LENGKAP,JENIS_KELAMIN,TEMPAT_LAHIR,TANGGAL_LAHIR,AGAMA,PEKERJAAN,STATUS_PERKAWINAN,NO_HP,ALAMAT_RUMAH,STATUS_TINGGAL,IS_KEPALA_KELUARGA,ROLE
3204100101010001,3204100101010001,Contoh Warga,LAKI_LAKI,Bandung,1990-01-01,ISLAM,Wiraswasta,KAWIN,08123456789,Jl. Contoh No 1,TETAP,TRUE,WARGA`;

const CitizenBulkUpload: React.FC<CitizenBulkUploadProps> = ({ isOpen, onClose, onUpload, existingNiks }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Warga[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_warga.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result: Warga[] = [];
    const newErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle commas inside quotes if necessary, but simple split for now
      const currentLine = lines[i].split(',');
      
      if (currentLine.length < headers.length) {
        newErrors.push(`Baris ${i + 1}: Format tidak sesuai (kurang kolom)`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = currentLine[index]?.trim();
      });

      // Validation & Mapping
      const nik = row['NIK'];
      if (!nik || nik.length !== 16) {
        newErrors.push(`Baris ${i + 1}: NIK tidak valid (${nik})`);
        continue;
      }
      if (existingNiks.includes(nik)) {
        newErrors.push(`Baris ${i + 1}: NIK sudah terdaftar (${nik})`);
        continue;
      }

      // Map to Warga object
      const warga: Warga = {
        id: `warga-${Date.now()}-${i}`,
        noKK: row['NO_KK'],
        nik: nik,
        namaLengkap: row['NAMA_LENGKAP'],
        jenisKelamin: row['JENIS_KELAMIN'] as Gender || Gender.LAKI_LAKI,
        tempatLahir: row['TEMPAT_LAHIR'],
        tanggalLahir: row['TANGGAL_LAHIR'],
        agama: row['AGAMA'] as Agama || Agama.ISLAM,
        pekerjaan: row['PEKERJAAN'],
        statusPerkawinan: row['STATUS_PERKAWINAN'] as StatusPerkawinan || StatusPerkawinan.BELUM_KAWIN,
        noHP: row['NO_HP'],
        alamatRumah: row['ALAMAT_RUMAH'],
        statusTinggal: row['STATUS_TINGGAL'] as StatusTinggal || StatusTinggal.TETAP,
        isKepalaKeluarga: row['IS_KEPALA_KELUARGA']?.toUpperCase() === 'TRUE',
        role: row['ROLE'] as UserRole || UserRole.WARGA,
        statusKependudukan: 'AKTIF',
        isVerified: true,
        isDataComplete: true,
        joinedAt: new Date().toISOString().split('T')[0],
        password: '123456' // Default password
      };

      result.push(warga);
    }

    setErrors(newErrors);
    setPreviewData(result);
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleConfirmUpload = () => {
    if (previewData.length > 0) {
      onUpload(previewData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Upload className="text-emerald-600" /> Import Data Warga (Bulk Upload)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <FileText size={18} /> Panduan Upload
            </h4>
            <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>Gunakan template CSV yang disediakan untuk menghindari kesalahan format.</li>
              <li>Pastikan <strong>NIK</strong> dan <strong>No KK</strong> terdiri dari 16 digit angka.</li>
              <li>Format Tanggal Lahir: <strong>YYYY-MM-DD</strong> (Contoh: 1990-01-31).</li>
              <li>Data NIK yang duplikat dengan database akan otomatis ditolak.</li>
            </ul>
            <button 
              onClick={handleDownloadTemplate}
              className="mt-4 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold hover:bg-blue-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Download size={16} /> Download Template CSV
            </button>
          </div>

          <div className="mb-6">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition group"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition">
                <Upload size={32} className="text-gray-400 group-hover:text-emerald-600 transition" />
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300">Klik untuk upload file CSV</p>
              <p className="text-sm text-gray-500">atau drag & drop file di sini</p>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} /> Terdapat {errors.length} Error
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-1">
                  {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Preview Data Valid ({previewData.length} Data)
              </h4>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-300">Nama</th>
                      <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-300">NIK</th>
                      <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-300">No KK</th>
                      <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-300">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {previewData.slice(0, 5).map((w, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{w.namaLengkap}</td>
                        <td className="px-4 py-2 font-mono">{w.nik}</td>
                        <td className="px-4 py-2 font-mono">{w.noKK}</td>
                        <td className="px-4 py-2">{w.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <div className="p-2 text-center text-xs text-gray-500 bg-gray-50 dark:bg-gray-800">
                    ...dan {previewData.length - 5} data lainnya
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Batal
          </button>
          <button 
            onClick={handleConfirmUpload} 
            disabled={previewData.length === 0}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={16} /> Import {previewData.length} Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenBulkUpload;
