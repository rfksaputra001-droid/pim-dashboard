import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { api } from '../utils/api.js';
import { formatRupiah, formatDateShort, STATUS_LABELS, STATUS_COLORS } from '../utils/format.js';
import { Icon } from '@iconify/react';

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
    <AdminLayout>
      <main className="px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Icon icon="solar:wallet-money-bold" className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manajemen Donasi</h1>
              <p className="text-xs text-gray-400">{contributions.total} total transaksi</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Icon icon="solar:download-minimalistic-bold" className="text-base" />
            Export CSV
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
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
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
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <Icon icon="solar:spinner-bold" className="text-2xl animate-spin text-gray-300 mx-auto" />
                    </td>
                  </tr>
                ) : contributions.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      <Icon icon="solar:inbox-bold" className="text-3xl mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Tidak ada data</p>
                    </td>
                  </tr>
                ) : contributions.data.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDateShort(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.phone}</td>
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
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Icon icon="solar:eye-bold" className="text-sm" />
                        Lihat
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'PENDING' && (
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleVerify(c.id)}
                            disabled={actionLoading === c.id + '-verify'}
                            title="Verifikasi"
                            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            <Icon icon="solar:check-circle-bold" className="text-lg" />
                          </button>
                          <button
                            onClick={() => { setRejectModal(c.id); setRejectReason(''); }}
                            title="Tolak"
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Icon icon="solar:close-circle-bold" className="text-lg" />
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
            <div className="p-4 flex justify-center items-center gap-3 border-t border-gray-50">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:arrow-left-linear" />
              </button>
              <span className="text-xs text-gray-500">{page} / {contributions.totalPages}</span>
              <button
                disabled={page >= contributions.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:arrow-right-linear" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Reject */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <Icon icon="solar:close-circle-bold" className="text-red-500 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900">Tolak Pembayaran</h3>
            </div>
            <label className="label">Alasan Penolakan</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Contoh: bukti transfer tidak terbaca / nominal tidak sesuai"
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
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:chat-round-call-bold" className="text-green-500 text-2xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Kirim Notifikasi ke Warga</h3>
            <p className="text-sm text-gray-500 mb-5">Klik tombol di bawah untuk membuka WhatsApp dan kirim notifikasi ke warga.</p>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="btn-success w-full mb-2 block"
              onClick={() => setWaLink(null)}
            >
              Buka WhatsApp
            </a>
            <button onClick={() => setWaLink(null)} className="btn-ghost w-full text-sm">Lewati</button>
          </div>
        </div>
      )}

      {/* Modal Bukti */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setProofModal(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Icon icon="solar:document-bold" className="text-gray-400 text-lg" />
                <h3 className="font-semibold text-gray-900">Bukti Transfer</h3>
              </div>
              <button
                onClick={() => setProofModal(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <Icon icon="solar:close-linear" className="text-lg" />
              </button>
            </div>
            <div className="p-4">
              {proofModal.includes('.pdf') ? (
                <a href={proofModal} target="_blank" rel="noreferrer" className="btn-primary w-full block text-center">
                  Buka PDF
                </a>
              ) : (
                <img src={proofModal} alt="Bukti" className="w-full rounded-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
