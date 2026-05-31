export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateShort = (date) =>
  new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const CATEGORY_LABELS = {
  OPERASIONAL: 'Operasional',
  KEGIATAN: 'Kegiatan',
  PERALATAN: 'Peralatan',
  LAIN_LAIN: 'Lain-lain',
};

export const STATUS_LABELS = {
  PENDING: 'Menunggu',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
};

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};
