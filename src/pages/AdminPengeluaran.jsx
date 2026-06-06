import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { api } from '../utils/api.js';
import { formatRupiah, formatDateShort, CATEGORY_LABELS } from '../utils/format.js';
import { compressImage } from '../utils/imageCompressor.js';
import { Icon } from '@iconify/react';

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
    <AdminLayout>
      <main className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
            <Icon icon="solar:bill-list-bold" className="text-orange-500 text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Manajemen Pengeluaran</h1>
            <p className="text-xs text-gray-400">{expenses.total} transaksi tercatat</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Icon icon="solar:add-circle-bold" className="text-indigo-500 text-lg" />
              Tambah Pengeluaran
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <Icon icon="solar:calendar-bold" className="inline mr-1 text-gray-400 text-sm" />
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <Icon icon="solar:document-text-bold" className="inline mr-1 text-gray-400 text-sm" />
                  Keterangan
                </label>
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
                <label className="label">
                  <Icon icon="solar:tag-bold" className="inline mr-1 text-gray-400 text-sm" />
                  Kategori
                </label>
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
                <label className="label">
                  <Icon icon="solar:tag-price-bold" className="inline mr-1 text-gray-400 text-sm" />
                  Nominal
                </label>
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
                <label className="label">
                  <Icon icon="solar:gallery-add-bold" className="inline mr-1 text-gray-400 text-sm" />
                  Foto Nota / Struk
                </label>
                <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors text-center">
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                  {compressing ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Icon icon="solar:spinner-bold" className="text-xl animate-spin" />
                      Memproses...
                    </div>
                  ) : filePreview ? (
                    filePreview === 'pdf' ? (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                        <Icon icon="solar:document-bold" className="text-2xl text-indigo-500" />
                        PDF dipilih ✓
                      </div>
                    ) : (
                      <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded-xl object-contain" />
                    )
                  ) : (
                    <>
                      <Icon icon="solar:camera-add-bold" className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Klik untuk pilih foto nota</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Maks 10 MB</p>
                    </>
                  )}
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <Icon icon="solar:danger-triangle-bold" className="text-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                  <Icon icon="solar:check-circle-bold" className="text-green-500 flex-shrink-0" />
                  {success}
                </div>
              )}

              <button type="submit" disabled={submitting || compressing} className="btn-primary w-full py-2.5">
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Icon icon="solar:spinner-bold" className="animate-spin" />Menyimpan...</span>
                  : 'Simpan Pengeluaran'
                }
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:danger-triangle-bold" className="text-amber-500 text-lg" />
                <p className="font-semibold text-sm text-amber-800">Perhatian</p>
              </div>
              <p className="text-sm text-amber-700">Pengeluaran yang sudah disimpan <strong>tidak dapat dihapus</strong>. Jika ada kesalahan, buat entri koreksi baru.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="solar:info-circle-bold" className="text-blue-500 text-lg" />
                <p className="font-semibold text-sm text-blue-800">Panduan Kategori</p>
              </div>
              <ul className="space-y-1 text-xs text-blue-700">
                <li><strong>Operasional</strong> — listrik, fotokopi, ATK</li>
                <li><strong>Kegiatan</strong> — acara, konsumsi, dekorasi</li>
                <li><strong>Peralatan</strong> — beli/sewa peralatan</li>
                <li><strong>Lain-lain</strong> — diluar kategori di atas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabel */}
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
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <Icon icon="solar:spinner-bold" className="text-2xl animate-spin text-gray-300 mx-auto" />
                    </td>
                  </tr>
                ) : expenses.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      <Icon icon="solar:inbox-bold" className="text-3xl mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Belum ada pengeluaran</p>
                    </td>
                  </tr>
                ) : expenses.data.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateShort(e.date)}</td>
                    <td className="px-4 py-3 max-w-xs">{e.description}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {CATEGORY_LABELS[e.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600 whitespace-nowrap">
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{e.createdBy}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setReceiptModal(e.receiptImageUrl)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Icon icon="solar:eye-bold" className="text-sm" />
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {expenses.totalPages > 1 && (
            <div className="p-4 flex justify-center items-center gap-3 border-t border-gray-50">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:arrow-left-linear" />
              </button>
              <span className="text-xs text-gray-500">{page} / {expenses.totalPages}</span>
              <button
                disabled={page >= expenses.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:arrow-right-linear" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nota */}
      {receiptModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setReceiptModal(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Icon icon="solar:receipt-bold" className="text-gray-400 text-lg" />
                <h3 className="font-semibold text-gray-900">Nota Pengeluaran</h3>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <Icon icon="solar:close-linear" className="text-lg" />
              </button>
            </div>
            <div className="p-4">
              {receiptModal.endsWith('.pdf') ? (
                <a href={receiptModal} target="_blank" rel="noreferrer" className="btn-primary w-full block text-center">Buka PDF</a>
              ) : (
                <img src={receiptModal} alt="Nota" className="w-full rounded-2xl" />
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
