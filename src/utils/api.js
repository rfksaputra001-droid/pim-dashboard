const BASE = import.meta.env.VITE_API_URL || '/api';

const request = async (method, path, body) => {
  const isForm = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm ? {} : { 'Content-Type': 'application/json' },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.headers.get('content-type')?.includes('text/csv')) {
    return res.blob();
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
  return data;
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  postForm: (path, form) => request('POST', path, form),
};
