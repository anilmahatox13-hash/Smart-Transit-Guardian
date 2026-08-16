import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('transit_token');
    const savedUser = localStorage.getItem('transit_user');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('transit_token');
    localStorage.removeItem('transit_user');
    setUser(null);
  };

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('transit_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/users/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('transit_user', JSON.stringify(res.data.user));
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    const { token, user: loggedUser } = res.data;
    localStorage.setItem('transit_token', token);
    localStorage.setItem('transit_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token, user: newUser } = res.data;
    localStorage.setItem('transit_token', token);
    localStorage.setItem('transit_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};