import api from '../shared/api.service';

export const variableService = {
  async list(groupId, params) {
    return api.get(`/groups/${groupId}/variables`, { params });
  },
  async create(groupId, data) {
    return api.post(`/groups/${groupId}/variables`, data);
  },
  async update(groupId, id, data) {
    return api.patch(`/groups/${groupId}/variables/${id}`, data);
  }
};
