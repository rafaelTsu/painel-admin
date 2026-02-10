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
        let res;
        if (!groupId) {
             res = await variableService.listAll(params);
        } else {
             res = await variableService.list(groupId, params);
        }

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
        if (!groupId) {
            await variableService.createGlobal(data);
        } else {
            await variableService.create(groupId, data);
        }
        await this.fetchVariables(groupId);
    },
    async updateVariable(groupId, id, data) {
        await variableService.update(groupId, id, data);
        await this.fetchVariables(groupId);
    },
    async associateVariable(variableId, groupId) {
        await variableService.associate(variableId, groupId);
    },
    async dissociateVariable(variableId, groupId) {
        await variableService.dissociate(variableId, groupId);
    }
  }
});
