import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FormIuran from './pages/FormIuran.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminIuran from './pages/AdminIuran.jsx';
import AdminPengeluaran from './pages/AdminPengeluaran.jsx';
import AdminKelolaPengguna from './pages/AdminKelolaPengguna.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
