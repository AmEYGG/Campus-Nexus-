import axios from 'axios';

const API_BASE_URL = '/api/budgets'; // Replace with your actual API endpoint

export const budgetService = {
  // Fetch all budgets with optional filters
  async getAllBudgets(filters = {}) {
    const { category, search } = filters;
    try {
      const response = await axios.get(API_BASE_URL, { params: { category, search } });
      return response.data;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },

  // Fetch a single budget by ID
  async getBudgetById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  },

  // Create a new budget
  async createBudget(budgetData) {
    try {
      const response = await axios.post(API_BASE_URL, budgetData);
      return response.data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  // Update an existing budget
  async updateBudget(id, budgetData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  // Upload expense proofs
  async uploadExpenseProofs(budgetId, files) {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('budgetId', budgetId);

      const response = await axios.post(`${API_BASE_URL}/expense-proofs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading expense proofs:', error);
      throw error;
    }
  },

  // Verify expense proofs
  async verifyExpenseProofs(budgetId, proofIds) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${budgetId}/verify`, {
        proofIds,
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying expense proofs:', error);
      throw error;
    }
  },

  // Export budget report
  async exportBudgetReport(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/export`, {
        params: filters,
        responseType: 'blob',
      });
      
      // Create a download link for the exported file
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

  // Get budget statistics
  async getBudgetStatistics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget statistics:', error);
      throw error;
    }
  },

  // Get mess budget details
  async getMessBudgets() {
    try {
      const response = await axios.get(`${API_BASE_URL}/mess`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mess budgets:', error);
      throw error;
    }
  }
}; 