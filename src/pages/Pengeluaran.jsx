import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatRupiah, formatDateShort, CATEGORY_LABELS } from '../utils/format.js';

const CATEGORY_COLORS = {
  OPERASIONAL: 'bg-blue-100 text-blue-700',
  KEGIATAN:    'bg-purple-100 text-purple-700',
  PERALATAN:   'bg-orange-100 text-orange-700',
  LAIN_LAIN:   'bg-gray-100 text-gray-600',
};

export default function Pengeluaran() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/public/expenses?page=${page}`);
      setExpenses(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <main className="px-4 pt-6 pb-8 max-w-md mx-auto space-y-3">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-base">Riwayat Pengeluaran</h1>
            <p className="text-xs text-gray-400">{total} transaksi</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-12">Memuat...</p>
          ) : expenses.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">Belum ada pengeluaran</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {expenses.map((e) => (
                <div key={e.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{e.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{formatDateShort(e.date)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[e.category]}`}>
                        {CATEGORY_LABELS[e.category]}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-500 whitespace-nowrap">
                    -{formatRupiah(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              ←
            </button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
