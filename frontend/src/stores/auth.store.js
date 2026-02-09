import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Initialize from localStorage if available
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    accessToken: localStorage.getItem('accessToken') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    // Backend uses 'administrator'
    isAdmin: (state) => state.user?.role === 'administrator' || state.user?.role === 'admin', 
    isAttorney: (state) => state.user?.role === 'attorney',
    currentUser: (state) => state.user,
  },
  actions: {
    setAuth(user, token) {
      this.user = user;
      this.accessToken = token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
    },
    updateUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.user = null;
      this.accessToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      // Ideally redirect here or let the view handle it
    }
  }
});
