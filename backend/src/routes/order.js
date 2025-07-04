const express = require('express');
const router = express.Router();
const orderModel = require('../models/order');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const order = req.body;
    const orderId = await orderModel.createOrder(order);
    res.status(201).json({ orderId });
  } catch (err) {
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

module.exports = router; 