import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('skyline_token') || localStorage.getItem('clubpulse_token')
  );
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const userData = await api.get('/api/auth/me');
      setUser(userData);
    } catch (err) {
      console.warn('Auth token expired or invalid:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('skyline_token', res.access_token);
    localStorage.setItem('clubpulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register', userData);
    localStorage.setItem('skyline_token', res.access_token);
    localStorage.setItem('clubpulse_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('skyline_token');
    localStorage.removeItem('clubpulse_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const switchTrack = async (newRole) => {
    const res = await api.post('/api/payments/switch-track', { member_role: newRole });
    await fetchCurrentUser();
    return res;
  };

  const isMember = user?.membership_status === 'active';
  const membershipRole = user?.membership_role || 'participant';
  const isVolunteer = isMember && membershipRole === 'volunteer';
  const canVolunteer = isVolunteer || ['organizer', 'admin'].includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        isMember,
        membershipRole,
        isVolunteer,
        canVolunteer,
        loading,
        login,
        register,
        logout,
        refreshUser,
        switchTrack
      }}
    >
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
