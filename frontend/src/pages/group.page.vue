<template>  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Groups</h1>
      <v-spacer></v-spacer>
      <v-btn v-if="isAdmin" color="primary" prepend-icon="mdi-plus" @click="openCreate">Create Group</v-btn>
    </div>

    <v-card elevation="2">
      <v-data-table
        :headers="computedHeaders"
        :items="groupStore.groups"
        :loading="groupStore.loading"
        hover
      >
        <template v-slot:item.actions="{ item }">
          <div v-if="isAdmin">
            <v-btn icon="mdi-account-multiple-plus" size="small" variant="text" color="info" @click="openMembers(item)" title="Manage Members"></v-btn>
            <v-btn icon="mdi-variable" size="small" variant="text" color="default" @click="openVariables(item)" title="Manage Variables"></v-btn>
            <v-btn icon="mdi-file-document-multiple" size="small" variant="text" color="secondary" @click="openTemplates(item)" title="Manage Templates"></v-btn>
            <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)" title="Edit"></v-btn>
          </div>
          <div v-else>
             <v-btn icon="mdi-account-supervisor" size="small" variant="text" @click="openMembers(item)" title="View Members"></v-btn>
             <v-btn icon="mdi-variable" size="small" variant="text" color="default" @click="openVariables(item)" title="View Variables"></v-btn>
             <v-btn icon="mdi-file-document-multiple" size="small" variant="text" color="secondary" @click="openTemplates(item)" title="Manage Templates"></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <group-form
        :group="selectedGroup"
        @save="handleSave"
        @cancel="dialog = false"
      />
    </v-dialog>

    <!-- Members Dialog -->
    <v-dialog v-model="membersDialog" max-width="600px">
        <v-card>
            <v-card-title>
                Members: {{ selectedGroupForMembers?.name }}
            </v-card-title>
            <v-card-text>
                <!-- Add Member Form (Admin only) -->
                 <v-row v-if="isAdmin" class="mb-2 align-center">
                    <v-col cols="8">
                        <v-autocomplete
                            v-model="userToAdd"
                            :items="availableUsers"
                            item-title="email"
                            item-value="id"
                            label="Search User by Email"
                            variant="outlined"
                            density="compact"
                            hide-details
                            return-object
                            no-data-text="No users found or all added"
                        >
                          <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.email"></v-list-item>
                          </template>
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="4">
                        <v-btn block color="primary" @click="addMember" :loading="groupStore.loading" :disabled="!userToAdd">Add</v-btn>
                    </v-col>
                 </v-row>
                 
                 <v-divider class="mb-2"></v-divider>

                 <v-list density="compact">
                    <v-list-item v-for="member in groupStore.currentGroupMembers" :key="member.id">
                        <template v-slot:prepend>
                          <v-avatar color="grey-lighten-1" size="small">
                             <span class="text-caption">{{ member.name?.charAt(0).toUpperCase() }}</span>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ member.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ member.email }} - {{ member.role }}</v-list-item-subtitle>
                        
                        <template v-slot:append v-if="isAdmin">
                            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="removeMember(member.id)"></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item v-if="!groupStore.currentGroupMembers || groupStore.currentGroupMembers.length === 0">
                        <v-list-item-title class="text-grey italic">No members found.</v-list-item-title>
                    </v-list-item>
                 </v-list>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="membersDialog = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" location="top right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapStores } from 'pinia';
import { useGroupStore } from '../stores/group.store';
import { useUserStore } from '../stores/user.store';
import { useAuthStore } from '../stores/auth.store';
import GroupForm from '../components/group-form.component.vue';

export default {
  name: 'GroupPage',
  components: { GroupForm },
  data() {
    return {
      dialog: false,
      membersDialog: false,
      selectedGroup: null,
      selectedGroupForMembers: null,
      userToAdd: null,
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapStores(useGroupStore, useUserStore, useAuthStore),
    isAdmin() {
        return this.authStore.isAdmin;
    },
    computedHeaders() {
        const h = [
            { title: 'Name', key: 'name', align: 'start' },
            { title: 'Description', key: 'description', align: 'start' },
            { title: 'Actions', key: 'actions', align: 'end', sortable: false },
        ];
        return h;
    },
    availableUsers() {
        if (!this.userStore.users) return [];
        // Just return all users if no members loaded yet, or filter
        if(!this.groupStore.currentGroupMembers) return this.userStore.users;
        
        const currentMemberIds = this.groupStore.currentGroupMembers.map(m => m.id);
        return this.userStore.users.filter(u => !currentMemberIds.includes(u.id));
    }
  },
  mounted() {
    this.fetchGroups();
    if(this.isAdmin) {
        // Fetch a larger list for autocomplete to work reasonably well for MVP
        this.userStore.fetchUsers({ limit: 100 }); 
    }
  },
  methods: {
    async fetchGroups() {
      try {
        await this.groupStore.fetchGroups();
      } catch (e) {
        this.showSnackbar(e.message || 'Failed to fetch groups', 'error');
      }
    },
    openCreate() {
      this.selectedGroup = null;
      this.dialog = true;
    },
    openTemplates(group) {
      this.groupStore.selectGroup(group.id);
      this.$router.push({ name: 'Templates', params: { groupId: group.id } });
    },
    openVariables(group) {
      this.groupStore.selectGroup(group.id);
      this.$router.push({ name: 'Variables', params: { groupId: group.id } });
    },
    openEdit(group) {
      this.selectedGroup = group;
      this.dialog = true;
    },
    async openMembers(group) {
        this.selectedGroupForMembers = group;
        this.userToAdd = null;
        this.membersDialog = true;
        try {
            await this.groupStore.fetchGroupMembers(group.id);
        } catch(e) {
             this.showSnackbar('Failed to fetch members', 'error');
        }
    },
    async handleSave(groupData) {
      try {
        if (this.selectedGroup) {
           await this.groupStore.updateGroup(this.selectedGroup.id, groupData);
           this.showSnackbar('Group updated');
        } else {
           await this.groupStore.createGroup(groupData);
           this.showSnackbar('Group created');
        }
        this.dialog = false;
      } catch (e) {
        this.showSnackbar(e.message, 'error');
      }
    },
    async addMember() {
        if(!this.userToAdd || !this.selectedGroupForMembers) return;
        try {
            await this.groupStore.addMember(this.selectedGroupForMembers.id, this.userToAdd.id);
            this.showSnackbar('Member added');
            this.userToAdd = null;
        } catch(e) {
            this.showSnackbar(e.message, 'error');
        }
    },
    async removeMember(userId) {
        // if(!confirm('Are you sure?')) return; // confirm often annoying in quick dev, maybe skip or use Vuetify dialog
        try {
            await this.groupStore.removeMember(this.selectedGroupForMembers.id, userId);
            this.showSnackbar('Member removed');
        } catch(e) {
            this.showSnackbar(e.message, 'error');
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
