import { defineStore } from 'pinia';
import { variableService } from '../services/variable.service';

export const useVariableStore = defineStore('variable', {
  state: () => ({
    variables: [],
    loading: false
  }),
  actions: {
    async fetchVariables(groupId, params) {
      this.loading = true;
      try {
        const res = await variableService.list(groupId, params);
        if (res.data) {
             this.variables = res.data;
        } else {
             this.variables = Array.isArray(res) ? res : [];
        }
      } finally {
        this.loading = false;
      }
    },
    async createVariable(groupId, data) {
        await variableService.create(groupId, data);
        await this.fetchVariables(groupId);
    },
    async updateVariable(groupId, id, data) {
        await variableService.update(groupId, id, data);
        await this.fetchVariables(groupId);
    }
  }
});
