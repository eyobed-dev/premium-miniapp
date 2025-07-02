const express = require('express');
const router = express.Router();

// Updated prices for demonstration
const prices = {
  meseretmedia: { monthly: 200, yearly: 2000 },
  wazemaradio: { monthly: 250, yearly: 2500 },
  telegrampro: { monthly: 150, yearly: 1500 },
  telegramstars: [
    { amount: 100, price: 100 },
    { amount: 250, price: 240 },
    { amount: 500, price: 450 },
    { amount: 1000, price: 800 }
  ],
  chatgptpro: { monthly: 500 },
};

router.get('/', (req, res) => {
  res.json(prices);
});

module.exports = router; 