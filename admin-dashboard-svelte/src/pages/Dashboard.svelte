<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  let orders = [];
  let loading = false;
  let error = '';
  let actionLoading = {};
  let proofFiles = {};

  function logout() {
    localStorage.removeItem('admin_token');
    push('/login');
  }

  async function fetchOrders() {
    loading = true;
    error = '';
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('http://localhost:5000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          return;
        }
        error = 'Failed to fetch orders';
        return;
      }
      orders = await res.json();
    } catch (err) {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    actionLoading[orderId] = true;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        error = 'Failed to update status';
        return;
      }
      await fetchOrders();
    } catch (err) {
      error = 'Network error';
    } finally {
      actionLoading[orderId] = false;
    }
  }

  function handleProofChange(orderId, file) {
    proofFiles = { ...proofFiles, [orderId]: file };
  }

  async function uploadProof(orderId) {
    const file = proofFiles[orderId];
    if (!file) return;
    actionLoading[orderId] = true;
    try {
      const token = localStorage.getItem('admin_token');
      // For demo, just send file name as proof
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/proof`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payment_proof: file.name })
      });
      if (!res.ok) {
        error = 'Failed to upload proof';
        return;
      }
      await fetchOrders();
    } catch (err) {
      error = 'Network error';
    } finally {
      actionLoading[orderId] = false;
    }
  }

  onMount(() => {
    if (!localStorage.getItem('admin_token')) {
      push('/login');
    } else {
      fetchOrders();
    }
  });
</script>

<h1>Admin Dashboard</h1>
<button on:click={logout} style="margin-bottom: 2rem;">Logout</button>

{#if loading}
  <p>Loading orders...</p>
{:else if error}
  <p style="color: red;">{error}</p>
{:else}
  <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
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
      {#each orders as order}
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
              <button on:click={() => updateOrderStatus(order.id, 'completed')} disabled={actionLoading[order.id]}>Mark Completed</button>
            {/if}
            {#if order.status !== 'failed'}
              <button on:click={() => updateOrderStatus(order.id, 'failed')} disabled={actionLoading[order.id]}>Mark Failed</button>
            {/if}
            <input type="file" on:change={e => handleProofChange(order.id, e.target.files[0])} />
            <button on:click={() => uploadProof(order.id)} disabled={actionLoading[order.id]}>Upload Proof</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if} 