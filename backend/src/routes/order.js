const express = require('express');
const router = express.Router();
const orderModel = require('../models/order');
const userModel = require('../models/user');
const axios = require('axios');
const adminAuth = require('../middleware/auth');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = req.body;
    console.log('Received order:', order);
    let user_id = order.user_id;
    // If telegram_id is provided, look up or create user
    if (!user_id && order.telegram_id) {
      let user = await userModel.getUserByTelegramId(order.telegram_id);
      if (!user) {
        console.log('No user found for telegram_id, creating new user:', order.telegram_id);
        user_id = await userModel.createUser({
          telegram_id: order.telegram_id,
          telegram_username: order.telegram_username || '',
          first_name: order.payer_name || '',
          last_name: '',
          language_code: ''
        });
        console.log('Created new user with id:', user_id);
      } else {
        user_id = user.id;
        console.log('Found existing user with id:', user_id);
      }
    }
    // If no user_id and no telegram_id, reject the order
    if (!user_id && !order.telegram_id) {
      console.warn('Order rejected: no user_id or telegram_id');
      return res.status(400).json({ error: 'Order must be associated with a user or telegram_id' });
    }
    order.user_id = user_id;
    // Pass payer_account if present
    const orderData = {
      ...order,
      user_id,
      payer_account: order.payer_account || null
    };
    const orderId = await orderModel.createOrder(orderData);
    console.log('Order created with id:', orderId);
    res.status(201).json({ orderId });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders for a user
router.get('/user/:user_id', async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const orders = await orderModel.getOrdersByUser(user_id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const order = await orderModel.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    await orderModel.updateOrderStatus(id, status);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all orders (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const pool = require('../db/connection');
    const [orders] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order proof
router.patch('/:id/proof', async (req, res) => {
  try {
    const id = req.params.id;
    const { payment_proof } = req.body;
    const pool = require('../db/connection');
    await pool.execute('UPDATE orders SET payment_proof = ? WHERE id = ?', [payment_proof, id]);
    res.json({ message: 'Order proof updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order proof' });
  }
});

// Simulate Android SMS sender for a given orderId (for testing/demo only)
router.post('/simulate-sms/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  console.log('Simulate SMS endpoint called for orderId:', orderId);
  try {
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      console.warn('Simulate SMS: Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'pending') {
      console.warn('Simulate SMS: Order is not pending:', orderId);
      return res.status(400).json({ error: 'Order is not pending' });
    }
    // Simulate delay (e.g., 3 seconds)
    setTimeout(async () => {
      try {
        // Simulate a transaction ID
        const txn_id = 'SIMTXN-' + Math.floor(Math.random() * 1000000);
        console.log('Simulate SMS: Sending payment notification for orderId:', orderId, 'txn_id:', txn_id);
        // POST to the SMS endpoint
        await axios.post('http://localhost:5000/api/payment-info/sms', {
          payer_name: order.payer_name,
          payer_phone: order.payer_phone,
          amount: order.amount,
          txn_id
        });
        console.log('Simulate SMS: Payment notification sent for orderId:', orderId);
      } catch (err) {
        // Log error but don't crash
        console.error('Simulation failed:', err.message);
      }
    }, 3000); // 3 second delay
    res.json({ message: 'SMS simulation started (will mark as paid in ~3s)' });
  } catch (err) {
    console.error('Simulate SMS: Failed to simulate SMS payment:', err);
    res.status(500).json({ error: 'Failed to simulate SMS payment' });
  }
});

module.exports = router; 