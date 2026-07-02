import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const parseUser = (token, email, role, name, avatar) =>
  token ? { token, email, role, name, avatar } : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('token');
    const email  = localStorage.getItem('email');
    const role   = localStorage.getItem('role');
    const name   = localStorage.getItem('name');
    const avatar = localStorage.getItem('avatar');
    setUser(parseUser(token, email, role, name, avatar));
    setLoading(false);
  }, []);

  const persist = (token, email, role, name, avatar) => {
    localStorage.setItem('token',  token);
    localStorage.setItem('email',  email);
    localStorage.setItem('role',   role   || 'user');
    localStorage.setItem('name',   name   || '');
    localStorage.setItem('avatar', avatar || '');
    setUser(parseUser(token, email, role, name, avatar));
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data.token, email, res.data.role, res.data.name, res.data.avatar);
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    persist(res.data.token, email, 'user', res.data.name, null);
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    persist(res.data.token, res.data.email, 'admin', res.data.name, null);
  };

  const updateProfile = (name, avatar) => {
    localStorage.setItem('name',   name   || '');
    localStorage.setItem('avatar', avatar || '');
    setUser(prev => ({ ...prev, name, avatar }));
  };

  const logout = () => {
    ['token','email','role','name','avatar'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, adminLogin, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
