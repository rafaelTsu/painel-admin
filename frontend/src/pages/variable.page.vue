<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-btn v-if="!isGlobalView" variant="text" :to="`/groups`" class="mr-4" icon="mdi-arrow-left"></v-btn>
      <h1 class="text-h4">{{ isGlobalView ? 'Global Variable Library' : 'Group Variables' }}</h1>
      <v-spacer></v-spacer>
    </div>

    <v-tabs v-model="tab" class="mb-4" v-if="!isGlobalView">
        <v-tab value="variables">Variables</v-tab>
        <v-tab value="categories">Categories</v-tab>
    </v-tabs>

    <v-window v-model="tab">
        <v-window-item value="variables">
            <div class="d-flex mb-2 justify-end">
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateVariable">
                    {{ isGlobalView ? 'Create Global Variable' : 'Create Variable' }}
                </v-btn>
            </div>
            
            <v-card elevation="2">
                <v-data-table
                    :headers="computedVariableHeaders"
                    :items="variableStore.variables"
                    :loading="variableStore.loading"
                    hover
                >
                    <template v-slot:item.type="{ item }">
                        <v-chip size="small" :color="getTypeColor(item.type)">{{ item.type }}</v-chip>
                    </template>
                    
                    <template v-slot:item.groups="{ item }">
                         <v-chip v-if="item.groups && item.groups.length > 0" size="small" variant="outlined">
                             {{ item.groups.length }} Groups
                         </v-chip>
                         <span v-else class="text-grey text-caption">Unassigned</span>
                    </template>

                    <template v-slot:item.global="{ item }">
                        <v-chip v-if="!item.groupId" size="small" color="purple" variant="flat">Global</v-chip>
                        <v-chip v-else size="small" color="grey" variant="text">Group</v-chip>
                    </template>
                    
                    <template v-slot:item.actions="{ item }">
                         <v-tooltip text="Assign to Groups" location="top" v-if="isGlobalView">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" icon="mdi-account-multiple-plus" size="small" variant="text" color="success" @click="openGroupAssign(item)"></v-btn>
                            </template>
                         </v-tooltip>
                         <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditVariable(item)" title="Edit"></v-btn>
                    </template>
                </v-data-table>
            </v-card>
        </v-window-item>

        <v-window-item value="categories" v-if="!isGlobalView">
            <div class="d-flex mb-2 justify-end">
                <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateCategory">Create Category</v-btn>
            </div>
             <v-card elevation="2">
                <v-data-table
                    :headers="categoryHeaders"
                    :items="categoryStore.categories"
                    :loading="categoryStore.loading"
                    hover
                >
                    <template v-slot:item.actions="{ item }">
                         <v-btn icon="mdi-link-variant" size="small" variant="text" color="success" @click="openAssignVariables(item)" title="Assign Variables"></v-btn>
                         <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditCategory(item)" title="Edit"></v-btn>
                    </template>
                </v-data-table>
            </v-card>
        </v-window-item>
    </v-window>

    <!-- Assign Groups Dialog (Global View) -->
    <v-dialog v-model="groupAssignDialog" max-width="600px">
        <v-card>
            <v-card-title>Assign '{{ currentAssignVariable?.key }}' to Groups</v-card-title>
            <v-card-text>
                <div v-if="groupStore.loading">Loading Groups...</div>
                <template v-else>
                    <v-text-field v-model="assignGroupSearch" label="Search Groups" density="compact" prepend-inner-icon="mdi-magnify" clearable></v-text-field>
                    <v-list density="compact" select-strategy="classic" lines="two" style="max-height: 400px; overflow-y: auto">
                        <v-list-item
                           v-for="g in filteredAssignGroups"
                           :key="g.id"
                           :value="g.id"
                        >
                           <template v-slot:prepend>
                               <v-checkbox-btn v-model="selectedGroupIds" :value="g.id"></v-checkbox-btn>
                           </template>
                           <v-list-item-title>{{ g.name }}</v-list-item-title>
                           <v-list-item-subtitle>{{ g.description }}</v-list-item-subtitle>
                        </v-list-item>
                   </v-list>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="groupAssignDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="saveGroupAssignments" :loading="savingAssignments">Save Associations</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>


    <!-- Assign Variables to Category Dialog (Group View) -->
    <v-dialog v-model="assignDialog" max-width="600px">
        <v-card>
            <v-card-title>Assign Variables to {{ currentCategory?.name }}</v-card-title>
            <v-card-text>
                <div v-if="loadingAssignments">Loading...</div>
                <template v-else>
                    <v-text-field v-model="assignSearch" label="Search Variables" density="compact" prepend-inner-icon="mdi-magnify" clearable></v-text-field>
                    <v-list density="compact" select-strategy="classic" style="max-height: 400px; overflow-y: auto">
                         <v-list-item
                            v-for="v in filteredAssignVariables"
                            :key="v.id"
                            :value="v.id"
                         >
                            <template v-slot:prepend>
                                <v-checkbox-btn v-model="selectedVariableIds" :value="v.id"></v-checkbox-btn>
                            </template>
                            <v-list-item-title>{{ v.label }} ({{ v.key }})</v-list-item-title>
                             <v-list-item-subtitle v-if="!v.groupId" class="text-caption text-purple">Global</v-list-item-subtitle>
                         </v-list-item>
                    </v-list>
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="assignDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="saveAssignments">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Variable Dialog -> Create/Edit -->
     <v-dialog v-model="variableDialog" max-width="500px">
        <v-card>
            <v-card-title>{{ isEditVariable ? 'Edit Variable' : 'New Variable' }}</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveVariable">
                    <v-text-field v-model="variableForm.key" label="Key (Unique)" required :disabled="isEditVariable" hint="Used in templates e.g. {{key}}"></v-text-field>
                    <v-text-field v-model="variableForm.label" label="Label" required hint="Display name for users"></v-text-field>
                    <v-select v-model="variableForm.type" :items="['text', 'boolean']" label="Type" required></v-select>
                    <v-textarea v-model="variableForm.description" label="Description"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="variableDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="saveVariable">Save</v-btn>
            </v-card-actions>
        </v-card>
     </v-dialog>

     <!-- Category Dialog -->
     <v-dialog v-model="categoryDialog" max-width="500px">
        <v-card>
            <v-card-title>{{ isEditCategory ? 'Edit Category' : 'New Category' }}</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveCategory">
                    <v-text-field v-model="categoryForm.name" label="Name" required></v-text-field>
                    <v-textarea v-model="categoryForm.description" label="Description"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="categoryDialog = false">Cancel</v-btn>
                <v-btn color="primary" @click="saveCategory">Save</v-btn>
            </v-card-actions>
        </v-card>
     </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useVariableStore } from '@/stores/variable.store';
