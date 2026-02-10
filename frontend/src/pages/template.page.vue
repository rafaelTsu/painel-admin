<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h4">Templates</h1>
      <v-spacer></v-spacer>
      <v-btn color="secondary" prepend-icon="mdi-import" @click="openImport" class="mr-2">Import</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Create Template</v-btn>
    </div>

    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="templateStore.templates"
        :loading="templateStore.loading"
        hover
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-play" size="small" variant="text" color="success" @click="openSimulate(item)" title="Simulate"></v-btn>
          <v-btn icon="mdi-file-edit" size="small" variant="text" color="primary" @click="openEditor(item)" title="Edit Versions"></v-btn>
          <v-btn icon="mdi-export" size="small" variant="text" color="default" @click="downloadExport(item)" title="Export"></v-btn>
        </template>
      </v-data-table>
    </v-card>

     <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title>{{ isEdit ? 'Edit Template' : 'New Template' }}</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-text-field v-model="form.name" label="Name" required></v-text-field>
                    <v-textarea v-model="form.description" label="Description"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="save">Save</v-btn>
            </v-card-actions>
        </v-card>
     </v-dialog>

     <v-dialog v-model="importDialog" max-width="500px">
        <v-card>
            <v-card-title>Import Template</v-card-title>
            <v-card-text>
                <div class="mb-3">Upload a .zip file from a previous export.</div>
                <v-file-input v-model="importFile" label="Export Package (.zip)" accept=".zip" show-size></v-file-input>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="importDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="confirmImport" :loading="templateStore.loading" :disabled="!importFile">Import</v-btn>
            </v-card-actions>
        </v-card>
     </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTemplateStore } from '@/stores/template.store';
import { useGroupStore } from '@/stores/group.store';
import { useRouter, useRoute } from 'vue-router';

const templateStore = useTemplateStore();
const groupStore = useGroupStore();
const router = useRouter();
const route = useRoute();

const dialog = ref(false);
const importDialog = ref(false);
const importFile = ref(null);
const form = ref({ name: '', description: '' });
const isEdit = ref(false);

const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
    { title: 'Revision', key: 'revision' },
    { title: 'Actions', key: 'actions', sortable: false }
];

onMounted(() => {
    // If we have a groupId in the route params, prefer it (handles page refresh)
    const groupId = route.params.groupId || groupStore.selectedGroup?.id;
    
    if (groupId) {
        // Ensure store is synced if using route param
        if (route.params.groupId && groupStore.selectedGroupId !== route.params.groupId) {
            groupStore.selectGroup(route.params.groupId);
        }
        templateStore.fetchTemplates(groupId);
    }
});

const openCreate = () => {
    form.value = { name: '', description: '' };
    isEdit.value = false;
    dialog.value = true;
};

const openEditor = (item) => {
    // Navigate to template editor
    const groupId = route.params.groupId || groupStore.selectedGroup.id;
    router.push({ name: 'TemplateEditor', params: { groupId, templateId: item.id } });
};

const openSimulate = (item) => {
   const groupId = route.params.groupId || groupStore.selectedGroup.id;
   router.push({ name: 'Simulation', params: { groupId, templateId: item.id } });
};

const openImport = () => { importDialog.value = true; importFile.value = null; };

const confirmImport = async () => {
    if (!importFile.value) return;
    const file = Array.isArray(importFile.value) ? importFile.value[0] : importFile.value;
    const groupId = route.params.groupId || groupStore.selectedGroup?.id;
    if (file && groupId) {
        await templateStore.importTemplate(groupId, file);
        importDialog.value = false;
    }
};

const downloadExport = async (item) => {
    const groupId = route.params.groupId || groupStore.selectedGroup?.id;
    if (groupId) {
        const res = await templateStore.exportTemplate(groupId, item.id);
        const url = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `template-${item.id}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};

const save = async () => {
    if (!form.value.name) return;
    const groupId = route.params.groupId || groupStore.selectedGroup?.id;
    if (groupId) {
        await templateStore.createTemplate(groupId, form.value);
        dialog.value = false;
    }
};
</script>
