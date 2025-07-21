import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proofFiles, setProofFiles] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      setError('Failed to fetch orders');
      if (e.message === 'Unauthorized') {
        localStorage.removeItem('admin_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_BASE}/orders/${orderId}/proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payment_proof: file.name })
      });
      fetchOrders();
    } catch (e) {
      alert('Failed to upload proof');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="section">
      <div className="level mb-4">
        <div className="level-left">
          <h1 className="title">Orders</h1>
        </div>
        <div className="level-right">
          <button className="button is-light" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="field mb-4">
        <label className="label">Status Filter</label>
        <div className="control">
          <div className="select">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>
      {loading ? <progress className="progress is-small is-primary" max="100">Loading...</progress> : error ? <p className="has-text-danger">{error}</p> : (
        <div className="table-container">
          <table className="table is-striped is-fullwidth">
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
              {filteredOrders.map(order => (
                <tr key={order.id}>
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
                    {order.status !== 'completed' && (
                      <button className="button is-small is-success mr-1" onClick={() => handleStatusChange(order.id, 'completed')}>Mark Completed</button>
                    )}
                    {order.status !== 'failed' && (
                      <button className="button is-small is-danger mr-1" onClick={() => handleStatusChange(order.id, 'failed')}>Mark Failed</button>
                    )}
                    <input type="file" className="input is-small mb-1" onChange={e => handleProofChange(order.id, e.target.files[0])} />
                    <button className="button is-small is-link" onClick={() => handleProofUpload(order.id)}>Upload Proof</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders; 