import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon } from '@iconify/react';

const NAV_LINKS = [
  { to: '/admin/iuran', label: 'Donasi', icon: 'solar:wallet-money-bold' },
  { to: '/admin/pengeluaran', label: 'Pengeluaran', icon: 'solar:bill-list-bold' },
];

const ROLE_BADGE = {
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-purple-100 text-purple-700' },
  ADMIN: { label: 'Admin', cls: 'bg-blue-100 text-blue-700' },
};

export default function AdminSidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.ADMIN;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const links = [
    ...NAV_LINKS,
    ...(user?.role === 'SUPER_ADMIN'
      ? [{ to: '/admin/pengguna', label: 'Kelola Admin', icon: 'solar:users-group-two-rounded-bold' }]
      : []),
  ];

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col z-30
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm shadow-indigo-200 flex-shrink-0">
              <Icon icon="solar:buildings-bold" className="text-white text-lg" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Panel Admin</p>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">Karang Taruna RT 22/06</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <Icon icon="solar:close-square-bold" className="text-xl" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  icon={icon}
                  className={`text-xl flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                <span>{label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
          >
            <Icon icon="solar:arrow-left-linear" className="text-xl flex-shrink-0" />
            <span>Lihat Publik</span>
          </Link>

          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="solar:user-bold" className="text-indigo-600 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.username}</p>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Icon icon="solar:logout-3-bold" className="text-xl flex-shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
