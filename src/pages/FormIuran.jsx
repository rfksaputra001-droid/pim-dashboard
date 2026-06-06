import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { compressImage } from '../utils/imageCompressor.js';
import { formatRupiah } from '../utils/format.js';
import qrisImage from '../assets/QRIS.png';

const BANKS = [
  { id: 'mandiri', nama: 'Bank Mandiri', noRekening: null,          atasNama: null },
  { id: 'bca',     nama: 'BCA',          noRekening: '2860493686',  atasNama: 'Resti Ayunda Lestari' },
  { id: 'bri',     nama: 'BRI',          noRekening: null,          atasNama: null },
  { id: 'bni',     nama: 'BNI',          noRekening: null,          atasNama: null },
  { id: 'bsi',     nama: 'BSI',          noRekening: null,          atasNama: null },
];

const QUICK_AMOUNTS = [100000, 200000, 300000, 400000, 500000];
const STEP_LABELS = ['Identitas', 'Nominal', 'Pembayaran'];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center mb-2">
    {[1, 2, 3].map((step, i) => (
      <div key={step} className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          step < current
            ? 'bg-blue-600 text-white'
            : step === current
            ? 'bg-indigo-700 text-white ring-4 ring-indigo-100'
            : 'bg-gray-200 text-gray-400'
        }`}>
          {step < current ? '✓' : step}
        </div>
        {i < 2 && (
          <div className={`w-12 h-0.5 ${step < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);

export default function FormIuran() {
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('qris');
  const [selectedBank, setSelectedBank] = useState('bca');
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
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = async (e) => {
    const raw = e.target.files[0];
    if (!raw) return;
    if (raw.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5 MB'); return; }
    setCompressing(true);
    setError('');
    try {
      const compressed = await compressImage(raw);
      setFile(compressed);
      setFilePreview(compressed.type !== 'application/pdf' ? URL.createObjectURL(compressed) : 'pdf');
    } catch {
      setError('Gagal memproses file. Coba file lain.');
    } finally {
      setCompressing(false);
    }
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.isAnonymous && !form.nama.trim()) { setError('Nama wajib diisi'); return false; }
      if (!form.noTelepon.trim()) { setError('Nomor WhatsApp wajib diisi'); return false; }
    }
    if (step === 2) {
      const nominal = parseInt(form.nominal.replace(/\D/g, ''));
      if (!nominal || nominal < 1000) { setError('Nominal minimal Rp 1.000'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => s + 1); };
  const prevStep = () => { setError(''); setStep((s) => s - 1); };

  const activeBank = BANKS.find((b) => b.id === selectedBank);

  const copyRekening = () => {
    if (!activeBank?.noRekening) return;
    navigator.clipboard?.writeText(activeBank.noRekening.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setError('');
    if (!file) { setError('Bukti transfer wajib diupload'); return; }
    const nominal = parseInt(form.nominal.replace(/\D/g, ''));
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

  const nominalValue = parseInt(form.nominal.replace(/\D/g, '') || '0');

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Terima Kasih!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Dukunganmu sudah kami terima dan sedang diverifikasi oleh admin.
              Kamu akan mendapat konfirmasi melalui WhatsApp.
            </p>
            <div className="flex gap-3">
              <Link
                to="/"
                className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-700 text-center hover:bg-gray-50 transition-colors"
              >
                ← Dashboard
              </Link>
              <button
                onClick={() => {
                  setStatus('idle');
                  setStep(1);
                  setFile(null);
                  setFilePreview(null);
                  setForm({ nama: '', noTelepon: '', nominal: '', catatan: '', isAnonymous: false });
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-2xl py-3 text-sm font-bold shadow-md shadow-green-200/60"
              >
                Setor Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <main className="px-4 pt-6 pb-10 max-w-lg mx-auto">

        {/* Back + header */}
        <div className="mb-5">
          {step === 1 ? (
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mb-4 hover:text-blue-700">
              ← Kembali
            </Link>
          ) : (
            <button onClick={prevStep} className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mb-4 hover:text-blue-700">
              ← Kembali
            </button>
          )}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Karang Taruna Pengeteh Keker · RT 22/06
          </p>
          <h1 className="text-2xl font-black text-gray-900">Kirim Dukungan</h1>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />
        <p className="text-center text-xs text-gray-400 font-medium mb-5">
          Langkah {step} dari 3 · {STEP_LABELS[step - 1]}
        </p>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">

          {/* Step 1: Identitas */}
          {step === 1 && (
            <>
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
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
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
            </>
          )}

          {/* Step 2: Nominal */}
          {step === 2 && (
            <>
              <div>
                <label className="label">Nominal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                  <input
                    type="text"
                    name="nominal"
                    value={formatNominalDisplay(form.nominal)}
                    onChange={(e) => setForm((f) => ({ ...f, nominal: e.target.value.replace(/\D/g, '') }))}
                    placeholder="50.000"
                    className="input pl-9 text-lg font-bold"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Minimal Rp 1.000</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Pilih cepat:</p>
                <div className="grid grid-cols-5 gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, nominal: String(amt) }))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        nominalValue === amt
                          ? 'bg-indigo-700 text-white border-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Pembayaran */}
          {step === 3 && (
            <>
              {/* Tab switcher */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setPayMethod('qris')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    payMethod === 'qris' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'
                  }`}
                >
                  QRIS
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('transfer')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    payMethod === 'transfer' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'
                  }`}
                >
                  Transfer Bank
                </button>
              </div>

              {/* QRIS */}
              {payMethod === 'qris' && (
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <img src={qrisImage} alt="QRIS" className="w-44 h-44 object-contain mx-auto mb-3 rounded-2xl" />
                  <p className="text-sm font-bold text-gray-800">Karang Taruna RT 22/06</p>
                  <p className="text-xs text-gray-400 mt-0.5">Scan · Semua e-wallet & m-banking</p>
                  <a
                    href={qrisImage}
                    download="QRIS-KarangTaruna.png"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    ↓ Download QRIS
                  </a>
                </div>
              )}

              {/* Transfer Bank */}
              {payMethod === 'transfer' && (
                <div className="space-y-3">
                  {/* Pilih bank */}
                  <div className="grid grid-cols-5 gap-2">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        disabled={!bank.noRekening}
                        onClick={() => { setSelectedBank(bank.id); setCopied(false); }}
                        className={`relative py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                          selectedBank === bank.id
                            ? 'bg-indigo-700 text-white border-indigo-700'
                            : bank.noRekening
                            ? 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                        }`}
                      >
                        {bank.nama.replace('Bank ', '')}
                        {!bank.noRekening && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-gray-200 text-gray-400 rounded-full px-1 leading-4">
                            soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Detail rekening */}
                  {activeBank?.noRekening && (
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Bank</span>
                        <span className="text-sm font-bold text-gray-900">{activeBank.nama}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">No. Rekening</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 tracking-wide">{activeBank.noRekening}</span>
                          <button
                            type="button"
                            onClick={copyRekening}
                            className={`text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                              copied ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-600'
                            }`}
                          >
                            {copied ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Atas Nama</span>
                        <span className="text-sm font-semibold text-gray-900">{activeBank.atasNama}</span>
                      </div>
                      {nominalValue >= 1000 && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">Nominal Transfer</span>
                          <span className="text-sm font-black text-indigo-700">{formatRupiah(nominalValue)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Upload bukti */}
              <div>
                <label className="label">Bukti Transfer</label>
                <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors text-center">
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
                  {compressing ? (
                    <p className="text-sm text-gray-500">Mengompresi gambar...</p>
                  ) : filePreview ? (
                    filePreview === 'pdf' ? (
                      <p className="text-sm text-gray-700">📄 File PDF dipilih ✓</p>
                    ) : (
                      <img src={filePreview} alt="Preview" className="max-h-36 mx-auto rounded-xl object-contain" />
                    )
                  ) : (
                    <>
                      <p className="text-2xl mb-1">📎</p>
                      <p className="text-sm text-gray-600 font-medium">Klik untuk pilih foto / PDF</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · Maks 5 MB</p>
                    </>
                  )}
                </label>
                {file && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
                )}
              </div>

              {/* Catatan */}
              <div>
                <label className="label">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Dukungan bulan Juni 2026"
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* CTA button */}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="block w-full bg-gradient-to-r from-blue-700 to-indigo-600 text-white text-center font-bold text-base py-3.5 rounded-2xl shadow-md shadow-indigo-200/60 active:scale-95 transition-transform"
            >
              Lanjut →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status === 'loading' || compressing}
              className="block w-full bg-gradient-to-r from-emerald-500 to-green-400 text-white text-center font-bold text-base py-3.5 rounded-2xl shadow-md shadow-green-200/60 active:scale-95 transition-transform disabled:opacity-50"
            >
              {status === 'loading' ? 'Mengirim...' : '💝 Kirim Dukungan'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
