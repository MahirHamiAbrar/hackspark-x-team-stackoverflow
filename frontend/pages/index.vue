<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-content">
        <h1>Welcome to RentPi</h1>
        <p>Rent anything. Anytime. Anywhere.</p>
        <NuxtLink to="/products" class="btn-primary">Browse Products</NuxtLink>
      </div>
    </section>

    <section class="features">
      <h2>Why Choose RentPi?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Wide Selection</h3>
          <p>Choose from thousands of rental items across multiple categories</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Affordable Pricing</h3>
          <p>Get great deals on rental items with flexible pricing options</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Secure Transactions</h3>
          <p>Safe and secure rental process with verified users</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">⚡</div>
          <h3>Fast Delivery</h3>
          <p>Quick rental process and fast delivery to your location</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <h2>Ready to rent?</h2>
      <p>Create an account to get started</p>
      <NuxtLink to="/auth/register" class="btn-secondary">Sign Up Now</NuxtLink>
    </section>

    <footer class="footer">
      <p>&copy; 2026 RentPi. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero {
  position: relative;
  padding: 160px 20px;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--neon-cyan-glow) 0%, transparent 70%);
  filter: blur(80px);
  z-index: -1;
  opacity: 0.15; /* Reduced opacity to let background show through */
  mix-blend-mode: overlay; /* Use overlay for better integration with background image */
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  z-index: 1;
}

.hero h1 {
  font-size: 72px;
  margin-bottom: 24px;
  font-weight: 900;
  background: linear-gradient(to bottom, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}

.hero p {
  font-size: 24px;
  margin-bottom: 48px;
  color: var(--text-dim);
  font-weight: 400;
}

.btn-primary {
  display: inline-block;
  background: transparent;
  color: var(--neon-cyan);
  padding: 16px 40px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  border: 1px solid var(--neon-cyan);
  box-shadow: 0 0 15px var(--neon-cyan-glow);
  transition: all var(--transition-normal);
  backdrop-filter: var(--glass-blur);
}

.btn-primary:hover {
  transform: translateY(-5px);
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  box-shadow: 0 0 30px var(--neon-cyan);
}

.features {
  max-width: 1200px;
  margin: 100px auto;
  padding: 0 20px;
  width: 100%;
}

.features h2 {
  font-size: 42px;
  text-align: center;
  margin-bottom: 64px;
  color: var(--text-main);
  font-weight: 800;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  padding: 48px 32px;
  border-radius: 24px;
  text-align: center;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-12px);
  border-color: var(--neon-cyan);
  box-shadow: 0 10px 40px -10px var(--neon-cyan-glow);
}

.feature-icon {
  font-size: 56px;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
}

.feature-card h3 {
  color: var(--text-main);
  margin-bottom: 16px;
  font-size: 24px;
}

.feature-card p {
  color: var(--text-dim);
  font-size: 16px;
  line-height: 1.6;
}

.cta {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  padding: 80px 40px;
  text-align: center;
  margin: 60px 20px;
  border-radius: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.cta::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: var(--neon-cyan-glow);
  filter: blur(60px);
  z-index: -1;
}

.cta h2 {
  font-size: 48px;
  margin-bottom: 24px;
  color: var(--text-main);
  font-weight: 800;
}

.cta p {
  font-size: 20px;
  margin-bottom: 40px;
  color: var(--text-dim);
}

.btn-secondary {
  display: inline-block;
  background: var(--neon-cyan);
  color: var(--bg-secondary);
  padding: 16px 48px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 18px;
  transition: all var(--transition-normal);
  box-shadow: 0 0 20px var(--neon-cyan-glow);
}

.btn-secondary:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 0 35px var(--neon-cyan);
}

.footer {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-top: 1px solid var(--glass-border);
  color: var(--text-dim);
  text-align: center;
  padding: 40px;
  margin-top: auto;
}

.footer p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero {
    padding: 100px 20px;
  }

  .hero h1 {
    font-size: 48px;
  }

  .hero p {
    font-size: 18px;
  }

  .nav-links {
    gap: 15px;
  }

  .features h2,
  .cta h2 {
    font-size: 32px;
  }
}
</style>
