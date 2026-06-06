import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/format.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const ROLE_BADGE = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
};

const ROLE_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
};

const EMPTY_FORM = { username: '', password: '', role: 'ADMIN' };

export default function AdminKelolaPengguna() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [roleModal, setRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await api.post('/admin/users', addForm);
      toast(`Akun "${addForm.username}" berhasil dibuat`);
      setAddModal(false);
      setAddForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) return alert('Password minimal 8 karakter');
    setResetLoading(true);
    try {
      await api.patch(`/admin/users/${resetModal.id}/password`, { password: newPassword });
      toast(`Password ${resetModal.username} berhasil direset`);
      setResetModal(null);
      setNewPassword('');
    } catch (err) {
      alert(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      await api.patch(`/admin/users/${roleModal.id}/role`, { role: selectedRole });
      toast(`Role ${roleModal.username} berhasil diubah ke ${ROLE_LABEL[selectedRole]}`);
      setRoleModal(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const data = await api.delete(`/admin/users/${deleteTarget.id}`);
      toast(data.message);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Kelola Pengguna Admin</h1>
            <p className="text-xs text-gray-400">{users.length} akun terdaftar</p>
          </div>
          <button onClick={() => { setAddModal(true); setAddForm(EMPTY_FORM); setAddError(''); setShowPassword(false); }} className="btn-primary text-sm">
            + Tambah Admin
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            ✓ {successMsg}
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Dibuat</th>
                <th className="px-4 py-3 text-left">Login Terakhir</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50 ${u.username === currentUser?.username ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium">
                    {u.username}
                    {u.username === currentUser?.username && (
                      <span className="ml-2 text-xs text-gray-400">(Anda)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]}`}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.lastLogin ? formatDate(u.lastLogin) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {u.username !== currentUser?.username ? (
                      <div className="flex gap-1 justify-center flex-wrap">
                        <button
                          onClick={() => { setRoleModal(u); setSelectedRole(u.role); }}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Ubah Role
                        </button>
                        <button
                          onClick={() => { setResetModal(u); setNewPassword(''); }}
                          className="text-xs px-2 py-1 rounded-lg border border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-gray-300">—</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Panduan</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Super Admin</strong> dapat mengakses semua fitur termasuk halaman ini.</li>
            <li><strong>Admin</strong> hanya dapat verifikasi donasi dan input pengeluaran.</li>
            <li>Anda tidak dapat menghapus atau mengubah akun Anda sendiri di sini.</li>
            <li>Pastikan selalu ada minimal satu Super Admin aktif.</li>
          </ul>
        </div>
      </main>

      {/* Modal Tambah Admin */}
      {addModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-4">Tambah Admin Baru</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))}
                  className="input"
                  placeholder="username_baru"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={addForm.password}
                    onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    className="input pr-10"
                    placeholder="Minimal 8 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                  className="input"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              {addError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700">{addError}</div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setAddModal(false)} className="btn-ghost flex-1">Batal</button>
                <button type="submit" disabled={addLoading} className="btn-primary flex-1">
                  {addLoading ? 'Menyimpan...' : 'Buat Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Role */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-1">Ubah Role</h3>
            <p className="text-sm text-gray-500 mb-4">Akun: <strong>{roleModal.username}</strong></p>
            <label className="label">Role Baru</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input mb-4"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setRoleModal(null)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleRoleChange} className="btn-primary flex-1">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold mb-1">Reset Password</h3>
            <p className="text-sm text-gray-500 mb-4">Akun: <strong>{resetModal.username}</strong></p>
            <label className="label">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="input mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setResetModal(null)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleReset} disabled={resetLoading} className="btn-primary flex-1">
                {resetLoading ? 'Menyimpan...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <h3 className="font-semibold mb-1">Hapus Akun</h3>
            <p className="text-sm text-gray-600 mb-4">
              Yakin ingin menghapus akun <strong>{deleteTarget.username}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="btn-danger flex-1">
                {deleteLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
