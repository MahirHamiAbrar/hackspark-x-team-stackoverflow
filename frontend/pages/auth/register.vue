<template>
  <div class="auth-container">
    <div class="auth-box">
      <h1>RentPi Register</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name:</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your full name"
            required
          />
        </div>

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

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" :disabled="isLoading" class="btn-register">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
      
      <p class="login-link">
        Already have an account? <NuxtLink to="/auth/login">Login here</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userController } from '@/controllers/userController.js';
import { validatePassword } from '@/utils/validators.js';

const router = useRouter();
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const isLoading = ref(false);
const error = ref('');
const success = ref('');

const handleRegister = async () => {
  try {
    error.value = '';
    success.value = '';

    // Validate passwords match
    if (form.value.password !== form.value.confirmPassword) {
      error.value = 'Passwords do not match';
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(form.value.password);
    if (!passwordValidation.isValid) {
      error.value = 'Password must be at least 6 characters';
      return;
    }

    isLoading.value = true;

    await userController.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });

    success.value = 'Registration successful! Redirecting to login...';
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  } catch (err) {
    error.value = err.message || 'Registration failed. Please try again.';
    console.error('Registration error:', err);
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
  padding: 40px 20px;
  background: #FFFFE3;
}

.auth-box {
  background: #ffffff;
  padding: 50px 40px;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
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
  font-size: 14px;
}

input {
  padding: 14px 16px;
  border: 1.5px solid #eaeaea;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #fafafa;
}

input:focus {
  outline: none;
  border-color: #6D81D3;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(109, 129, 211, 0.15);
}

.btn-register {
  padding: 14px;
  background: #6D81D3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;
  box-shadow: 0 4px 15px rgba(109, 129, 211, 0.3);
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #5a6eb8;
  box-shadow: 0 6px 20px rgba(109, 129, 211, 0.4);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 10px;
  padding: 8px;
  background-color: #ffebee;
  border-radius: 5px;
}

.success-message {
  color: #2e7d32;
  font-size: 13px;
  margin-top: 10px;
  padding: 8px;
  background-color: #e8f5e9;
  border-radius: 5px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #4A4A4A;
  font-size: 14px;
}

.login-link a {
  color: #6D81D3;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
