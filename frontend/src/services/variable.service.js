import api from '../shared/api.service';

export const variableService = {
  async list(groupId, params) {
    return api.get(`/groups/${groupId}/variables`, { params });
  },
  async create(groupId, data) {
    return api.post(`/groups/${groupId}/variables`, data);
  },
  async update(groupId, id, data) {
    if (!groupId) {
         // Global update via /variables
         return api.patch(`/variables/${id}`, data);
    }
    return api.patch(`/groups/${groupId}/variables/${id}`, data);
  },
  async listAll(params) {
      return api.get('/variables', { params });
  },
  async createGlobal(data) {
     return api.post('/variables', data);
  },
  async associate(variableId, groupId) {
      return api.post(`/variables/${variableId}/associate`, { groupId });
  },
  async dissociate(variableId, groupId) {
      return api.delete(`/variables/${variableId}/groups/${groupId}`);
  }
};
