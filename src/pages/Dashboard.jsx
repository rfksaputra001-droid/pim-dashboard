import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { formatRupiah } from '../utils/format.js';

const rankBadge = (rank) => {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-400 w-7 text-center">#{rank}</span>;
};

const rowClass = (rank) => {
  if (rank === 1) return 'bg-amber-50 border-amber-100';
  if (rank === 2) return 'bg-slate-50 border-slate-100';
  if (rank === 3) return 'bg-orange-50 border-orange-100';
  return 'bg-white border-gray-50';
};

const amountClass = (rank) => {
  if (rank <= 3) return 'text-sm font-bold text-amber-700';
  return 'text-sm font-bold text-green-700';
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
      <div className="min-h-screen bg-blue-700 flex items-center justify-center">
        <p className="text-blue-200 text-sm">Memuat...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-gray-600 font-medium">Gagal memuat data</p>
          <p className="text-gray-400 text-sm mt-1">Periksa koneksi internet Anda</p>
          <button onClick={fetchAll} className="mt-4 text-sm text-blue-600 hover:underline">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <main className="px-4 pt-6 pb-8 space-y-3 max-w-md mx-auto">

        {/* Org label */}
        <p className="text-center text-xs text-gray-400 font-medium tracking-widest uppercase pb-1">
          Karang Taruna Pengeteh Keker · RT 22/06
        </p>

        {/* Hero card */}
        <div className="relative bg-gradient-to-br from-blue-700 to-indigo-700 rounded-3xl shadow-xl px-6 py-6 text-white text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute top-4 left-4 w-10 h-10 bg-white/5 rounded-full" />

          <div className="relative">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3">
              Total Dana Terkumpul
            </p>
            <p className="text-4xl font-black tracking-tight leading-none">
              {formatRupiah(summary?.totalIncome || 0)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-blue-100 font-medium">Live</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <span className="text-xs text-blue-100 font-medium">👥 {leaderboard.length} donatur</span>
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <span className="font-bold text-gray-800 text-sm">Papan Donatur</span>
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold">
              All-time
            </span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Belum ada donatur</p>
            ) : leaderboard.map((item) => (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 ${rowClass(item.rank)}`}
              >
                <span className="min-w-[32px] flex justify-center">
                  {rankBadge(item.rank)}
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-900">{item.name}</span>
                <span className={amountClass(item.rank)}>{formatRupiah(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-1">
          <Link
            to="/setor"
            className="block w-full bg-gradient-to-r from-emerald-500 to-green-400 text-white text-center font-bold text-base py-4 rounded-3xl shadow-lg shadow-green-200/60 active:scale-95 transition-transform"
          >
            💝 Kirim Dukungan
          </Link>
          <p className="text-center text-xs text-gray-400 mt-2">
            Tanpa daftar akun · proses cepat
          </p>
        </div>

      </main>
    </div>
  );
}
