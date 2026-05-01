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
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
}

.auth-box {
  background: #FFFFE3;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #4A4A4A;
  margin-bottom: 30px;
  font-size: 28px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  color: #4A4A4A;
  font-weight: 600;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #6D81D3;
  box-shadow: 0 0 0 3px rgba(109, 129, 211, 0.1);
}

.btn-login {
  padding: 12px;
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
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
