import axios from 'axios';

const API_BASE_URL = '/api/fund-management';

export const fundManagementService = {
  // Get all budget applications
  async getAllApplications(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get application details
  async getApplicationDetails(applicationId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application details:', error);
      throw error;
    }
  },

  // Process application approval/rejection
  async processApplication(applicationId, { isApproved, note }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/applications/${applicationId}/process`, {
        approved: isApproved,
        note
      });
      return response.data;
    } catch (error) {
      console.error('Error processing application:', error);
      throw error;
    }
  },

  // Get budget statistics
  async getBudgetStatistics(timeRange = 'month') {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget statistics:', error);
      throw error;
    }
  },

  // Get department-wise allocations
  async getDepartmentAllocations() {
    try {
      const response = await axios.get(`${API_BASE_URL}/allocations/departments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching department allocations:', error);
      throw error;
    }
  },

  // Get expense categories breakdown
  async getExpenseCategories(timeRange = 'month') {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/categories`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      throw error;
    }
  },

  // Export budget report
  async exportBudgetReport(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/export`, {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'budget-report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting budget report:', error);
      throw error;
    }
  },

  // Get application history
  async getApplicationHistory(applicationId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/${applicationId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application history:', error);
      throw error;
    }
  },

  // Add comment to application
  async addComment(applicationId, comment) {
    try {
      const response = await axios.post(`${API_BASE_URL}/applications/${applicationId}/comments`, {
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get budget utilization report
  async getBudgetUtilization(departmentId, timeRange = 'month') {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments/${departmentId}/utilization`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching budget utilization:', error);
      throw error;
    }
  }
}; 