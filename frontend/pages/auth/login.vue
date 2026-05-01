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
  background: #FFFFE3;
}

.auth-box {
  background: #ffffff;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(0,0,0,0.02);
}

h1 {
  text-align: center;
  color: #4A4A4A;
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
  color: #4A4A4A;
  font-weight: 600;
  font-size: 14px;
}

input {
  padding: 14px 16px;
  border: 1.5px solid #eaeaea;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #6D81D3;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(109, 129, 211, 0.15);
}

.btn-login {
  padding: 14px;
  background: #6D81D3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(109, 129, 211, 0.3);
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #5a6eb8;
  box-shadow: 0 6px 20px rgba(109, 129, 211, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 10px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 5px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #4A4A4A;
}

.register-link a {
  color: #6D81D3;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