import { useCategoryStore } from '@/stores/category.store';
import { useGroupStore } from '@/stores/group.store';
import { useRoute } from 'vue-router';

const variableStore = useVariableStore();
const categoryStore = useCategoryStore();
const groupStore = useGroupStore();
const route = useRoute();

const tab = ref('variables');

// Context Logic
const isGlobalView = computed(() => !route.params.groupId);

// Variable State
const variableDialog = ref(false);
const isEditVariable = ref(false);
const variableForm = ref({ key: '', label: '', type: 'text', description: '' });
const currentVariableId = ref(null);

const computedVariableHeaders = computed(() => {
    const headers = [
        { title: 'Key', key: 'key' },
        { title: 'Label', key: 'label' },
        { title: 'Type', key: 'type' },
    ];
    if (isGlobalView.value) {
        headers.push({ title: 'Assigned Groups', key: 'groups', sortable: false });
    } else {
        headers.push({ title: 'Scope', key: 'global' });
    }
    headers.push({ title: 'Description', key: 'description' });
    headers.push({ title: 'Actions', key: 'actions', sortable: false });
    return headers;
});

const getTypeColor = (type) => {
    if (type === 'boolean') return 'info';
    return 'default';
};

// Category State
const categoryDialog = ref(false);
const isEditCategory = ref(false);
const categoryForm = ref({ name: '', description: '' });
const currentCategoryId = ref(null);

const categoryHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
    { title: 'Actions', key: 'actions', sortable: false }
];

// Assign Variables to Category State
const assignDialog = ref(false);
const currentCategory = ref(null);
const selectedVariableIds = ref([]);
const assignSearch = ref('');
const loadingAssignments = ref(false);

const filteredAssignVariables = computed(() => {
    if (!assignSearch.value) return variableStore.variables;
    const s = assignSearch.value.toLowerCase();
    return variableStore.variables.filter(v => 
        v.key.toLowerCase().includes(s) || 
        v.label.toLowerCase().includes(s)
    );
});

// Group Assignment (Global View) State
const groupAssignDialog = ref(false);
const currentAssignVariable = ref(null);
const selectedGroupIds = ref([]);
const assignGroupSearch = ref('');
const savingAssignments = ref(false);

