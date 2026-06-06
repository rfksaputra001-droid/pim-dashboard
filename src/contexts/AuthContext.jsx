import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

const SESSION_FLAG = 'admin_logged_in';

export function AuthProvider({ children }) {
  const hasSession = localStorage.getItem(SESSION_FLAG) === '1';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasSession);

  useEffect(() => {
    if (!hasSession) return;
    api.get('/admin/auth/me')
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem(SESSION_FLAG);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/admin/auth/login', { username, password });
    localStorage.setItem(SESSION_FLAG, '1');
    setUser({ username: data.username });
  };

  const logout = async () => {
    await api.post('/admin/auth/logout', {});
    localStorage.removeItem(SESSION_FLAG);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
