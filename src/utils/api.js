const API_BASE_URL = "http://localhost:5000/api";

export const apiClient = {
  // Authentication
  signup: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch(`${API_BASE_URL}/user/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
  },

  // Services
  getAllServices: async () => {
    const res = await fetch(`${API_BASE_URL}/services`);
    return res.json();
  },

  getServiceById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/services/${id}`);
    return res.json();
  },

  getServicesByCategory: async (category) => {
    const res = await fetch(`${API_BASE_URL}/services/category/${category}`);
    return res.json();
  },

  // Bookings (Cart & Checkout)
  createBooking: async (data, token) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getUserBookings: async (token) => {
    const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
  },

  getBookingById: async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
  },

  cancelBooking: async (id, token) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: { "Authorization": `Bearer ${token}` }
    });
    return res.json();
  },

  updateBookingStatus: async (id, status, token) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
