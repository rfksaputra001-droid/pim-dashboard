import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-60 min-w-0">
        {children}
      </div>
    </div>
  );
}
