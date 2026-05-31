import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { api } from '../utils/api.js';
import { compressImage } from '../utils/imageCompressor.js';

export default function FormIuran() {
  const [form, setForm] = useState({
    nama: '',
    noTelepon: '',
    nominal: '',
    catatan: '',
    isAnonymous: false,
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [compressing, setCompressing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = async (e) => {
    const raw = e.target.files[0];
    if (!raw) return;

    if (raw.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5 MB');
      return;
    }

    setCompressing(true);
    setError('');
    try {
      const compressed = await compressImage(raw);
      setFile(compressed);
      if (compressed.type !== 'application/pdf') {
        setFilePreview(URL.createObjectURL(compressed));
      } else {
        setFilePreview('pdf');
      }
    } catch {
      setError('Gagal memproses file. Coba file lain.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) return setError('Bukti transfer wajib diupload');

    const nominal = parseInt(form.nominal.replace(/\D/g, ''));
    if (!nominal || nominal < 1000) return setError('Nominal minimal Rp 1.000');
    if (!form.isAnonymous && !form.nama.trim()) return setError('Nama wajib diisi');
    if (!form.noTelepon.trim()) return setError('Nomor telepon wajib diisi');

    setStatus('loading');
    try {
      const formData = new FormData();
      formData.append('nama', form.nama.trim());
      formData.append('noTelepon', form.noTelepon.trim());
      formData.append('nominal', String(nominal));
      formData.append('catatan', form.catatan.trim());
      formData.append('isAnonymous', String(form.isAnonymous));
      formData.append('buktiTransfer', file);

      await api.postForm('/public/contributions', formData);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'Gagal mengirim. Coba lagi.');
      setStatus('idle');
    }
  };

  const formatNominalDisplay = (val) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('id-ID') : '';
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Terima Kasih!</h2>
          <p className="text-gray-600 mb-6">
            Pembayaran iuran Anda sudah diterima dan sedang diverifikasi oleh admin.
            Anda akan mendapat konfirmasi melalui WhatsApp.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-ghost">Lihat Dashboard</Link>
            <button onClick={() => { setStatus('idle'); setFile(null); setFilePreview(null); setForm({ nama: '', noTelepon: '', nominal: '', catatan: '', isAnonymous: false }); }} className="btn-primary">
              Setor Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Setor Iuran</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tidak perlu daftar akun · Data langsung masuk ke kas RT</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          {/* Nama */}
          <div>
            <label className="label">Nama Pembayar</label>
            <input
              type="text"
              name="nama"
              value={form.isAnonymous ? '' : form.nama}
              onChange={handleChange}
              disabled={form.isAnonymous}
              placeholder={form.isAnonymous ? 'Hamba Allah' : 'Nama lengkap Anda'}
              className="input disabled:bg-gray-50 disabled:text-gray-400"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Anonim / Hamba Allah</span>
            </label>
          </div>

          {/* No Telepon */}
          <div>
            <label className="label">Nomor WhatsApp</label>
            <input
              type="tel"
              name="noTelepon"
              value={form.noTelepon}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">Untuk konfirmasi dari admin. Tidak ditampilkan ke publik.</p>
          </div>

          {/* Nominal */}
          <div>
            <label className="label">Nominal Iuran</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
              <input
                type="text"
                name="nominal"
                value={formatNominalDisplay(form.nominal)}
                onChange={(e) => setForm((f) => ({ ...f, nominal: e.target.value.replace(/\D/g, '') }))}
                placeholder="50.000"
                className="input pl-9"
                inputMode="numeric"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Minimal Rp 1.000</p>
          </div>

          {/* Bukti Transfer */}
          <div>
            <label className="label">Bukti Transfer</label>
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
              <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
              {compressing ? (
                <p className="text-sm text-gray-500">Mengompresi gambar...</p>
              ) : filePreview ? (
                filePreview === 'pdf' ? (
                  <p className="text-sm text-gray-700">📄 File PDF dipilih ✓</p>
                ) : (
                  <img src={filePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                )
              ) : (
                <>
                  <p className="text-2xl mb-1">📎</p>
                  <p className="text-sm text-gray-600">Klik untuk pilih foto / PDF</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Maks 5 MB</p>
                </>
              )}
            </label>
            {file && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Catatan */}
          <div>
            <label className="label">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <textarea
              name="catatan"
              value={form.catatan}
              onChange={handleChange}
              placeholder="Contoh: Iuran bulan Mei 2026"
              rows={2}
              className="input resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || compressing}
            className="btn-primary w-full py-3 text-base"
          >
            {status === 'loading' ? 'Mengirim...' : 'Kirim Iuran'}
          </button>
        </form>
      </main>
    </div>
  );
}
