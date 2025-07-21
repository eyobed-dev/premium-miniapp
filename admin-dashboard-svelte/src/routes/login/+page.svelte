<script>
  import { adminToken } from '../stores/auth';
  import { goto } from '$app/navigation';
  let username = '';
  let password = '';
  let error = '';

  async function handleLogin(e) {
    e.preventDefault();
    error = '';
    // Demo: Accept any login, set token
    if (username && password) {
      adminToken.set('demo_token');
      goto('/');
    } else {
      error = 'Please enter username and password';
    }
  }
</script>

<div class="section">
  <div class="container" style="max-width: 400px;">
    <h1 class="title">Admin Login</h1>
    {#if error}
      <div class="notification is-danger">{error}</div>
    {/if}
    <form on:submit|preventDefault={handleLogin}>
      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input class="input" type="text" bind:value={username} required />
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" bind:value={password} required />
        </div>
      </div>
      <button class="button is-primary is-fullwidth" type="submit">Login</button>
    </form>
  </div>
</div>
