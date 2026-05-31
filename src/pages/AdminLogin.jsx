import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin/iuran', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin/iuran');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏦</div>
          <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Kas Karang Taruna Pengeteh Keker</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              autoComplete="username"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              className="input"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Maksimal 5 percobaan per 15 menit
        </p>
      </div>
    </div>
  );
}
