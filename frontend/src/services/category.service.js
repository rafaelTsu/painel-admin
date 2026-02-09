import api from '../shared/api.service';

export const categoryService = {
  async list(groupId, params) {
    return api.get(`/groups/${groupId}/categories`, { params });
  },
  async create(groupId, data) {
    return api.post(`/groups/${groupId}/categories`, data);
  },
  async update(groupId, id, data) {
    return api.patch(`/groups/${groupId}/categories/${id}`, data);
  },
  async assignVariables(groupId, categoryId, variableIds) {
    return api.post(`/groups/${groupId}/categories/${categoryId}/variables`, { variableIds });
  }
};
