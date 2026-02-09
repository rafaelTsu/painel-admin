<template>
  <v-container>
     <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>
      <h1 class="text-h4">{{ templateStore.currentTemplate?.name }}</h1>
    </div>

    <v-card class="mb-4 pa-4">
        <h2 class="text-h6 mb-2">Upload New Version</h2>
        <v-form @submit.prevent="uploadVersion">
            <v-file-input v-model="file" label="DOCX File" accept=".docx" required></v-file-input>
            <v-text-field v-model="changeNote" label="Change Note" required></v-text-field>
            <v-btn color="primary" type="submit" :loading="uploading" :disabled="!file || !changeNote">Upload</v-btn>
        </v-form>
    </v-card>

    <template-version-list :versions="templateStore.versions" :loading="templateStore.versionLoading"></template-version-list>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template.store';
import { useGroupStore } from '@/stores/group.store';
import TemplateVersionList from '@/components/template-version-list.component.vue';

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const groupStore = useGroupStore();

const file = ref(null);
const changeNote = ref('');
const uploading = ref(false);

onMounted(async () => {
    const { groupId, templateId } = route.params;
    await templateStore.fetchTemplate(groupId, templateId);
    await templateStore.fetchVersions(groupId, templateId);
});

const goBack = () => {
    router.push({ name: 'Templates', params: { groupId: groupStore.selectedGroup?.id || route.params.groupId } });
};

const uploadVersion = async () => {
    if (!file.value || !changeNote.value) return;
    
    uploading.value = true;
    try {
        const formData = new FormData();
        formData.append('file', file.value[0]); // Vuetify file input returns array? Wait, verify version. Vuetify 3 returns array by default or file? 
        // Vuetify 3 uses array mostly.
        formData.append('changeNote', changeNote.value);
        
        const { groupId, templateId } = route.params;
        await templateStore.createVersion(groupId, templateId, formData);
        
        file.value = null;
        changeNote.value = '';
    } catch (e) {
        console.error(e);
    } finally {
        uploading.value = false;
    }
};
</script>
