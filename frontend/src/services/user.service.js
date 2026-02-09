import api from '../shared/api.service';

export const userService = {
  /**
   * List users with optional filtering/pagination
   * @param {Object} params - { page, limit, role, search }
   * @returns {Promise<Array>}
   */
  async listUsers(params) {
    return api.get('/users', { params });
  },

  /**
   * Get specific user details
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getUser(id) {
    return api.get(`/users/${id}`);
  },

  /**
   * Create a new user (Admin only)
   * @param {Object} data - { name, email, role, etc. }
   * @returns {Promise<Object>}
   */
  async createUser(data) {
    return api.post('/users', data);
  },

  /**
   * Update user (Admin only)
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateUser(id, data) {
    return api.patch(`/users/${id}`, data);
  }
};
