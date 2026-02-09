<template>
  <v-container class="fill-height justify-center">
    <v-card width="400" elevation="2">
      <v-card-title class="text-center text-h5 font-weight-bold py-4">
        Admin Panel System
      </v-card-title>
      <v-card-subtitle class="text-center pb-4">
        Sign in to your account
      </v-card-subtitle>
      
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Email"
            prepend-inner-icon="mdi-email"
            variant="outlined"
            :rules="emailRules"
            required
            autocomplete="email"
          ></v-text-field>
          
          <v-text-field
            v-model="password"
            label="Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            :rules="requiredRules"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword = !showPassword"
            required
            class="mt-2"
            autocomplete="current-password"
          ></v-text-field>

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            class="mt-6"
            :loading="loading"
            :disabled="!valid"
          >
            Login
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapStores } from 'pinia';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';

export default {
  name: 'LoginPage',
  data() {
    return {
      valid: false,
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: '',
      // Joi-like validation rules
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      requiredRules: [
        v => !!v || 'Field is required',
      ],
    };
  },
  computed: {
    ...mapStores(useAuthStore),
  },
  methods: {
    async handleLogin() {
      if (!this.valid) return;
      
      this.loading = true;
      this.error = '';
      
      try {
        const response = await authService.login(this.email, this.password);
        
        // Use the mapped store
        this.authStore.setAuth(response.user, response.accessToken);
        
        // Redirect to dashboard or previous route
        this.$router.push('/');
      } catch (err) {
        console.error(err);
        if (err.status === 401) {
          this.error = 'Invalid email or password.';
        } else {
          this.error = err.message || 'Login failed. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
