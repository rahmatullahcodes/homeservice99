import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const VendorContext = createContext(null);

export function VendorProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vendorToken'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('vendorToken'));

  // Fetch vendor data on mount if token exists
  useEffect(() => {
    if (token) {
      fetchVendorProfile();
    }
  }, [token]);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.VENDOR.ME, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error('Failed to fetch vendor profile');
      }

      const data = await response.json();
      setVendor(data.vendor || data);
      setError(null);
    } catch (err) {
      setError(err.message);
      // If fetch fails, clear token
      if (err.message.includes('401')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR_AUTH.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store token and vendor data
      localStorage.setItem('vendorToken', data.token);
      localStorage.setItem('vendor', JSON.stringify(data.vendor));
      
      setToken(data.token);
      setVendor(data.vendor);
      setIsLoggedIn(true);

      return { success: true, vendor: data.vendor, token: data.token };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Vendor Login Attempt:', { email });
      console.log('📡 API Endpoint:', API_ENDPOINTS.VENDOR_AUTH.LOGIN);

      const response = await fetch(API_ENDPOINTS.VENDOR_AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('📥 API Response:', { status: response.status, message: data.message });

      if (!response.ok) {
        console.log('❌ Login Error:', data.message);
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login Success:', { vendorId: data.vendor._id, email: data.vendor.email });

      // Store token and vendor data
      localStorage.setItem('vendorToken', data.token);
      localStorage.setItem('vendor', JSON.stringify(data.vendor));
      
      setToken(data.token);
      setVendor(data.vendor);
      setIsLoggedIn(true);

      return { success: true, vendor: data.vendor, token: data.token };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.UPDATE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update vendor data
      const updatedVendor = data.vendor || data;
      setVendor(updatedVendor);
      localStorage.setItem('vendor', JSON.stringify(updatedVendor));

      return { success: true, vendor: updatedVendor };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendor');
    localStorage.removeItem('vendor_id');
    setToken(null);
    setVendor(null);
    setIsLoggedIn(false);
  };

  const value = {
    vendor,
    token,
    loading,
    error,
    isLoggedIn,
    signup,
    login,
    logout,
    updateProfile,
    fetchVendorProfile
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used inside VendorProvider');
  }
  return context;
}

export default VendorContext;
