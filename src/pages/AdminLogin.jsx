import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon } from '@iconify/react';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-500 shadow-xl shadow-indigo-200/60 flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:shield-keyhole-bold" className="text-white text-3xl" />
          </div>
          <h1 className="text-xl font-black text-gray-900">Panel Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Karang Taruna RT 22/06</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <div className="relative">
              <Icon icon="solar:user-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="Username"
                autoComplete="username"
                className="input pl-9"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Icon icon="solar:lock-keyhole-linear" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input pl-9 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="text-lg" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <Icon icon="solar:danger-triangle-bold" className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 rounded-2xl shadow-md shadow-indigo-200/60 active:scale-95 transition-transform disabled:opacity-50"
          >
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
