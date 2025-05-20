import axios from 'axios';

const API_BASE_URL = '/api/facilities';

export const facilityService = {
  // Get all facilities
  async getAllFacilities() {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  },

  // Get facility availability
  async getFacilityAvailability(facilityId, date) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${facilityId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching facility availability:', error);
      throw error;
    }
  },

  // Create a booking request
  async createBooking(bookingData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get bookings for approval
  async getBookingsForApproval(filters = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/pending`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings for approval:', error);
      throw error;
    }
  },

  // Approve or reject a booking
  async processBookingApproval(bookingId, { isApproved, note }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/process`, {
        approved: isApproved,
        note
      });
      return response.data;
    } catch (error) {
      console.error('Error processing booking approval:', error);
      throw error;
    }
  },

  // Get user's bookings
  async getUserBookings(userId, status = 'all') {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/user/${userId}`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  // Cancel a booking
  async cancelBooking(bookingId, reason) {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  // Get facility usage statistics
  async getFacilityStatistics(facilityId, timeRange = 'month') {
    try {
      const response = await axios.get(`${API_BASE_URL}/${facilityId}/statistics`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching facility statistics:', error);
      throw error;
    }
  },

  // Check booking conflicts
  async checkBookingConflicts(facilityId, date, timeSlot) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${facilityId}/conflicts`, {
        params: { date, timeSlot }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking booking conflicts:', error);
      throw error;
    }
  },

  // Get facility rules and requirements
  async getFacilityRules(facilityId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${facilityId}/rules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching facility rules:', error);
      throw error;
    }
  }
}; 