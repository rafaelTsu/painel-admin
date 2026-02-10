<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Users</h1>
      <v-spacer></v-spacer>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create User</v-btn>
    </div>

    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="userStore.users"
        :loading="userStore.loading"
        hover
      >
        <template v-slot:item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            label
            variant="flat"
          >
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="primary"
            @click="openEdit(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px" persistent>
      <user-form
        :user="selectedUser"
        @save="handleSave"
        @cancel="dialog = false"
      />
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor"  location="top right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapStores } from 'pinia';
import { useUserStore } from '../stores/user.store';
import UserForm from '../components/user-form.component.vue';

export default {
  name: 'UserPage',
  components: { UserForm },
  data() {
    return {
      headers: [
        { title: 'Name', key: 'name', align: 'start' },
        { title: 'Email', key: 'email', align: 'start' },
        { title: 'Role', key: 'role', align: 'start' },
        { title: 'Status', key: 'isActive', align: 'center' },
        { title: 'Actions', key: 'actions', align: 'end', sortable: false },
      ],
      dialog: false,
      selectedUser: null,
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapStores(useUserStore),
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        await this.userStore.fetchUsers();
      } catch (e) {
        this.showSnackbar(e.message || 'Failed to fetch users', 'error');
      }
    },
    openCreate() {
      this.selectedUser = null;
      this.dialog = true;
    },
    openEdit(user) {
      this.selectedUser = user;
      this.dialog = true;
    },
    async handleSave(userData) {
      try {
        if (this.selectedUser) {
           await this.userStore.updateUser(this.selectedUser.id, userData);
           this.showSnackbar('User updated successfully');
        } else {
           await this.userStore.createUser(userData);
           this.showSnackbar('User created successfully');
        }
        this.dialog = false;
      } catch (e) {
        this.showSnackbar(e.message || 'Operation failed', 'error');
      }
    },
    showSnackbar(text, color = 'success') {
        this.snackbarText = text;
        this.snackbarColor = color;
        this.snackbar = true;
    }
  },
};
</script>
