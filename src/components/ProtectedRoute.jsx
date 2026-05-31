import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Memuat...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  if (role && user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl mb-3">🚫</p>
          <p className="font-semibold text-gray-800">Akses Ditolak</p>
          <p className="text-sm text-gray-500 mt-1">Halaman ini hanya untuk Super Admin.</p>
        </div>
      </div>
    );
  }

  return children;
}
