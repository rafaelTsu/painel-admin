import api from '../shared/api.service';

export const authService = {
  /**
   * Login with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{user: Object, accessToken: string}>}
   */
  async login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  /**
   * Logs out the user (clears httpOnly cookie on server)
   * @returns {Promise<void>}
   */
  async logout() {
    return api.post('/auth/logout');
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{user: Object}>}
   */
  async getMe() {
    return api.get('/auth/me');
  },

  /**
   * Refresh the access token using the httpOnly cookie
   * @returns {Promise<{accessToken: string}>}
   */
  async refreshToken() {
    return api.post('/auth/refresh');
  }
};
