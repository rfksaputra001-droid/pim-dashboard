import { useState, useEffect, useCallback } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../utils/api.js';
import { formatRupiah, formatDateShort, STATUS_LABELS, STATUS_COLORS } from '../utils/format.js';

const STATUSES = ['', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function AdminIuran() {
  const [contributions, setContributions] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [waLink, setWaLink] = useState(null);
  const [proofModal, setProofModal] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page, ...(filterStatus ? { status: filterStatus } : {}) });
      const data = await api.get(`/admin/contributions?${qs}`);
      setContributions(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleVerify = async (id) => {
    if (!confirm('Verifikasi pembayaran ini?')) return;
    setActionLoading(id + '-verify');
    try {
      const { waLink: link } = await api.patch(`/admin/contributions/${id}/verify`, {});
      setWaLink(link);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return alert('Alasan penolakan wajib diisi');
    setActionLoading(rejectModal + '-reject');
    try {
      const { waLink: link } = await api.patch(`/admin/contributions/${rejectModal}/reject`, { reason: rejectReason });
      setWaLink(link);
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.get('/admin/contributions/export');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-donasi-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Manajemen Donasi</h1>
            <p className="text-xs text-gray-400">{contributions.total} total transaksi</p>
          </div>
          <button onClick={handleExport} className="btn-ghost text-xs">
            ⬇ Export CSV
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === '' ? 'Semua' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Tabel */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-left">No. WA</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-left">Catatan</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Bukti</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>
                ) : contributions.data.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
                ) : contributions.data.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDateShort(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{c.phone}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700 whitespace-nowrap">
                      {formatRupiah(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                      {c.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                      {c.rejectionReason && (
                        <p className="text-xs text-red-500 mt-0.5 max-w-24 truncate" title={c.rejectionReason}>
                          {c.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setProofModal(c.proofImageUrl)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Lihat
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'PENDING' && (
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleVerify(c.id)}
                            disabled={actionLoading === c.id + '-verify'}
                            className="btn-success text-xs px-2 py-1"
                          >
                            ✓ Verifikasi
                          </button>
                          <button
                            onClick={() => { setRejectModal(c.id); setRejectReason(''); }}
                            className="btn-danger text-xs px-2 py-1"
                          >
                            ✗ Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contributions.totalPages > 1 && (
            <div className="p-4 flex justify-center gap-2 border-t border-gray-50">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost text-xs">← Sebelumnya</button>
              <span className="text-xs text-gray-500 py-2">{page} / {contributions.totalPages}</span>
              <button disabled={page >= contributions.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost text-xs">Berikutnya →</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Reject */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-3">Tolak Pembayaran</h3>
            <label className="label">Alasan Penolakan</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Bukti transfer tidak terbaca / nominal tidak sesuai"
              className="input resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectModal(null)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleReject} disabled={!!actionLoading} className="btn-danger flex-1">
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal WA Link */}
      {waLink && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Kirim Notifikasi ke Warga</h3>
            <p className="text-sm text-gray-600 mb-4">Klik tombol di bawah untuk membuka WhatsApp dan kirim notifikasi ke warga.</p>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="btn-success w-full mb-2 block"
              onClick={() => setWaLink(null)}
            >
              Buka WhatsApp
            </a>
            <button onClick={() => setWaLink(null)} className="btn-ghost w-full text-sm">
              Lewati
            </button>
          </div>
        </div>
      )}

      {/* Modal Bukti */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Bukti Transfer</h3>
              <button onClick={() => setProofModal(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="p-4">
              {proofModal.includes('.pdf') ? (
                <a href={proofModal} target="_blank" rel="noreferrer" className="btn-primary w-full block text-center">
                  Buka PDF
                </a>
              ) : (
                <img src={proofModal} alt="Bukti" className="w-full rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
