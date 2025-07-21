import { adminToken } from '../stores/auth';
import { goto } from '$app/navigation';

const API_BASE = 'http://localhost:5000/api';

export async function fetchOrders() {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE}/orders/all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 401) {
      adminToken.set(null);
      goto('/login');
    }
    throw new Error('Failed to fetch orders');
  }
  return await res.json();
}

export async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error('Failed to update status');
}

export async function uploadProof(orderId, file) {
  const token = localStorage.getItem('admin_token');
  // For demo, just send file name as proof
  const res = await fetch(`${API_BASE}/orders/${orderId}/proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ payment_proof: file.name })
  });
  if (!res.ok) throw new Error('Failed to upload proof');
}
