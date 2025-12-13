"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCheckInTime, setCurrentCheckInTime] = useState<string | null>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    // Set a maximum timeout to prevent infinite loading (reduced to 15 seconds)
    const maxTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth check timed out after 15 seconds');
        setLoading(false);
        setAuthError('Connection timeout. Please check your internet connection and backend server status.');
      }
    }, 15000);

    // Add a small delay to ensure the app is fully loaded
    const initTimeout = setTimeout(() => {
      apiFetch('/api/auth/me')
        .then(async (userData) => {
          clearTimeout(maxTimeout);
          setUser(userData);
          // Check if user is already checked in today
          try {
            await checkCurrentCheckinStatus(userData);
          } catch (checkinError) {
            console.error('Error checking check-in status:', checkinError);
            // Don't block auth if check-in check fails
          }
        })
        .catch((err) => {
          clearTimeout(maxTimeout);
          setUser(null);
          console.error('Auth error:', err);
          if (err.message && err.message.toLowerCase().includes('unauthorized')) {
            setAuthError('Session expired or not authorized. Please log in again.');
          } else if (err.message && err.message.toLowerCase().includes('timeout')) {
            setAuthError('Connection timeout. Please check your internet connection.');
          } else {
            setAuthError(null);
          }
        })
        .finally(() => {
          clearTimeout(maxTimeout);
          setLoading(false);
        });
    }, 500); // Small delay to ensure Capacitor is ready

    return () => {
      clearTimeout(maxTimeout);
      clearTimeout(initTimeout);
    };
  }, []);

  const checkCurrentCheckinStatus = async (userData) => {
    try {
      const data = await apiFetch('/api/attendance/my-attendance-simple');
      const today = new Date().toDateString();
      const todayRecord = data.attendance?.find(record => {
        const recordDate = new Date(record.date).toDateString();
        return recordDate === today && !record.checkOut && record.isActive;
      });
      
      console.log('Checking check-in status:', {
        today,
        todayRecord,
        hasCheckOut: todayRecord?.checkOut,
        isActive: todayRecord?.isActive,
        isCheckedIn: !!todayRecord
      });
      
      if (todayRecord) {
        console.log('User is already checked in today, hiding modal');
        setIsCheckedIn(true);
        setCurrentCheckInTime(todayRecord.checkIn);
        setShowCheckinModal(false);
      } else {
        console.log('User is not checked in today, showing modal');
        setIsCheckedIn(false);
        setCurrentCheckInTime(null);
        setShowCheckinModal(true);
      }
    } catch (error) {
      console.error('Error checking check-in status:', error);
      // If there's an auth error, don't show check-in modal yet
      if (error.message?.includes('Unauthorized')) {
        setIsCheckedIn(false);
        setShowCheckinModal(false);
      } else {
        setIsCheckedIn(false);
        setShowCheckinModal(true);
      }
    }
  };

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
    
    // Wait a bit for auth to be fully established, then check check-in status
    setTimeout(async () => {
      await checkCurrentCheckinStatus(user);
    }, 1000);
    
    return user;
  };

  const logout = async () => {
    // Always attempt to auto checkout on logout
    if (isCheckedIn && user) {
      try {
        console.log('Auto checking out on logout...');
        await apiFetch('/api/attendance/auto-checkout', {
          method: 'POST',
          body: JSON.stringify({ staffId: user._id }),
        });
        console.log('Auto checkout successful');
      } catch (error) {
        console.error('Auto checkout failed during logout:', error);
        // Continue with logout even if auto checkout fails
      }
    }
    
    // Proceed with logout
    performLogout();
  };

  const performLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setUser(null);
    setAuthError(null);
    setIsCheckedIn(false);
    setCurrentCheckInTime(null);
    setShowCheckinModal(false);
    setShowCheckoutModal(false);
    
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleCheckIn = async () => {
    try {
      console.log('Starting check-in process...');
      await apiFetch('/api/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify({ staffId: user._id }),
      });
      console.log('Check-in API call successful, updating state...');
      setIsCheckedIn(true);
      setCurrentCheckInTime(new Date().toISOString());
      setShowCheckinModal(false);
      console.log('State updated - isCheckedIn:', true, 'showCheckinModal:', false);
    } catch (error: any) {
      console.error('Check-in failed:', error);
      console.log('Error details:', {
        message: error.message,
        attendance: error.attendance,
        fullError: error
      });
      
      // If user is already checked in, treat it as success
      if (error.message?.includes('Already checked in today')) {
        console.log('User already checked in, updating state...');
        setIsCheckedIn(true);
        // Use the actual check-in time from the error response
        if (error.attendance?.checkIn) {
          setCurrentCheckInTime(error.attendance.checkIn);
        } else {
          setCurrentCheckInTime(new Date().toISOString());
        }
        setShowCheckinModal(false);
      } else {
        // For other errors, refresh the check-in status
        await checkCurrentCheckinStatus(user);
      }
    }
  };

  const handleCheckOut = async () => {
    try {
      console.log('Starting check-out process...');
      await apiFetch('/api/attendance/checkout', {
        method: 'POST',
        body: JSON.stringify({ staffId: user._id }),
      });
      console.log('Check-out API call successful, updating state...');
      setIsCheckedIn(false);
      setCurrentCheckInTime(null);
      setShowCheckoutModal(false);
      console.log('State updated - isCheckedIn:', false, 'showCheckoutModal:', false);
    } catch (error: any) {
      console.error('Check-out failed:', error);
      console.log('Error details:', {
        message: error.message,
        fullError: error
      });
    }
  };

  const handleCheckOutAndLogout = async () => {
    try {
      console.log('Starting check-out and logout process...');
      console.log('User ID for checkout:', user._id);
      
      const response = await apiFetch('/api/attendance/checkout', {
        method: 'POST',
        body: JSON.stringify({ staffId: user._id }),
      });
      
      console.log('Check-out API response:', response);
      console.log('Check-out API call successful, logging out...');
      
      setIsCheckedIn(false);
      setCurrentCheckInTime(null);
      setShowCheckoutModal(false);
      
      // Complete the logout process
      await performLogout();
    } catch (error: any) {
      console.error('Check-out and logout failed:', error);
      console.log('Error details:', {
        message: error.message,
        fullError: error
      });
      
      // Even if checkout fails, still logout the user
      console.log('Proceeding with logout despite checkout error...');
      setIsCheckedIn(false);
      setCurrentCheckInTime(null);
      setShowCheckoutModal(false);
      await performLogout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      authError, 
      isCheckedIn, 
      currentCheckInTime,
      showCheckinModal, 
      showCheckoutModal,
      handleCheckIn,
      handleCheckOut,
      handleCheckOutAndLogout,
      setShowCheckoutModal,
      checkCurrentCheckinStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 