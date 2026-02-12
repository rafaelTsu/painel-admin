<template>
  <v-container>
     <div class="d-flex align-center mb-4">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack" class="mr-2"></v-btn>
      <h1 class="text-h4">{{ templateStore.currentTemplate?.name }}</h1>
      <v-spacer></v-spacer>
      <v-btn variant="outlined" @click="showVariables = !showVariables">
        {{ showVariables ? 'Hide Variables' : 'Show Variables' }}
      </v-btn>
    </div>

    <v-tabs v-model="tab" class="mb-4">
        <v-tab value="upload">Upload DOCX</v-tab>
        <v-tab value="editor">Web Editor (Beta)</v-tab>
    </v-tabs>

    <v-row>
        <v-col :cols="showVariables ? 8 : 12">
            <v-window v-model="tab">
                <v-window-item value="upload">
                    <v-card class="mb-4 pa-4">
                        <h2 class="text-h6 mb-2">Upload New Version</h2>
                        <v-form @submit.prevent="uploadVersion">
                            <v-file-input v-model="file" label="DOCX File" accept=".docx" required></v-file-input>
                            <v-text-field v-model="changeNote" label="Change Note" required></v-text-field>
                            <v-btn color="primary" type="submit" :loading="uploading" :disabled="!file || !changeNote">Upload</v-btn>
                        </v-form>
                    </v-card>

                    <template-version-list :versions="templateStore.versions" :loading="templateStore.versionLoading" @edit="loadIntoEditor"></template-version-list>
                </v-window-item>

                <v-window-item value="editor">
                     <v-card class="pa-4">
                        <div class="d-flex align-center mb-2">
                             <h2 class="text-h6">Web Editor</h2>
                             <v-spacer></v-spacer>
                             <v-btn color="primary" @click="saveEditor" :loading="savingEditor">Save as New Version</v-btn>
                        </div>
                        <v-text-field v-model="editorChangeNote" label="Change Note for this version" density="compact"></v-text-field>
                        
                        <div style="height: 500px">
                             <QuillEditor :key="editorKey" theme="snow" v-model:content="editorContent" contentType="html" toolbar="full" />
                        </div>
                     </v-card>
                </v-window-item>
            </v-window>
        </v-col>

        <v-col cols="4" v-if="showVariables">
            <v-card height="100%">
                <v-card-title>Available Variables</v-card-title>
                <v-card-text>
                    <v-text-field v-model="searchVar" density="compact" label="Search variables" prepend-inner-icon="mdi-magnify" hide-details class="mb-2"></v-text-field>
                    <div style="max-height: 600px; overflow-y: auto;">
                        <v-expansion-panels variant="accordion" multiple>
                            <LogicSidebar />

                            <v-expansion-panel title="Variables" v-for="group in groupedVariables" :key="group.id" :value="group.id">
                                <template v-slot:title>
                                    <span class="text-subtitle-2 font-weight-bold">{{ group.name }}</span>
                                    <v-spacer></v-spacer>
                                    <span class="text-caption text-grey">{{ group.variables.length }}</span>
                                </template>
                                <v-expansion-panel-text>
                                    <v-list density="compact" class="pa-0">
                                        <v-list-item v-for="v in group.variables" :key="v.id"
                                            draggable="true" 
                                            @dragstart="onDragStart($event, v)"
                                            style="cursor: grab"
                                            class="pl-1"
                                        >
                                            <template v-slot:prepend>
                                                <v-icon icon="mdi-drag-vertical" size="small" class="text-grey ml-0 mr-2"></v-icon>
                                            </template>
                                            <v-list-item-title class="font-weight-medium text-body-2">{{ v.label }}</v-list-item-title>
                                            <v-list-item-subtitle class="text-caption">{{ v.key }} <span v-if="!v.groupId" class="text-purple ml-1">Global</span></v-list-item-subtitle>
                                            <div class="mt-1">
                                                <v-chip size="x-small" label class="mr-1 cursor-pointer" color="grey-lighten-3" @click="copy(v.type === 'text' ? `{{${v.key}}}` : `{#${v.key}}...{/${v.key}}`)">
                                                    {{ v.type === 'text' ? 'Insert Tag' : 'Insert Logic' }}
                                                </v-chip>
                                            </div>
                                        </v-list-item>
                                    </v-list>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                         <div v-if="groupedVariables.length === 0" class="text-center pa-4 text-grey">No variables found</div>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" timeout="2000">Copied to clipboard!</v-snackbar>
  </v-container>
