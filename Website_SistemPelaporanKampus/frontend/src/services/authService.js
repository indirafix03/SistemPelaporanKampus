import api from './api';

// Service untuk authentication
const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  // Cek user saat ini
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Cek role user
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  // Ganti password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/api/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;
