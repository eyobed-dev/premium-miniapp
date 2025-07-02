const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    telebirrPhone: process.env.TELEBIRR_PHONE || '',
    cbebirrPhone: process.env.CBEBIRR_PHONE || '',
    cbeAccount: process.env.CBE_ACCOUNT || ''
  });
});

module.exports = router; 