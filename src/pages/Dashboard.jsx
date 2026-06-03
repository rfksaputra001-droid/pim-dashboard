import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { api } from '../utils/api.js';
import { formatRupiah, formatDate, formatDateShort, CATEGORY_LABELS } from '../utils/format.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const buildYearOptions = () => {
  const now = new Date().getFullYear();
  const years = [];
  for (let y = now; y >= 2023; y--) years.push(y);
  return years;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [contributions, setContributions] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [expenses, setExpenses] = useState({ data: [], total: 0, page: 1, totalPages: 1 });
  const [contribPage, setContribPage] = useState(1);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [receiptModal, setReceiptModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(async () => {
    try {
      const contribParams = new URLSearchParams({ page: contribPage });
      if (filterYear) contribParams.set('year', filterYear);
      if (filterMonth) contribParams.set('month', filterMonth);

      const [s, c, e] = await Promise.all([
        api.get('/public/dashboard'),
        api.get(`/public/contributions?${contribParams}`),
        api.get(`/public/expenses?page=${expensePage}`),
      ]);
      setSummary(s);
      setContributions(c);
      setExpenses(e);
      setFetchError(false);
      setLastRefresh(new Date());
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [contribPage, filterYear, filterMonth, expensePage]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const timer = setInterval(fetchAll, 60_000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  const openReceipt = async (id) => {
    try {
      const { url } = await api.get(`/public/expenses/${id}/receipt`);
      setReceiptModal(url);
    } catch {
      alert('Gagal memuat nota');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Memuat data...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Gagal memuat data</p>
          <p className="text-gray-400 text-sm mt-1">Periksa koneksi internet Anda</p>
          <button
            onClick={fetchAll}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Transparansi Kas</h1>
            <p className="text-sm text-gray-500">Karang Taruna Pengeteh Keker — RT 22/06</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              Diperbarui {formatDateShort(lastRefresh)} · auto-refresh 60 detik
            </p>
            <button onClick={fetchAll} className="text-xs text-blue-600 hover:underline mt-0.5">
              Refresh sekarang
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon="💰" label="Total Dana Masuk" value={formatRupiah(summary?.totalIncome || 0)} color="green" />
          <StatCard icon="📤" label="Total Pengeluaran" value={formatRupiah(summary?.totalExpenses || 0)} color="orange" />
          <StatCard icon="🏦" label="Saldo Kas" value={formatRupiah(summary?.balance || 0)} color="blue" />
        </div>

        {/* Chart */}
        {summary?.chartData?.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Pemasukan vs Pengeluaran (6 Bulan)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => v === 0 ? '0' : `${(v / 1_000_000).toFixed(0)}jt`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatRupiah(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CTA Setor */}
        <div className="bg-blue-600 rounded-2xl p-5 flex items-center justify-between text-white">
          <div>
            <p className="font-semibold">Belum setor iuran bulan ini?</p>
            <p className="text-sm text-blue-100">Proses cepat, tanpa perlu daftar akun</p>
          </div>
          <Link to="/setor" className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 flex-shrink-0">
            Setor Sekarang
          </Link>
        </div>

        {/* Tabel Pemasukan */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-gray-800">Pemasukan Warga</h2>
                <p className="text-xs text-gray-400 mt-0.5">{contributions.total} transaksi terverifikasi</p>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <select
                  value={filterMonth}
                  onChange={(e) => { setFilterMonth(e.target.value); setContribPage(1); }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">Semua Bulan</option>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={filterYear}
                  onChange={(e) => { setFilterYear(e.target.value); setContribPage(1); }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:border-blue-400"
                >
                  <option value="">Semua Tahun</option>
                  {buildYearOptions().map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                {(filterYear || filterMonth) && (
                  <button
                    onClick={() => { setFilterYear(''); setFilterMonth(''); setContribPage(1); }}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Nama</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contributions.data.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                ) : contributions.data.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateShort(c.verifiedAt || c.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatRupiah(c.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contributions.totalPages > 1 && (
            <div className="p-4 flex justify-center gap-2">
              <button
                disabled={contribPage <= 1}
                onClick={() => setContribPage((p) => p - 1)}
                className="btn-ghost text-xs"
              >← Sebelumnya</button>
              <span className="text-xs text-gray-500 py-2">{contribPage} / {contributions.totalPages}</span>
              <button
                disabled={contribPage >= contributions.totalPages}
                onClick={() => setContribPage((p) => p + 1)}
                className="btn-ghost text-xs"
              >Berikutnya →</button>
            </div>
          )}
        </div>

        {/* Tabel Pengeluaran */}
        <div className="card">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Pengeluaran Kas</h2>
            <p className="text-xs text-gray-400 mt-0.5">{expenses.total} transaksi pengeluaran</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Keterangan</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-center">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.data.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                ) : expenses.data.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateShort(e.date)}</td>
                    <td className="px-4 py-3">{e.description}</td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[e.category] || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-700">{formatRupiah(e.amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openReceipt(e.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Lihat Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {expenses.totalPages > 1 && (
            <div className="p-4 flex justify-center gap-2">
              <button
                disabled={expensePage <= 1}
                onClick={() => setExpensePage((p) => p - 1)}
                className="btn-ghost text-xs"
              >← Sebelumnya</button>
              <span className="text-xs text-gray-500 py-2">{expensePage} / {expenses.totalPages}</span>
              <button
                disabled={expensePage >= expenses.totalPages}
                onClick={() => setExpensePage((p) => p + 1)}
                className="btn-ghost text-xs"
              >Berikutnya →</button>
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-gray-400 pb-4">
          Karang Taruna Pengeteh Keker · RT 22/06 · Data diperbarui real-time
        </footer>
      </main>

      {/* Modal Nota */}
      {receiptModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setReceiptModal(null)}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Nota Pengeluaran</h3>
              <button onClick={() => setReceiptModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-4">
              {receiptModal.endsWith('.pdf') ? (
                <a href={receiptModal} target="_blank" rel="noreferrer" className="btn-primary w-full">
                  Buka PDF
                </a>
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
