import api from './api';

// Service untuk report/laporan
const reportService = {
  // Ambil semua laporan
  getAllReports: async (statusFilter = null) => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ambil detail laporan
  getReportDetail: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buat laporan baru
  createReport: async (reportData) => {
    try {
      const formData = new FormData();
      Object.keys(reportData).forEach(key => {
        formData.append(key, reportData[key]);
      });

      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update status laporan
  updateReportStatus: async (reportId, updateData) => {
    try {
      const response = await api.put(`/reports/${reportId}/kelola`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Ambil dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/reports/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default reportService;
