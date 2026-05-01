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
}

.auth-box {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 50px 40px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  width: 100%;
  max-width: 480px;
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
  gap: 20px;
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
  font-size: 15px;
  transition: all var(--transition-normal);
}

input:focus {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
  background: rgba(255, 255, 255, 0.05);
}

.btn-register {
  padding: 14px;
  background: linear-gradient(135deg, var(--neon-cyan), #0891b2);
  color: var(--bg-secondary);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: 15px;
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--neon-cyan);
  filter: brightness(1.1);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.error-message {
  color: #fb7185;
  font-size: 13px;
  margin-top: 15px;
  padding: 10px;
  background: rgba(251, 113, 133, 0.1);
  border: 1px solid rgba(251, 113, 133, 0.2);
  border-radius: 8px;
  text-align: center;
}

.success-message {
  color: #4ade80;
  font-size: 13px;
  margin-top: 15px;
  padding: 10px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 8px;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 30px;
  color: var(--text-dim);
  font-size: 14px;
}

.login-link a {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
  transition: text-shadow var(--transition-fast);
}

.login-link a:hover {
  text-shadow: 0 0 8px var(--neon-cyan-glow);
}
</style>
