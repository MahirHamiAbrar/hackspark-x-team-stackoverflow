<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>RentPi Login</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" :disabled="isLoading" class="btn-login">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p class="register-link">
        Don't have an account? <NuxtLink to="/auth/register">Register here</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userController } from '@/controllers/userController.js';

const router = useRouter();
const form = ref({
  email: '',
  password: '',
});

const isLoading = ref(false);
const error = ref('');

const handleLogin = async () => {
  try {
    error.value = '';
    isLoading.value = true;

    await userController.login(form.email, form.password);
    
    // Redirect to dashboard on successful login
    await router.push('/dashboard');
  } catch (err) {
    error.value = err.message || 'Login failed. Please try again.';
    console.error('Login error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.auth-box {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 50px 40px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

h1 {
  text-align: center;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px var(--neon-cyan-glow);
  margin-bottom: 40px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: var(--text-dim);
  font-weight: 600;
  font-size: 14px;
}

input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px 16px;
  color: var(--text-main);
  font-size: 16px;
  transition: all var(--transition-normal);
}

input:focus {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
  background: rgba(255, 255, 255, 0.05);
}

.btn-login {
  padding: 14px;
  background: linear-gradient(135deg, var(--neon-cyan), #0891b2);
  color: var(--bg-secondary);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--neon-cyan);
  filter: brightness(1.1);
}

.btn-login:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.error-message {
  color: #fb7185;
  font-size: 14px;
  margin-top: 20px;
  padding: 12px;
  background: rgba(251, 113, 133, 0.1);
  border: 1px solid rgba(251, 113, 133, 0.2);
  border-radius: 8px;
  text-align: center;
}

.register-link {
  text-align: center;
  margin-top: 30px;
  color: var(--text-dim);
}

.register-link a {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
  transition: text-shadow var(--transition-fast);
}

.register-link a:hover {
  text-shadow: 0 0 8px var(--neon-cyan-glow);
}
</style>
