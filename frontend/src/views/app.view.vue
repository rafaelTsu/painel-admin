<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            Admin Panel
          </v-list-item-title>
          <v-list-item-subtitle v-if="authStore.user">
            {{ authStore.user.name }} ({{ authStore.user.role }})
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          v-if="isAdmin"
          prepend-icon="mdi-account-group"
          title="Users"
          to="/users"
          value="users"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Groups"
          to="/groups"
          value="groups"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-variable"
          title="Variable Library"
          to="/variables"
          value="variables"
        ></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn block color="error" variant="text" @click="handleLogout">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app color="primary" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Admin System</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';

export default {
  name: 'AppView',
  data() {
    return {
      drawer: true,
    };
  },
  computed: {
    ...mapStores(useAuthStore),
    isAdmin() {
      return this.authStore.isAdmin;
    }
  },
  methods: {
    async handleLogout() {
      try {
        await authService.logout();
      } catch (e) {
        console.warn('Logout failed on server:', e);
      } finally {
        this.authStore.logout();
        this.$router.push('/login');
      }
    }
  }
}
</script>
