<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  // If already logged in, redirect to dashboard
  onMount(() => {
    if (localStorage.getItem('admin_token')) {
      push('/');
    }
  });

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Login failed';
        loading = false;
        return;
      }
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      push('/');
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<h1>Admin Login</h1>
<form on:submit={handleLogin} style="max-width: 400px; margin: 2rem auto;">
  {#if error}
    <div style="color: red; margin-bottom: 1rem;">{error}</div>
  {/if}
  <div style="margin-bottom: 1rem;">
    <label>Username</label>
    <input type="text" bind:value={username} required style="width: 100%; padding: 0.5rem;" />
  </div>
  <div style="margin-bottom: 1rem;">
    <label>Password</label>
    <input type="password" bind:value={password} required style="width: 100%; padding: 0.5rem;" />
  </div>
  <button type="submit" disabled={loading} style="width: 100%; padding: 0.75rem; font-weight: bold; background: #0070f3; color: white; border: none; border-radius: 4px;">
    {#if loading}Logging in...{:else}Login{/if}
  </button>
</form> 