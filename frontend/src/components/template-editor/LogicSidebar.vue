<template>
  <v-expansion-panel title="Document Logic">
    <v-expansion-panel-text>
      <v-list density="compact" class="pa-0">
        <v-list-item
          v-for="item in items"
          :key="item.type"
          draggable="true"
          @dragstart="onDragStart($event, item)"
          class="pl-1 logic-block mb-1 rounded"
          style="cursor: grab"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon" size="small" class="text-blue ml-0 mr-2"></v-icon>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2">{{ item.label }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption text-blue">{{ item.desc }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>

<script setup>
const items = [
  { 
    type: 'if', 
    label: 'IF Condition', 
    desc: 'Insert conditional block',
    icon: 'mdi-code-braces',
    text: '{{# condition }} ... {{/}}'
  },
  { 
    type: 'ifelse', 
    label: 'IF / ELSE Condition', 
    desc: 'Insert conditional with fallback',
    icon: 'mdi-code-braces',
    text: '{{# condition }} ... {{^}} ... {{/}}'
  }
];

const onDragStart = (evt, item) => {
  evt.dataTransfer.setData('text/plain', item.text);
  evt.dataTransfer.effectAllowed = 'copy';
};
</script>

<style scoped>
.logic-block {
    background: #e3f2fd;
    border-left: 4px solid #1976d2;
}
</style>