const filteredAssignGroups = computed(() => {
    if (!assignGroupSearch.value) return groupStore.groups;
    const s = assignGroupSearch.value.toLowerCase();
    return groupStore.groups.filter(g => 
        g.name.toLowerCase().includes(s)
    );
});

onMounted(async () => {
    await init();
});

watch(() => route.params.groupId, async (newVal) => {
    await init();
});

const init = async () => {
    const groupId = route.params.groupId;
    
    if (groupId) {
        // Group View
        if (groupStore.selectedGroupId !== groupId) {
            groupStore.selectGroup(groupId);
        }
        await Promise.all([
            variableStore.fetchVariables(groupId),
            categoryStore.fetchCategories(groupId, { includeVariables: true })
        ]);
        tab.value = 'variables';
    } else {
        // Global View
        tab.value = 'variables';
        await Promise.all([
            variableStore.fetchVariables(null),
            groupStore.fetchGroups()
        ]);
    }
};

// Variable Actions
const openCreateVariable = () => {
    variableForm.value = { key: '', label: '', type: 'text', description: '' };
    isEditVariable.value = false;
    currentVariableId.value = null;
    variableDialog.value = true;
};

const openEditVariable = (item) => {
    variableForm.value = { ...item };
    isEditVariable.value = true;
    currentVariableId.value = item.id;
    variableDialog.value = true;
};

const saveVariable = async () => {
    if (!variableForm.value.key || !variableForm.value.label) return;
    
    // Determine context
    const groupId = route.params.groupId || null; 
    
    const payload = { ...variableForm.value };
    delete payload.groups;
    delete payload.isGlobal; 
    
    try {
        if (isEditVariable.value) {
            await variableStore.updateVariable(groupId, currentVariableId.value, payload);
        } else {
            await variableStore.createVariable(groupId, payload);
        }
        variableDialog.value = false;
    } catch(err) {
        console.error("Error saving variable:", err);
    }
};

// Group Assignment Actions
const openGroupAssign = (item) => {
    currentAssignVariable.value = item;
    // item.groups is array of { id, name } provided by backend
    selectedGroupIds.value = (item.groups || []).map(g => g.id);
    groupAssignDialog.value = true;
};

const saveGroupAssignments = async () => {
    if (!currentAssignVariable.value) return;
    savingAssignments.value = true;
    try {
        const variableId = currentAssignVariable.value.id;
        const newIds = selectedGroupIds.value;
        const oldIds = (currentAssignVariable.value.groups || []).map(g => g.id);
        
        // Find to add
        const toAdd = newIds.filter(id => !oldIds.includes(id));
        // Find to remove
        const toRemove = oldIds.filter(id => !newIds.includes(id));
        
        const promises = [];
        toAdd.forEach(gid => promises.push(variableStore.associateVariable(variableId, gid)));
        toRemove.forEach(gid => promises.push(variableStore.dissociateVariable(variableId, gid)));
        
        await Promise.all(promises);
        
        // Refresh list
        await variableStore.fetchVariables(null);

        groupAssignDialog.value = false;
    } catch (e) {
        console.error("Failed to assign groups:", e);
    } finally {
        savingAssignments.value = false;
    }
};

// Category Actions
const openCreateCategory = () => {
    categoryForm.value = { name: '', description: '' };
    isEditCategory.value = false;
    currentCategoryId.value = null;
    categoryDialog.value = true;
};

const openEditCategory = (item) => {
    categoryForm.value = { ...item };
    isEditCategory.value = true;
    currentCategoryId.value = item.id;
    categoryDialog.value = true;
};

const saveCategory = async () => {
    if (!categoryForm.value.name) return;
    const groupId = route.params.groupId;
    if (groupId) {
        try {
            if (isEditCategory.value) {
                await categoryStore.updateCategory(groupId, currentCategoryId.value, categoryForm.value);
            } else {
                await categoryStore.createCategory(groupId, categoryForm.value);
            }
            categoryDialog.value = false;
        } catch (err) {
            console.error("Error saving category:", err);
            // Ideally show notification here
        }
    }
};

const openAssignVariables = (item) => {
    currentCategory.value = item;
    selectedVariableIds.value = (item.variables || []).map(v => v.id);
    assignDialog.value = true;
};

const saveAssignments = async () => {
    const groupId = route.params.groupId || groupStore.selectedGroup?.id;
    if (groupId && currentCategory.value) {
        try {
            await categoryStore.assignVariables(groupId, currentCategory.value.id, selectedVariableIds.value);
            await categoryStore.fetchCategories(groupId, { includeVariables: true });
            assignDialog.value = false;
        } catch (err) {
            console.error("Error saving assignments:", err);
        }
    }
};
</script>
