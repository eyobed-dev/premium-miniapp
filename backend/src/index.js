const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pricesRouter = require('./routes/prices');
app.use('/api/prices', pricesRouter);

const paymentInfoRouter = require('./routes/paymentInfo');
app.use('/api/payment-info', paymentInfoRouter);

// TODO: Add routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 