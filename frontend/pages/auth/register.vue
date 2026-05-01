<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="auth-header">
        <h1>RentPi</h1>
        <p class="subtitle">Create Account</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <div class="input-wrapper">
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="John Doe"
              required
              :disabled="isLoading"
            />
            <span class="input-icon">👤</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email Address</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              required
              :disabled="isLoading"
            />
            <span class="input-icon">✉️</span>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="isLoading"
              @input="validatePassword"
            />
            <span class="input-icon">🔒</span>
          </div>
          <div class="password-strength" v-if="form.password">
            <div class="strength-bar" :class="passwordStrength.class"></div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
            <span class="input-icon">🔐</span>
          </div>
          <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="validation-message error">
            ⚠️ Passwords do not match
          </div>
          <div v-else-if="form.confirmPassword && form.password === form.confirmPassword" class="validation-message success">
            ✓ Passwords match
          </div>
        </div>

        <button type="submit" :disabled="isLoading || !isFormValid()" class="btn-register">
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <transition name="fade">
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>
      </transition>

      <transition name="fade">
        <div v-if="success" class="success-message">
          <span class="success-icon">✓</span>
          {{ success }}
        </div>
      </transition>

      <div class="auth-footer">
        <p class="login-link">
          Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { userController } from '@/controllers/userController.js';

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const isLoading = ref(false);
const error = ref('');
const success = ref('');
const passwordStrength = ref({ text: '', class: '' });

const validatePassword = () => {
  const pwd = form.value.password;
  let strength = 0;
  
  if (pwd.length >= 6) strength++;
  if (pwd.length >= 8) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;

  const strengths = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const classes = ['weak', 'fair', 'good', 'strong', 'very-strong'];
  
  passwordStrength.value = {
    text: strengths[Math.min(strength - 1, 4)] || 'Weak',
    class: classes[Math.min(strength - 1, 4)] || 'weak',
  };
};

const isFormValid = () => {
  return (
    form.value.name.trim() &&
    form.value.email.trim() &&
    form.value.password === form.value.confirmPassword &&
    form.value.password.length >= 6
  );
};

const handleRegister = async () => {
  try {
    error.value = '';
    success.value = '';

    if (!isFormValid()) {
      error.value = 'Please fill all fields correctly';
      return;
    }

    isLoading.value = true;

    await userController.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });

    success.value = 'Account created successfully! Redirecting to dashboard...';
    
    // Redirect to dashboard after successful registration using Nuxt's navigateTo
    setTimeout(() => {
      navigateTo('/dashboard');
    }, 1500);
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
  background: linear-gradient(135deg, var(--bg-secondary) 0%, #1a1f3a 100%);
  position: relative;
  overflow: hidden;
}

/* Animated background elements */
.auth-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--neon-cyan-glow) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  z-index: 0;
}

.auth-container::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(30px); }
}

.auth-box {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 60px 45px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 50px rgba(34, 211, 238, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease-out;
}

h1 {
  color: var(--neon-cyan);
  text-shadow: 0 0 20px var(--neon-cyan-glow);
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-dim);
  font-size: 14px;
  margin-top: 8px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.6s ease-out;
}

label {
  margin-bottom: 12px;
  color: var(--text-dim);
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color var(--transition-normal);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px 16px 14px 42px;
  color: var(--text-main);
  font-size: 15px;
  transition: all var(--transition-normal);
  font-weight: 500;
}

input::placeholder {
  color: var(--text-dim);
  opacity: 0.6;
}

input:hover:not(:disabled) {
  border-color: var(--neon-cyan);
  background: rgba(255, 255, 255, 0.04);
}

input:focus {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow: 
    0 0 20px rgba(34, 211, 238, 0.4),
    inset 0 0 10px rgba(34, 211, 238, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  left: 14px;
  pointer-events: none;
  font-size: 18px;
  opacity: 0.7;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.strength-bar {
  flex-grow: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  display: block;
  height: 100%;
  width: 0;
  transition: all 0.3s ease;
}

.strength-bar.weak::after {
  width: 25%;
  background: #fb7185;
}

.strength-bar.fair::after {
  width: 50%;
  background: #fbbf24;
}

.strength-bar.good::after {
  width: 75%;
  background: #60a5fa;
}

.strength-bar.strong::after {
  width: 100%;
  background: #4ade80;
}

.strength-bar.very-strong::after {
  width: 100%;
  background: var(--neon-cyan);
}

.strength-text {
  color: var(--text-dim);
  font-weight: 500;
}

.validation-message {
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.validation-message.error {
  color: #fb7185;
}

.validation-message.success {
  color: #4ade80;
}

.btn-register {
  padding: 16px;
  background: linear-gradient(135deg, var(--neon-cyan), #0891b2);
  color: var(--bg-secondary);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 
    0 0 20px var(--neon-cyan-glow),
    0 8px 16px rgba(0, 0, 0, 0.2);
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.8s ease-out;
}

.btn-register::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-register:hover:not(:disabled)::before {
  left: 100%;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 
    0 0 30px var(--neon-cyan),
    0 12px 24px rgba(0, 0, 0, 0.3);
  filter: brightness(1.15);
}

.btn-register:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-register:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.error-message {
  background: rgba(251, 113, 133, 0.15);
  color: #fb7185;
  font-size: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(251, 113, 133, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideDown 0.3s ease-out;
  margin-bottom: 20px;
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.success-message {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  font-size: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(74, 222, 128, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideDown 0.3s ease-out;
  margin-bottom: 20px;
}

.success-icon {
  font-size: 18px;
  flex-shrink: 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
}

.login-link {
  color: var(--text-dim);
  font-size: 14px;
  margin: 0;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.login-link a {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 700;
  transition: all var(--transition-fast);
  position: relative;
}

.login-link a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--neon-cyan);
  transition: width var(--transition-fast);
}

.login-link a:hover {
  text-shadow: 0 0 12px var(--neon-cyan-glow);
}

.login-link a:hover::after {
  width: 100%;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .auth-box {
    padding: 45px 30px;
  }

  h1 {
    font-size: 28px;
  }

  .auth-container::before,
  .auth-container::after {
    display: none;
  }

  .btn-register {
    padding: 14px;
    font-size: 14px;
  }

  input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>
