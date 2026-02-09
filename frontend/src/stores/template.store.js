import { defineStore } from 'pinia';
import { templateService } from '../services/template.service';

export const useTemplateStore = defineStore('template', {
  state: () => ({
    templates: [],
    currentTemplate: null,
    versions: [],
    loading: false,
    versionLoading: false
  }),
  actions: {
    async fetchTemplates(groupId, params) {
      this.loading = true;
      try {
        const res = await templateService.list(groupId, params);
        if (res.data) {
             this.templates = res.data;
        } else {
             this.templates = Array.isArray(res) ? res : [];
        }
      } finally {
        this.loading = false;
      }
    },
    async fetchTemplate(groupId, id) {
        this.loading = true;
        try {
            this.currentTemplate = await templateService.get(groupId, id);
        } finally {
            this.loading = false;
        }
    },
    async createTemplate(groupId, data) {
        await templateService.create(groupId, data);
        await this.fetchTemplates(groupId);
    },
    async fetchVersions(groupId, templateId) {
        this.versionLoading = true;
        try {
            // listVersions returns array
            const res = await templateService.listVersions(groupId, templateId);
            this.versions = res || [];
        } finally {
            this.versionLoading = false;
        }
    },
    async createVersion(groupId, templateId, formData) {
        await templateService.createVersion(groupId, templateId, formData);
        await this.fetchVersions(groupId, templateId);
    },
    async importTemplate(groupId, file) {
        this.loading = true;
        try {
            await templateService.import(groupId, file);
            await this.fetchTemplates(groupId);
        } finally {
            this.loading = false;
        }
    },
    async exportTemplate(groupId, templateId) {
         return await templateService.export(groupId, templateId);
    }
  }
});
