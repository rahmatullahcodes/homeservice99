import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';

/**
 * Custom hook for managing vendor services
 * Provides methods to fetch, create, update, and delete services
 */
export function useVendorServices() {
  const token = localStorage.getItem('vendorToken');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all vendor services
  const fetchServices = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.GET_SERVICES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor/login';
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch services');
      }

      const data = await response.json();
      const servicesList = Array.isArray(data) ? data : data.services || data.data || [];
      setServices(servicesList);
      return servicesList;
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services');
      setServices([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Create a new service
  const createService = useCallback(async (serviceData) => {
    if (!token) {
      setError('Authentication token not found');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.CREATE_SERVICE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor/login';
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create service');
      }

      const newService = await response.json();
      setServices([...services, newService]);
      return newService;
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err.message || 'Failed to create service');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, services]);

  // Update a service
  const updateService = useCallback(async (serviceId, updates) => {
    if (!token) {
      setError('Authentication token not found');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.UPDATE_SERVICE(serviceId), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor/login';
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update service');
      }

      const updatedService = await response.json();
      setServices(services.map(s => s._id === serviceId ? updatedService : s));
      return updatedService;
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.message || 'Failed to update service');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, services]);

  // Delete a service
  const deleteService = useCallback(async (serviceId) => {
    if (!token) {
      setError('Authentication token not found');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.VENDOR.DELETE_SERVICE(serviceId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('vendorToken');
        window.location.href = '/vendor/login';
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete service');
      }

      setServices(services.filter(s => s._id !== serviceId));
      return true;
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.message || 'Failed to delete service');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token, services]);

  // Toggle service active/inactive status
  const toggleService = useCallback(async (serviceId, currentActive) => {
    return updateService(serviceId, { active: !currentActive });
  }, [updateService]);

  // Get a specific service by ID
  const getService = useCallback((serviceId) => {
    return services.find(s => s._id === serviceId);
  }, [services]);

  // Get all active services
  const getActiveServices = useCallback(() => {
    return services.filter(s => s.active);
  }, [services]);

  // Get services by category
  const getServicesByCategory = useCallback((category) => {
    return services.filter(s => s.category === category);
  }, [services]);

  // Get service statistics
  const getServiceStats = useCallback(() => {
    return {
      total: services.length,
      active: services.filter(s => s.active).length,
      inactive: services.filter(s => !s.active).length,
      averagePrice: services.length > 0 ? services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length : 0,
      categories: [...new Set(services.map(s => s.category))]
    };
  }, [services]);

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleService,
    getService,
    getActiveServices,
    getServicesByCategory,
    getServiceStats,
    setError
  };
}

export default useVendorServices;
