<script>
  import Router from 'svelte-spa-router';
  import routes from './routes.js';
</script>

<nav style="padding: 1rem; background: #f5f5f5; border-bottom: 1px solid #ddd;">
  <a href="#/" style="margin-right: 1rem;">Dashboard</a>
  <a href="#/login">Login</a>
</nav>

<main style="padding: 2rem;">
  <Router {routes} />
</main>

<style>
  nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  nav a:hover {
    color: #0070f3;
  }
</style>
