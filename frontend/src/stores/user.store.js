import { defineStore } from 'pinia';
import { userService } from '../services/user.service';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),
  getters: {
    // Helper to find user by ID from local state
    getUserById: (state) => (id) => state.users.find(u => u.id === id),
  },
  actions: {
    async fetchUsers(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Backend returns standard pagination response: { data: [], start, limit, total }
        // Or if it's a simple list... depends on backend logic. 
        // Backend `paginate()` returns { data, total, start, limit }
        const response = await userService.listUsers(params);
        this.users = response.data; 
        return response;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createUser(userData) {
      this.loading = true;
      try {
        const newUser = await userService.createUser(userData);
        this.users.push(newUser);
        return newUser;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateUser(id, userData) {
      this.loading = true;
      try {
        const updatedUser = await userService.updateUser(id, userData);
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser);
        }
        return updatedUser;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
