import api from '../shared/api.service';

export const templateService = {
  async list(groupId, params) {
    return api.get(`/groups/${groupId}/templates`, { params });
  },
  async create(groupId, data) {
    return api.post(`/groups/${groupId}/templates`, data);
  },
  async get(groupId, id) {
      return api.get(`/groups/${groupId}/templates/${id}`);
  },
  async createVersion(groupId, templateId, formData) {
    return api.post(`/groups/${groupId}/templates/${templateId}/versions`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
  },
  async listVersions(groupId, templateId) {
    return api.get(`/groups/${groupId}/templates/${templateId}/versions`);
  },
  async getVersionHtml(groupId, templateId, versionId) {
    return api.get(`/groups/${groupId}/templates/${templateId}/versions/${versionId}/html`);
  },
  async createVersionFromHtml(groupId, templateId, html, changeNote) {
    return api.post(`/groups/${groupId}/templates/${templateId}/versions/html`, { html, changeNote });
  },
  async export(groupId, templateId) {
    return api.get(`/groups/${groupId}/templates/${templateId}/export`, { responseType: 'blob' });
  },
  async import(groupId, file) {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/groups/${groupId}/templates/import`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
  }
};
