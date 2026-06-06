import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLE_BADGE = {
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-purple-100 text-purple-700' },
  ADMIN: { label: 'Admin', cls: 'bg-blue-100 text-blue-700' },
};

export default function AdminNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const linkClass = (path) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      pathname === path ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
    }`;

  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.ADMIN;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link to="/admin/iuran" className={linkClass('/admin/iuran')}>Donasi</Link>
          <Link to="/admin/pengeluaran" className={linkClass('/admin/pengeluaran')}>Pengeluaran</Link>
          {user?.role === 'SUPER_ADMIN' && (
            <Link to="/admin/pengguna" className={linkClass('/admin/pengguna')}>
              Kelola Admin
            </Link>
          )}
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 ml-1">
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
          <span className="text-xs text-gray-500">{user?.username}</span>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}
