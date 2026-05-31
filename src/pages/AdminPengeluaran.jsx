import { useState, useEffect, useCallback } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../utils/api.js';
import { formatRupiah, formatDateShort, CATEGORY_LABELS } from '../utils/format.js';
import { compressImage } from '../utils/imageCompressor.js';

const CATEGORIES = ['OPERASIONAL', 'KEGIATAN', 'PERALATAN', 'LAIN_LAIN'];

const EMPTY_FORM = {
  tanggal: new Date().toISOString().split('T')[0],
  keterangan: '',
  kategori: 'OPERASIONAL',
  nominal: '',
};

export default function AdminPengeluaran() {
  const [expenses, setExpenses] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [receiptModal, setReceiptModal] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/expenses?page=${page}`);
      setExpenses(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleFile = async (e) => {
    const raw = e.target.files[0];
    if (!raw) return;
    if (raw.size > 10 * 1024 * 1024) { setError('Ukuran file maksimal 10 MB'); return; }

    setCompressing(true);
    setError('');
    try {
      const compressed = await compressImage(raw);
      setFile(compressed);
      setFilePreview(compressed.type === 'application/pdf' ? 'pdf' : URL.createObjectURL(compressed));
    } catch {
      setError('Gagal memproses file');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) return setError('Foto nota wajib diupload');

    const amount = parseInt(form.nominal.replace(/\D/g, ''));
    if (!amount || amount < 1) return setError('Nominal tidak valid');
    if (!form.keterangan.trim()) return setError('Keterangan wajib diisi');

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('tanggal', form.tanggal);
      formData.append('keterangan', form.keterangan.trim());
      formData.append('kategori', form.kategori);
      formData.append('nominal', String(amount));
      formData.append('fotoNota', file);

      await api.postForm('/admin/expenses', formData);
      setSuccess('Pengeluaran berhasil disimpan!');
      setForm(EMPTY_FORM);
      setFile(null);
      setFilePreview(null);
      fetchExpenses();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatNominal = (val) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('id-ID') : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-lg font-bold text-gray-900">Manajemen Pengeluaran</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Tambah */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Tambah Pengeluaran</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Keterangan</label>
                <input
                  type="text"
                  value={form.keterangan}
                  onChange={(e) => setForm((f) => ({ ...f, keterangan: e.target.value }))}
                  placeholder="Contoh: Beli cat tembok 5 kg"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Nominal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                  <input
                    type="text"
                    value={formatNominal(form.nominal)}
                    onChange={(e) => setForm((f) => ({ ...f, nominal: e.target.value.replace(/\D/g, '') }))}
                    placeholder="150.000"
                    className="input pl-9"
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Foto Nota / Struk</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                  {compressing ? (
                    <p className="text-sm text-gray-500">Memproses...</p>
                  ) : filePreview ? (
                    filePreview === 'pdf' ? (
                      <p className="text-sm text-gray-700">📄 PDF dipilih ✓</p>
                    ) : (
                      <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                    )
                  ) : (
                    <>
                      <p className="text-xl mb-1">🧾</p>
                      <p className="text-sm text-gray-600">Klik untuk pilih foto nota</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Maks 10 MB</p>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">{success}</div>
              )}

              <button type="submit" disabled={submitting || compressing} className="btn-primary w-full py-2.5">
                {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Perhatian</p>
              <p>Pengeluaran yang sudah disimpan <strong>tidak dapat dihapus</strong>. Jika ada kesalahan, buat entri koreksi baru.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">📋 Panduan Kategori</p>
              <ul className="space-y-1 text-xs">
                <li><strong>Operasional</strong> — listrik, fotokopi, ATK</li>
                <li><strong>Kegiatan</strong> — acara, konsumsi, dekorasi</li>
                <li><strong>Peralatan</strong> — beli/sewa peralatan</li>
                <li><strong>Lain-lain</strong> — diluar kategori di atas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabel Pengeluaran */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Riwayat Pengeluaran</h2>
            <p className="text-xs text-gray-400">{expenses.total} transaksi</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Keterangan</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-center">Dicatat Oleh</th>
                  <th className="px-4 py-3 text-center">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>
                ) : expenses.data.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada pengeluaran</td></tr>
                ) : expenses.data.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateShort(e.date)}</td>
                    <td className="px-4 py-3 max-w-xs">{e.description}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[e.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-700 whitespace-nowrap">
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{e.createdBy}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setReceiptModal(e.receiptImageUrl)} className="text-xs text-blue-600 hover:underline">
                        Lihat Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expenses.totalPages > 1 && (
            <div className="p-4 flex justify-center gap-2 border-t border-gray-50">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost text-xs">← Sebelumnya</button>
              <span className="text-xs text-gray-500 py-2">{page} / {expenses.totalPages}</span>
              <button disabled={page >= expenses.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost text-xs">Berikutnya →</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nota */}
      {receiptModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setReceiptModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Nota Pengeluaran</h3>
              <button onClick={() => setReceiptModal(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="p-4">
              {receiptModal.endsWith('.pdf') ? (
                <a href={receiptModal} target="_blank" rel="noreferrer" className="btn-primary w-full block text-center">Buka PDF</a>
              ) : (
                <img src={receiptModal} alt="Nota" className="w-full rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
