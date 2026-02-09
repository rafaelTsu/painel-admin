import { defineStore } from 'pinia';
import { groupService } from '../services/group.service';

export const useGroupStore = defineStore('group', {
  state: () => ({
    groups: [],
    selectedGroupId: localStorage.getItem('selectedGroupId') || null,
    currentGroupMembers: [],
    loading: false,
    error: null,
  }),
  getters: {
    selectedGroup: (state) => state.groups.find(g => g.id === state.selectedGroupId),
  },
  actions: {
    selectGroup(id) {
      this.selectedGroupId = id;
      if (id) {
        localStorage.setItem('selectedGroupId', id);
      } else {
        localStorage.removeItem('selectedGroupId');
      }
    },

    async fetchGroups(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await groupService.listGroups(params);
        this.groups = response.data;
        return response;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchGroupMembers(groupId) {
       this.loading = true;
       try {
         const response = await groupService.listMembers(groupId);
         // Storing members in a transient state or mapping to groups? 
         // For simplicity, let's keep a simplistic currentGroupMembers for the detail view
         this.currentGroupMembers = response.data;
         return response;
       } catch (err) {
         this.error = err.message;
         throw err;
       } finally {
         this.loading = false;
       }
    },

    async createGroup(groupData) {
      this.loading = true;
      try {
        const newGroup = await groupService.createGroup(groupData);
        this.groups.push(newGroup);
        return newGroup;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateGroup(id, groupData) {
      this.loading = true;
      try {
        const updatedGroup = await groupService.updateGroup(id, groupData);
        const index = this.groups.findIndex(g => g.id === id);
        if (index !== -1) {
          this.groups.splice(index, 1, updatedGroup);
        }
        return updatedGroup;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async addMember(groupId, userId) {
        await groupService.addMember(groupId, userId);
        // Refresh members
        await this.fetchGroupMembers(groupId);
    },

    async removeMember(groupId, userId) {
        await groupService.removeMember(groupId, userId);
        // Refresh members
        await this.fetchGroupMembers(groupId);
    }
  }
});