</template>

<style scoped>
.logic-block {
    background: #e3f2fd;
    border-left: 4px solid #1976d2;
    margin-bottom: 4px;
    border-radius: 4px;
}
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTemplateStore } from '@/stores/template.store';
import { useGroupStore } from '@/stores/group.store';
import { useVariableStore } from '@/stores/variable.store';
import { useCategoryStore } from '@/stores/category.store';
import TemplateVersionList from '@/components/template-version-list.component.vue';
import LogicSidebar from '@/components/template-editor/LogicSidebar.vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const groupStore = useGroupStore();
const variableStore = useVariableStore();
const categoryStore = useCategoryStore();

const file = ref(null);
const changeNote = ref('');
const uploading = ref(false);

const showVariables = ref(true);
const searchVar = ref('');
const snackbar = ref(false);
const tab = ref('upload');

// Editor State
const editorContent = ref('');
const editorChangeNote = ref('Edited in Web Editor');
const savingEditor = ref(false);
const editorKey = ref(0);

const groupedVariables = computed(() => {
    const s = searchVar.value.toLowerCase();
    const all = variableStore.variables;
    
    // 1. Map Categories
    const groups = categoryStore.categories.map(c => {
        let vars = c.variables || [];
        if (s) {
            vars = vars.filter(v => 
                v.key.toLowerCase().includes(s) || 
                v.label.toLowerCase().includes(s)
            );
        }
        return {
            id: c.id,
            name: c.name,
            variables: vars
        };
    }).filter(g => g.variables.length > 0);

    // 2. Find Uncategorized
    const categorizedIds = new Set();
    categoryStore.categories.forEach(c => {
        if (c.variables) c.variables.forEach(v => categorizedIds.add(v.id));
    });

    let uncategorized = all.filter(v => !categorizedIds.has(v.id));
    if (s) {
        uncategorized = uncategorized.filter(v => 
            v.key.toLowerCase().includes(s) || 
            v.label.toLowerCase().includes(s)
        );
    }
    
    if (uncategorized.length > 0) {
        groups.push({
            id: 'uncategorized',
            name: 'Uncategorized',
            variables: uncategorized
        });
    }

    return groups;
});

const onDragStart = (evt, v) => {
     const text = v.type === 'text' ? `{{${v.key}}}` : `{#${v.key}}...{/${v.key}}`;
     evt.dataTransfer.setData('text/plain', text);
     evt.dataTransfer.effectAllowed = 'copy';
};

onMounted(async () => {
    const { groupId, templateId } = route.params;
    await templateStore.fetchTemplate(groupId, templateId);
    await templateStore.fetchVersions(groupId, templateId);
    await variableStore.fetchVariables(groupId);
    await categoryStore.fetchCategories(groupId, { includeVariables: true });
});

const goBack = () => {
    router.push({ name: 'Templates', params: { groupId: groupStore.selectedGroup?.id || route.params.groupId } });
};

const copy = (text) => {
    navigator.clipboard.writeText(text);
    snackbar.value = true;
};

const uploadVersion = async () => {
    if (!file.value || !changeNote.value) return;
    
    uploading.value = true;
    try {
        const formData = new FormData();
        const fileToUpload = Array.isArray(file.value) ? file.value[0] : file.value;
        
        if (!fileToUpload) {
             throw new Error("No file selected");
        }

        formData.append('file', fileToUpload);
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

const loadIntoEditor = async (version) => {
    // Fetch HTML for this version
    const { groupId, templateId } = route.params;
    try {
        const res = await templateStore.getVersionHtml(groupId, templateId, version.id);
        editorContent.value = res.html; // API returns { html: "..." } directly (unwrapped by interceptor)
        editorKey.value++;
        tab.value = 'editor';
    } catch (e) {
        console.error("Failed to load editor", e);
    }
};

const saveEditor = async () => {
    const { groupId, templateId } = route.params;
    savingEditor.value = true;
    try {
        // editorContent is HTML string
        await templateStore.createVersionFromHtml(groupId, templateId, editorContent.value, editorChangeNote.value);
        
        // Reset and go back to list
        editorChangeNote.value = 'Edited in Web Editor';
        tab.value = 'upload';
    } catch (e) {
        console.error("Failed to save", e);
    } finally {
        savingEditor.value = false;
    }
};
</script>
