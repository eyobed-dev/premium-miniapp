const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    telebirrPhone: process.env.TELEBIRR_PHONE || '',
    cbebirrPhone: process.env.CBEBIRR_PHONE || '',
    cbeAccount: process.env.CBE_ACCOUNT || '',
    telebirrName: process.env.TELEBIRR_NAME || '',
    cbebirrName: process.env.CBEBIRR_NAME || '',
    cbeAccountName: process.env.CBE_ACCOUNT_NAME || '',
    telebirrDeepLink: process.env.TELEBIRR_DEEPLINK || '',
    cbebirrDeepLink: process.env.CBEBIRR_DEEPLINK || '',
    cbeDirectDeepLink: process.env.CBE_DIRECT_DEEPLINK || ''
  });
});

module.exports = router; 