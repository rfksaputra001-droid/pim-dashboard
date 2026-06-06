import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { api } from '../utils/api.js';
import { formatDate } from '../utils/format.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Icon } from '@iconify/react';

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
  const [showResetPassword, setShowResetPassword] = useState(false);

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
    <AdminLayout>
      <main className="px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Icon icon="solar:users-group-two-rounded-bold" className="text-purple-600 text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Kelola Pengguna Admin</h1>
              <p className="text-xs text-gray-400">{users.length} akun terdaftar</p>
            </div>
          </div>
          <button
            onClick={() => { setAddModal(true); setAddForm(EMPTY_FORM); setAddError(''); setShowPassword(false); }}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Icon icon="solar:user-plus-bold" className="text-base" />
            Tambah Admin
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            <Icon icon="solar:check-circle-bold" className="text-green-500 flex-shrink-0" />
            {successMsg}
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
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <Icon icon="solar:spinner-bold" className="text-2xl animate-spin text-gray-300 mx-auto" />
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50/80 ${u.username === currentUser?.username ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:user-bold" className="text-gray-400 text-sm" />
                      </div>
                      {u.username}
                      {u.username === currentUser?.username && (
                        <span className="text-xs text-gray-400 font-normal">(Anda)</span>
                      )}
                    </div>
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
                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => { setRoleModal(u); setSelectedRole(u.role); }}
                          title="Ubah Role"
                          className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors"
                        >
                          <Icon icon="solar:shield-user-bold" className="text-base" />
                        </button>
                        <button
                          onClick={() => { setResetModal(u); setNewPassword(''); setShowResetPassword(false); }}
                          title="Reset Password"
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors"
                        >
                          <Icon icon="solar:key-bold" className="text-base" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Hapus"
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="text-base" />
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

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:danger-triangle-bold" className="text-amber-500 text-lg" />
            <p className="font-semibold text-sm text-amber-800">Panduan</p>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-amber-700">
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
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Icon icon="solar:user-plus-bold" className="text-indigo-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900">Tambah Admin Baru</h3>
            </div>
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
                    <Icon icon={showPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="text-lg" />
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
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-2 text-xs text-red-700">
                  <Icon icon="solar:danger-triangle-bold" className="text-red-500 flex-shrink-0" />
                  {addError}
                </div>
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
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Icon icon="solar:shield-user-bold" className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Ubah Role</h3>
                <p className="text-xs text-gray-500">Akun: <strong>{roleModal.username}</strong></p>
              </div>
            </div>
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
          <div className="bg-white rounded-3xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Icon icon="solar:key-bold" className="text-amber-600 text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">Akun: <strong>{resetModal.username}</strong></p>
              </div>
            </div>
            <label className="label">Password Baru</label>
            <div className="relative mb-4">
              <input
                type={showResetPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowResetPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon icon={showResetPassword ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="text-lg" />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setResetModal(null)} className="btn-ghost flex-1">Batal</button>
              <button onClick={handleReset} disabled={resetLoading} className="btn-primary flex-1">
                {resetLoading ? 'Menyimpan...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:trash-bin-trash-bold" className="text-red-500 text-2xl" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hapus Akun</h3>
            <p className="text-sm text-gray-500 mb-5">
              Yakin ingin menghapus akun <strong>{deleteTarget.username}</strong>? Tindakan ini tidak dapat dibatalkan.
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
    </AdminLayout>
  );
}
