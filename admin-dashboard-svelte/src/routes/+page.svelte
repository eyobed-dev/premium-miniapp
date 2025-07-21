<script>
  import { onMount } from 'svelte';
  import { fetchOrders, updateOrderStatus, uploadProof } from '../lib/api.js';
  import { adminToken } from '../stores/auth';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let orders = [];
  let statusFilter = 'all';
  let loading = false;
  let error = '';
  let proofFiles = {};

  onMount(async () => {
    if (!get(adminToken)) {
      goto('/login');
      return;
    }
    await loadOrders();
  });

  async function loadOrders() {
    loading = true;
    error = '';
    try {
      orders = await fetchOrders();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (e) {
      error = e.message;
    }
  }

  function handleProofChange(orderId, file) {
    proofFiles = { ...proofFiles, [orderId]: file };
  }

  async function handleProofUpload(orderId) {
    const file = proofFiles[orderId];
    if (!file) return;
    try {
      await uploadProof(orderId, file);
      await loadOrders();
    } catch (e) {
      error = e.message;
    }
  }

  function handleLogout() {
    adminToken.set(null);
    goto('/login');
  }

  $: filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
</script>

<div class="section">
  <div class="level mb-4">
    <div class="level-left">
      <h1 class="title">Orders</h1>
    </div>
    <div class="level-right">
      <button class="button is-light" on:click={handleLogout}>Logout</button>
    </div>
  </div>
  <div class="field mb-4">
    <label class="label">Status Filter</label>
    <div class="control">
      <div class="select">
        <select bind:value={statusFilter}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  </div>
  {#if loading}
    <progress class="progress is-small is-primary" max="100">Loading...</progress>
  {:else if error}
    <p class="has-text-danger">{error}</p>
  {:else}
    <div class="table-container">
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Service</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Payer Name</th>
            <th>Payer Phone</th>
            <th>Payer Account</th>
            <th>Status</th>
            <th>Proof</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredOrders as order}
            <tr>
              <td>{order.id}</td>
              <td>{order.user_id}</td>
              <td>{order.service_type}</td>
              <td>{order.amount}</td>
              <td>{order.payment_method}</td>
              <td>{order.payer_name}</td>
              <td>{order.payer_phone}</td>
              <td>{order.payer_account}</td>
              <td>{order.status}</td>
              <td>{order.payment_proof || '-'}</td>
              <td>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</td>
              <td>
                {#if order.status !== 'completed'}
                  <button class="button is-small is-success mr-1" on:click={() => handleStatusChange(order.id, 'completed')}>Mark Completed</button>
                {/if}
                {#if order.status !== 'failed'}
                  <button class="button is-small is-danger mr-1" on:click={() => handleStatusChange(order.id, 'failed')}>Mark Failed</button>
                {/if}
                <input type="file" class="input is-small mb-1" on:change={e => handleProofChange(order.id, e.target.files[0])} />
                <button class="button is-small is-link" on:click={() => handleProofUpload(order.id)}>Upload Proof</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
