<script>
  import Router from 'svelte-spa-router';
  import Home from './pages/Home.svelte';
  import Service from './pages/Service.svelte';
  import Payment from './pages/Payment.svelte';
  import Success from './pages/Success.svelte';
  import Failure from './pages/Failure.svelte';

  const routes = {
    '/': Home,
    '/service': Service,
    '/payment': Payment,
    '/success': Success,
    '/failure': Failure
  };
</script>

<Router {routes} />

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
