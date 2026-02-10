<template>
  <v-card>
    <v-card-title>Versions</v-card-title>
    <v-data-table
      :headers="headers"
      :items="versions"
      :loading="loading"
    >
        <template v-slot:item.docxPath="{ item }">
            <span class="text-caption">{{ item.docxPath }}</span>
        </template>
        <template v-slot:item.referencedVariableKeys="{ item }">
            <v-chip v-for="key in item.referencedVariableKeys" :key="key" size="x-small" class="mr-1">{{ key }}</v-chip>
        </template>
        <template v-slot:item.createdAt="{ item }">
            {{ new Date(item.createdAt).toLocaleString() }}
        </template>
        <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" variant="text" @click="$emit('edit', item)" title="Edit in Web Editor" color="primary"></v-btn>
        </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    versions: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['edit']);

const headers = [
    { title: 'Version', key: 'versionNumber' },
    { title: 'Change Note', key: 'changeNote' },
    { title: 'CreatedAt', key: 'createdAt' },
    { title: 'Variables', key: 'referencedVariableKeys' },
    { title: 'Actions', key: 'actions', sortable: false }
];
</script>
