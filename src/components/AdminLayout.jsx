import { useState } from 'react';
import { Icon } from '@iconify/react';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-60 min-w-0 flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600"
          >
            <Icon icon="solar:hamburger-menu-bold" className="text-lg" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
              <Icon icon="solar:buildings-bold" className="text-white text-sm" />
            </div>
            <p className="text-sm font-bold text-gray-900">Panel Admin</p>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
