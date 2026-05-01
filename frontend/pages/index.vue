<template>
  <div class="home-container">
    <nav class="navbar">
      <div class="nav-content">
        <h1 class="logo">RentPi</h1>
        <div class="nav-links">
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/products">Products</NuxtLink>
          <NuxtLink to="/auth/login" class="btn-login">Login</NuxtLink>
        </div>
      </div>
    </nav>

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
  background: #FFFFE3;
}

.navbar {
  background: #CBCBCB;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  color: #6D81D3;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4A4A4A;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #6D81D3;
}

.btn-login {
  background: #6D81D3;
  color: white !important;
  padding: 8px 16px;
  border-radius: 5px;
}

.hero {
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
  color: white;
  padding: 100px 20px;
  text-align: center;
  flex: 1;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 15px;
}

.hero p {
  font-size: 24px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.btn-primary {
  display: inline-block;
  background: #FFFFE3;
  color: #6D81D3;
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.features {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
  width: 100%;
}

.features h2 {
  font-size: 32px;
  text-align: center;
  margin-bottom: 40px;
  color: #4A4A4A;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: #FFFFE3;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  color: #4A4A4A;
  margin-bottom: 10px;
}

.feature-card p {
  color: #4A4A4A;
  font-size: 14px;
  line-height: 1.6;
}

.cta {
  background: linear-gradient(135deg, #6D81D3 0%, #4A4A4A 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin: 40px 20px;
  border-radius: 10px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.cta h2 {
  font-size: 32px;
  margin-bottom: 15px;
}

.cta p {
  font-size: 18px;
  margin-bottom: 25px;
  opacity: 0.9;
}

.btn-secondary {
  display: inline-block;
  background: #FFFFE3;
  color: #6D81D3;
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-secondary:hover {
  transform: translateY(-2px);
}

.footer {
  background: #4A4A4A;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 32px;
  }

  .hero p {
    font-size: 18px;
  }

  .nav-links {
    gap: 15px;
  }

  .features h2,
  .cta h2 {
    font-size: 24px;
  }
}
</style>
