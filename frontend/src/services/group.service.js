import api from '../shared/api.service';

export const groupService = {
  /**
   * List groups (scoped by role)
   * @param {Object} params - { page, limit }
   * @returns {Promise<Array>}
   */
  async listGroups(params) {
    return api.get('/groups', { params });
  },

  /**
   * Get group details
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getGroup(id) {
    return api.get(`/groups/${id}`);
  },

  /**
   * List members of a group
   * @param {string} groupId 
   * @param {Object} params 
   * @returns {Promise<Array>}
   */
  async listMembers(groupId, params) {
    return api.get(`/groups/${groupId}/members`, { params });
  },

  /**
   * Create group (Admin only)
   * @param {Object} data - { name, description }
   * @returns {Promise<Object>}
   */
  async createGroup(data) {
    return api.post('/groups', data);
  },

  /**
   * Update group (Admin only)
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateGroup(id, data) {
    return api.patch(`/groups/${id}`, data);
  },

  /**
   * Delete group (Admin only)
   * @param {string} id 
   * @returns {Promise<void>}
   */
  async deleteGroup(id) {
    return api.delete(`/groups/${id}`);
  },

  /**
   * Add member to group (Admin only)
   * @param {string} groupId 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async addMember(groupId, userId) {
    return api.post(`/groups/${groupId}/members`, { userId });
  },

  /**
   * Remove member from group (Admin only)
   * @param {string} groupId 
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async removeMember(groupId, userId) {
    return api.delete(`/groups/${groupId}/members/${userId}`);
  }
};
