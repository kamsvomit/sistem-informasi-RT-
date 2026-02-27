import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Warga, Gender, StatusPerkawinan, StatusTinggal, UserRole } from '../types';

interface CitizenExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wargaList: Warga[];
  currentUser: Warga;
  onLogActivity: (activity: string) => void;
}

type ExportFormat = 'COMPLETE' | 'STATISTICS' | 'BANSOS';
type FileFormat = 'XLSX' | 'CSV' | 'PDF';

const CitizenExportModal: React.FC<CitizenExportModalProps> = ({ 
  isOpen, onClose, wargaList, currentUser, onLogActivity 
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('COMPLETE');
  const [fileFormat, setFileFormat] = useState<FileFormat>('XLSX');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterAgeMin, setFilterAgeMin] = useState<string>('');
  const [filterAgeMax, setFilterAgeMax] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // --- Helper Functions ---

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getFilteredData = () => {
    return wargaList.filter(w => {
      // Status Filter
      if (filterStatus === 'ACTIVE' && w.statusKependudukan !== 'AKTIF') return false;
      if (filterStatus === 'INACTIVE' && w.statusKependudukan === 'AKTIF') return false;

      // Age Filter
      const age = calculateAge(w.tanggalLahir);
      if (filterAgeMin && age < parseInt(filterAgeMin)) return false;
      if (filterAgeMax && age > parseInt(filterAgeMax)) return false;

      return true;
    });
  };

  const generateCompleteData = (data: Warga[]) => {
    return data.map((w, index) => ({
      No: index + 1,
      'No KK': w.noKK,
      NIK: w.nik,
      'Nama Lengkap': w.namaLengkap,
      'Jenis Kelamin': w.jenisKelamin,
      'Tempat Lahir': w.tempatLahir,
      'Tanggal Lahir': w.tanggalLahir,
      'Usia': calculateAge(w.tanggalLahir),
      'Status Perkawinan': w.statusPerkawinan,
      'Status dalam Keluarga': w.isKepalaKeluarga ? 'KEPALA KELUARGA' : 'ANGGOTA',
      'Pekerjaan': w.pekerjaan || '-',
      'Alamat': w.alamatRumah,
      'Status Rumah': w.statusTinggal,
      'Status Domisili': w.statusKependudukan
    }));
  };

  const generateStatisticsData = (data: Warga[]) => {
    const totalKK = new Set(data.map(w => w.noKK)).size;
    const totalPenduduk = data.length;
    const lakiLaki = data.filter(w => w.jenisKelamin === Gender.LAKI_LAKI).length;
    const perempuan = data.filter(w => w.jenisKelamin === Gender.PEREMPUAN).length;
    const anak = data.filter(w => calculateAge(w.tanggalLahir) < 17).length;
    const lansia = data.filter(w => calculateAge(w.tanggalLahir) >= 60).length;
    const kepalaKeluarga = data.filter(w => w.isKepalaKeluarga).length;
    const wargaKontrak = data.filter(w => w.statusTinggal !== StatusTinggal.TETAP).length;

    return [
      { Metric: 'Jumlah Kepala Keluarga (KK)', Value: totalKK },
      { Metric: 'Total Penduduk', Value: totalPenduduk },
      { Metric: 'Laki-laki', Value: lakiLaki },
      { Metric: 'Perempuan', Value: perempuan },
      { Metric: 'Anak-anak (<17 tahun)', Value: anak },
      { Metric: 'Lansia (>=60 tahun)', Value: lansia },
      { Metric: 'Kepala Keluarga', Value: kepalaKeluarga },
      { Metric: 'Warga Kontrak/Kost', Value: wargaKontrak },
    ];
  };

  const generateBansosData = (data: Warga[]) => {
    // Filter logic for potential bansos recipients
    return data.filter(w => {
      const age = calculateAge(w.tanggalLahir);
      const isLansia = age >= 60;
      const isKontrak = w.statusTinggal !== StatusTinggal.TETAP;
      // Mock simple job check for "low income" proxy
      const lowIncomeJobs = ['BURUH', 'PETANI', 'NELAYAN', 'TIDAK_BEKERJA', 'IBU_RUMAH_TANGGA', 'SERABUTAN'];
      const job = w.pekerjaan?.toUpperCase().replace(/\s/g, '_') || '';
      const isLowIncome = lowIncomeJobs.some(j => job.includes(j));
      
      return isLansia || isKontrak || isLowIncome;
    }).map((w, index) => {
      const age = calculateAge(w.tanggalLahir);
      const reasons = [];
      if (age >= 60) reasons.push('Lansia');
      if (w.statusTinggal !== StatusTinggal.TETAP) reasons.push('Non-Tetap');
      if (!w.pekerjaan || ['BURUH', 'SERABUTAN', 'TIDAK BEKERJA'].includes(w.pekerjaan.toUpperCase())) reasons.push('Pekerjaan Rentan');

      return {
        No: index + 1,
        'Nama Lengkap': w.namaLengkap,
        NIK: w.nik,
        'No KK': w.noKK,
        'Alamat': w.alamatRumah,
        'Kategori Rentan': reasons.join(', ')
      };
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    const filteredData = getFilteredData();
    let dataToExport: any[] = [];
    let fileName = `Export_${exportFormat}_${new Date().toISOString().split('T')[0]}`;

    // 1. Prepare Data
    if (exportFormat === 'COMPLETE') {
      dataToExport = generateCompleteData(filteredData);
    } else if (exportFormat === 'STATISTICS') {
      dataToExport = generateStatisticsData(filteredData);
    } else if (exportFormat === 'BANSOS') {
      dataToExport = generateBansosData(filteredData);
    }

    // 2. Generate File
    try {
      if (fileFormat === 'XLSX') {
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
      } else if (fileFormat === 'CSV') {
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (fileFormat === 'PDF') {
        const doc = new jsPDF();
        doc.text(`Laporan ${exportFormat.replace('_', ' ')} - RT 06 RW 19`, 14, 15);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);
        
        if (dataToExport.length > 0) {
          const headers = Object.keys(dataToExport[0]);
          const rows = dataToExport.map(row => Object.values(row));
          
          autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 163, 74] } // Emerald-600
          });
        } else {
          doc.text("Tidak ada data untuk ditampilkan.", 14, 30);
        }
        
        doc.save(`${fileName}.pdf`);
      }

      // 3. Log Activity
      onLogActivity(`Melakukan export data (${exportFormat}) - ${dataToExport.length} baris`);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal melakukan export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Download className="text-emerald-600" /> Export Data Kependudukan
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Pilih Jenis Laporan</label>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setExportFormat('COMPLETE')}
                className={`p-4 rounded-xl border-2 text-left transition flex items-center gap-3 ${exportFormat === 'COMPLETE' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`}
              >
                <div className={`p-2 rounded-full ${exportFormat === 'COMPLETE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Data Lengkap</h4>
                  <p className="text-xs text-gray-500">Semua kolom data kependudukan (NIK, KK, dll)</p>
                </div>
                {exportFormat === 'COMPLETE' && <CheckCircle className="ml-auto text-emerald-500" size={20} />}
              </button>

              <button 
                onClick={() => setExportFormat('STATISTICS')}
                className={`p-4 rounded-xl border-2 text-left transition flex items-center gap-3 ${exportFormat === 'STATISTICS' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`}
              >
                <div className={`p-2 rounded-full ${exportFormat === 'STATISTICS' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Rekapitulasi Statistik</h4>
                  <p className="text-xs text-gray-500">Ringkasan jumlah penduduk, KK, usia, dll</p>
                </div>
                {exportFormat === 'STATISTICS' && <CheckCircle className="ml-auto text-emerald-500" size={20} />}
              </button>

              <button 
                onClick={() => setExportFormat('BANSOS')}
                className={`p-4 rounded-xl border-2 text-left transition flex items-center gap-3 ${exportFormat === 'BANSOS' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`}
              >
                <div className={`p-2 rounded-full ${exportFormat === 'BANSOS' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">Data Bantuan Sosial</h4>
                  <p className="text-xs text-gray-500">Daftar warga rentan (Lansia, Non-Tetap, dll)</p>
                </div>
                {exportFormat === 'BANSOS' && <CheckCircle className="ml-auto text-emerald-500" size={20} />}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Filter size={16} /> Filter Data
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status Kependudukan</label>
                <select 
                  className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="ALL">Semua</option>
                  <option value="ACTIVE">Aktif Saja</option>
                  <option value="INACTIVE">Tidak Aktif</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Rentang Usia (Tahun)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    value={filterAgeMin}
                    onChange={(e) => setFilterAgeMin(e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    value={filterAgeMax}
                    onChange={(e) => setFilterAgeMax(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Format */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Format File Output</label>
            <div className="flex gap-3">
              {['XLSX', 'CSV', 'PDF'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFileFormat(fmt as FileFormat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${
                    fileFormat === fmt 
                      ? 'bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-gray-900' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Batal
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? 'Memproses...' : 'Download File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenExportModal;
