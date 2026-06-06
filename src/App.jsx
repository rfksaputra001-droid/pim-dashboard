import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const FormIuran = lazy(() => import('./pages/FormIuran.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminIuran = lazy(() => import('./pages/AdminIuran.jsx'));
const AdminPengeluaran = lazy(() => import('./pages/AdminPengeluaran.jsx'));
const AdminKelolaPengguna = lazy(() => import('./pages/AdminKelolaPengguna.jsx'));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setor" element={<FormIuran />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/iuran"
              element={<ProtectedRoute><AdminIuran /></ProtectedRoute>}
            />
            <Route
              path="/admin/pengeluaran"
              element={<ProtectedRoute><AdminPengeluaran /></ProtectedRoute>}
            />
            <Route
              path="/admin/pengguna"
              element={<ProtectedRoute role="SUPER_ADMIN"><AdminKelolaPengguna /></ProtectedRoute>}
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
