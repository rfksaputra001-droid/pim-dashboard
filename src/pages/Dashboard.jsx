import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatRupiah } from '../utils/format.js';

const rankBadge = (rank) => {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, lb] = await Promise.all([
        api.get('/public/dashboard'),
        api.get('/public/leaderboard'),
      ]);
      setSummary(s);
      setLeaderboard(lb.data || []);
      setFetchError(false);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const timer = setInterval(fetchAll, 60_000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center">
        <div className="w-full max-w-sm bg-blue-700 min-h-screen flex items-center justify-center mx-auto">
          <p className="text-blue-200 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-200 flex justify-center">
        <div className="w-full max-w-sm bg-gray-50 min-h-screen flex items-center justify-center mx-auto">
          <div className="text-center px-6">
            <p className="text-gray-600 font-medium">Gagal memuat data</p>
            <p className="text-gray-400 text-sm mt-1">Periksa koneksi internet Anda</p>
            <button onClick={fetchAll} className="mt-4 text-sm text-blue-600 hover:underline">
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-sm bg-gray-50 min-h-screen flex flex-col shadow-xl">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-600 px-5 pt-12 pb-8 text-white text-center">
          <p className="text-xs text-blue-200 mb-1">Karang Taruna Pengeteh Keker · RT 22/06</p>
          <p className="text-sm text-blue-200 mb-2">Total Dana Terkumpul</p>
          <p className="text-4xl font-extrabold tracking-tight">
            {formatRupiah(summary?.totalIncome || 0)}
          </p>
          <p className="text-xs text-blue-300 mt-2">
            dari {leaderboard.length} donatur · diperbarui otomatis
          </p>
        </div>

        <main className="flex-1 px-4 py-5 space-y-4">
          {/* Leaderboard */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="text-base">🏆</span>
              <span className="font-semibold text-gray-800 text-sm">Papan Donatur</span>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                All-time
              </span>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {leaderboard.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Belum ada donatur</p>
              ) : leaderboard.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <span className="min-w-[28px] flex justify-center">
                    {rankBadge(item.rank)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm font-bold text-green-700">{formatRupiah(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            <Link
              to="/setor"
              className="block w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-center font-bold text-base py-4 rounded-2xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
            >
              💝 Kirim Dukungan
            </Link>
            <p className="text-center text-xs text-gray-400 mt-2">
              Tanpa daftar akun · proses cepat
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
