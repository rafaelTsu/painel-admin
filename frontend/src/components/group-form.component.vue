<template>
  <v-card>
    <v-card-title class="text-h5 pa-4">
      {{ isEdit ? 'Edit Group' : 'New Group' }}
    </v-card-title>
    
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-text-field
          v-model="formData.name"
          label="Group Name"
          :rules="requiredRules"
          variant="outlined"
          class="mb-2"
        ></v-text-field>

        <v-textarea
          v-model="formData.description"
          label="Description"
          variant="outlined"
          rows="3"
        ></v-textarea>
      </v-form>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="$emit('cancel')">Cancel</v-btn>
      <v-btn color="primary" @click="save" :disabled="!valid">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'GroupForm',
  props: {
    group: {
      type: Object,
      default: null,
    },
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      valid: false,
      formData: {
        name: '',
        description: '',
      },
      requiredRules: [v => !!v || 'Field is required'],
    };
  },
  computed: {
    isEdit() {
      return !!this.group;
    },
  },
  watch: {
    group: {
      immediate: true,
      handler(val) {
        if (val) {
          this.formData = { ...val };
        } else {
          this.formData = {
            name: '',
            description: '',
          };
        }
      },
    },
  },
  methods: {
    save() {
      if (this.valid) {
        this.$emit('save', { ...this.formData });
      }
    },
  },
};
</script>
