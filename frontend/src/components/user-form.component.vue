<template>
  <v-card>
    <v-card-title class="text-h5 pa-4">
      {{ isEdit ? 'Edit User' : 'New User' }}
    </v-card-title>
    
    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-text-field
          v-model="formData.name"
          label="Name"
          :rules="requiredRules"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>

        <v-text-field
          v-model="formData.email"
          label="Email"
          :rules="emailRules"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>

        <!-- Only show password field when creating new user -->
        <v-text-field
          v-if="!isEdit"
          v-model="formData.password"
          label="Password"
          :rules="passwordRules"
          type="password"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>

        <v-select
          v-model="formData.role"
          :items="roles"
          label="Role"
          :rules="requiredRules"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-select>

        <v-checkbox
          v-if="isEdit"
          v-model="formData.isActive"
          label="Active Account"
          color="primary"
          hide-details
        ></v-checkbox>
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
  name: 'UserForm',
  props: {
    user: {
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
        email: '',
        password: '',
        role: 'attorney',
        isActive: true,
      },
      roles: ['administrator', 'attorney', 'evaluator'],
      requiredRules: [v => !!v || 'Field is required'],
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length >= 6) || 'Min 6 characters',
      ],
    };
  },
  computed: {
    isEdit() {
      return !!this.user;
    },
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.formData = { ...val, password: '' }; // Don't fill password on edit
        } else {
          this.formData = {
            name: '',
            email: '',
            password: '',
            role: 'attorney',
            isActive: true,
          };
        }
      },
    },
  },
  methods: {
    save() {
      if (!this.valid) return;
      
      const payload = { ...this.formData };
      if (this.isEdit) {
        delete payload.password; // Don't send empty password on update
      }
      this.$emit('save', payload);
    },
  },
};
</script>
