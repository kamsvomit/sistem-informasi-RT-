
import React, { useState } from 'react';
import { History, Search, Filter, ArrowRight, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { ChangeRequest, Warga } from '../types';

interface DataChangeHistoryProps {
  requests: ChangeRequest[];
  wargaList: Warga[];
}

const DataChangeHistory: React.FC<DataChangeHistoryProps> = ({ requests, wargaList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DISETUJUI' | 'DITOLAK' | 'DIAJUKAN'>('ALL');

  const filteredRequests = requests.filter(req => {
    const warga = wargaList.find(w => w.id === req.wargaId);
    const nameMatch = warga?.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const statusMatch = statusFilter === 'ALL' || req.status === statusFilter;
    return nameMatch && statusMatch;
  }).sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const getStatusBadge = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'DISETUJUI':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle size={12} /> Disetujui
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full border border-red-200 dark:border-red-800">
            <XCircle size={12} /> Ditolak
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
            <Clock size={12} /> Menunggu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <History className="text-blue-600 dark:text-blue-400" size={24} /> Riwayat Perubahan Data
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Log audit pengajuan perubahan data kependudukan warga.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari Nama Warga..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <Filter size={18} className="text-gray-400 dark:text-gray-500" />
            {(['ALL', 'DISETUJUI', 'DITOLAK', 'DIAJUKAN'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status === 'ALL' ? 'Semua' : status}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <History size={48} className="mx-auto mb-3 opacity-20" />
              <p>Tidak ada riwayat perubahan data ditemukan.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const warga = wargaList.find(w => w.id === req.wargaId);
              return (
                <div key={req.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition dark:hover:border-gray-600 group">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {warga?.namaLengkap.charAt(0) || '?'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{warga?.namaLengkap}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-mono">{warga?.nik}</span>
                          <span>•</span>
                          <span>{req.tanggalPengajuan}</span>
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Perubahan: {req.field}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-500 line-through decoration-red-400">{req.oldValue}</span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="font-bold text-gray-800 dark:text-white">{req.newValue}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-2 md:pt-0 md:pl-4">
                       <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                         <FileText size={10} /> Alasan Warga:
                       </p>
                       <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{req.alasan}"</p>
                       
                       {req.catatanAdmin && (
                         <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">Catatan Admin:</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{req.catatanAdmin}</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DataChangeHistory;
