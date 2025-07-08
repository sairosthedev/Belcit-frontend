"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(setUser)
      .catch((err) => {
        setUser(null);
        if (err.message && err.message.toLowerCase().includes('unauthorized')) {
          setAuthError('Session expired or not authorized. Please log in again.');
        } else {
          setAuthError(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { token } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    // Fetch user info after login
    const user = await apiFetch('/api/auth/me');
    setUser(user);
    setAuthError(null);
    return user;
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 