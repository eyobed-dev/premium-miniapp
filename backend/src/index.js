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

const userRouter = require('./routes/user');
app.use('/api/users', userRouter);

const orderRouter = require('./routes/order');
app.use('/api/orders', orderRouter);

const paymentRouter = require('./routes/paymentInfo');
app.use('/api/payments', paymentRouter);

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 