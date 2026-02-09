import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes.router';
import { useAuthStore } from '../stores/auth.store';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const authRequired = !to.meta.public;

  // Restore session from cookie/localstorage check is implicit in store state init
  // If we wanted to validate token validity with server on every route change, we'd do it here.
  // For now, trust store state.

  if (authRequired) {
    if (!authStore.isAuthenticated) {
      return next('/login');
    }

    // Role Guard
    if (to.meta.roles) {
      const userRole = authStore.user?.role;
      // Backend uses 'administrator', frontend store normalizes logic in 'isAdmin'
      // But here we check raw role
      if (!to.meta.roles.includes(userRole)) {
        // Unauthorized for this route
        return next('/groups'); // Fallback
      }
    }

    // Evaluator Check (US1: Evaluator denied)
    if (authStore.user?.role === 'evaluator') {
      authStore.logout();
      return next('/login');
    }
  } else {
    // Public page
    if (to.path === '/login' && authStore.isAuthenticated) {
      return next('/');
    }
  }

  next();
});

export default router;
