import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proofFiles, setProofFiles] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/orders/all`);
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleProofChange = (orderId, file) => {
    setProofFiles({ ...proofFiles, [orderId]: file });
  };

  // For demo, proof upload just updates payment_proof as text
  const handleProofUpload = async (orderId) => {
    const file = proofFiles[orderId];
    if (!file) return;
    // In real app, upload file to server or S3, here just set as filename
    try {
      await fetch(`${API_BASE}/orders/${orderId}/proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_proof: file.name })
      });
      fetchOrders();
    } catch (e) {
      alert('Failed to upload proof');
    }
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div style={{ padding: 24 }}>
      <h1>Orders</h1>
      <div style={{ marginBottom: 16 }}>
        <label>Status Filter: </label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.payer_name || order.user_id}</td>
                <td>{order.service_type}</td>
                <td>{order.amount}</td>
                <td>{order.status}</td>
                <td>{order.payment_proof || '-'}</td>
                <td>
                  {order.status !== 'completed' && (
                    <button onClick={() => handleStatusChange(order.id, 'completed')}>Mark Completed</button>
                  )}
                  {order.status !== 'failed' && (
                    <button onClick={() => handleStatusChange(order.id, 'failed')}>Mark Failed</button>
                  )}
                  <input type="file" onChange={e => handleProofChange(order.id, e.target.files[0])} />
                  <button onClick={() => handleProofUpload(order.id)}>Upload Proof</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders; 