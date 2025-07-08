<script>
  import { onMount } from 'svelte';

  let paymentMethod = 'telebirr';
  let orderDetails = {};
  let paymentInfo = {};
  let showModal = false;
  let payerName = '';
  let payerPhone = '';
  let txnNo = '';
  let accountNumber = '';
  let accountName = '';
  let accountLogo = '';
  let accountLabel = '';
  let payError = '';
  let telegramUser = null;
  let showManual = false;
  let deepLink = '';
  let paymentStatus = 'waiting'; // 'waiting', 'success', 'failure', 'manual'
  let pollInterval = null;
  let isPolling = false;
  let pollCount = 0;
  const MAX_POLLS = 30; // e.g. 30 x 4s = 2 minutes
  let orderId = null;

  // Add a reactive border color for the tab group and active tab
  $: borderColor = paymentMethod === 'telebirr' ? '#4bbf7b' : '#951781';
 $: activeTabTransparentBg = paymentMethod === 'telebirr' ? 'rgba(75, 191, 123, 0.15)' : 'rgba(149, 23, 129, 0.15)';


  onMount(async () => {
    let hash = window.location.hash || '';
    let queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    orderDetails = {
      type: params.get('type'),
      email: params.get('email'),
      username: params.get('username'),
      duration: params.get('duration'),
      amount: params.get('amount'),
    };
    // Fetch payment info from backend
    try {
      const res = await fetch('http://localhost:5000/api/payment-info');
      if (res.ok) {
        paymentInfo = await res.json();
      }
    } catch (e) {
      paymentInfo = {};
    }
    // Get Telegram user info from WebApp
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      // @ts-ignore
      telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
    }
  });

  async function pay() {
    if ((paymentMethod === 'telebirr' || paymentMethod === 'cbebirr') && (!payerName.trim() || !payerPhone.trim())) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (paymentMethod === 'cbe_direct' && !payerName.trim()) {
      alert('Please enter your name.');
      return;
    }
    // Open deep link if available
    if (deepLink) {
      window.open(deepLink, '_blank');
    }
    // Create pending order in backend
    try {
      const orderPayload = {
        service_type: orderDetails.type,
        service_identifier: orderDetails.email || orderDetails.username || '',
        amount: orderDetails.amount,
        payment_method: paymentMethod,
        payer_name: payerName,
        payer_phone: payerPhone,
        status: 'pending',
        payment_proof: null,
        telegram_id: telegramUser ? telegramUser.id : null,
        telegram_username: telegramUser ? telegramUser.username : null
      };
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Order creation failed');
      const data = await res.json();
      orderId = data.orderId;
    } catch (e) {
      alert('Failed to create order. Please try again.');
      return;
    }
    showModal = true;
    paymentStatus = 'waiting';
    pollCount = 0;
    startPolling();
  }

  function startPolling() {
    if (isPolling) return;
    isPolling = true;
    pollInterval = setInterval(checkPaymentStatus, 4000);
  }

  async function checkPaymentStatus() {
    pollCount++;
    if (!orderId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Order fetch failed');
      const order = await res.json();
      if (order.status === 'paid') {
        paymentStatus = 'success';
        stopPolling();
        return;
      }
      if (order.status === 'failed') {
        paymentStatus = 'failure';
        stopPolling();
        return;
      }
    } catch (e) {
      // Optionally handle error
    }
    if (pollCount > MAX_POLLS) {
      paymentStatus = 'manual';
      stopPolling();
      return;
    }
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    isPolling = false;
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function showManualProof() {
    paymentStatus = 'manual';
    stopPolling();
  }

  async function submitManualProof() {
    // Here you would send txnNo and other info to backend for manual verification
    paymentStatus = 'waiting';
    pollCount = 0;
    startPolling();
  }

  function getInstruction() {
    let amount = orderDetails.amount || '';
    if (paymentMethod === 'telebirr') {
      return `Send <b>${amount} ETB</b> to <span class='copyable'>${paymentInfo.telebirrPhone || '...'}</span> (<b>${paymentInfo.telebirrName || '...'}</b>) using Telebirr. <button class='copy-btn' onclick=\"navigator.clipboard.writeText('${paymentInfo.telebirrPhone || ''}')\">Copy</button><br>After payment, upload your transaction number or screenshot as proof.`;
    } else if (paymentMethod === 'cbebirr') {
      return `Send <b>${amount} ETB</b> to <span class='copyable'>${paymentInfo.cbebirrPhone || '...'}</span> (<b>${paymentInfo.cbebirrName || '...'}</b>) using CBE Birr. <button class='copy-btn' onclick=\"navigator.clipboard.writeText('${paymentInfo.cbebirrPhone || ''}')\">Copy</button><br>After payment, upload your transaction number or screenshot as proof.`;
    } else if (paymentMethod === 'cbe_direct') {
      return `Deposit <b>${amount} ETB</b> to account <span class="copyable">${paymentInfo.cbeAccount || '...'}</span> (<b>${paymentInfo.cbeAccountName || '...'}</b>) via CBE mobile. <button class='copy-btn' onclick=\"navigator.clipboard.writeText('${paymentInfo.cbeAccount || ''}')\">Copy</button><br>After payment, upload your transaction number or screenshot as proof.`;
    }
    return '';
  }

  // Update account details on payment method change
  $: if (paymentMethod === 'telebirr') {
    accountNumber = paymentInfo?.telebirrPhone || '';
    accountName = paymentInfo?.telebirrName || '';
    accountLogo = '/src/icons/Telebirr.png';
    accountLabel = 'Telebirr';
    deepLink = paymentInfo?.telebirrDeepLink || '';
  } else if (paymentMethod === 'cbebirr') {
    accountNumber = paymentInfo?.cbebirrPhone || '';
    accountName = paymentInfo?.cbebirrName || '';
    accountLogo = '/src/icons/cbebirr.jpeg';
    accountLabel = 'CBE Birr';
    deepLink = paymentInfo?.cbebirrDeepLink || '';
  } else if (paymentMethod === 'cbe_direct') {
    accountNumber = paymentInfo?.cbeAccount || '';
    accountName = paymentInfo?.cbeAccountName || '';
    accountLogo = '/src/icons/cbe.png';
    accountLabel = 'CBE Mobile';
    deepLink = paymentInfo?.cbeDirectDeepLink || '';
  }
</script>

<main class="payment-container">
  <h2>Choose Payment Method</h2>
  <div class="payment-tabs-group" style="border-color: {borderColor}; background: {activeTabTransparentBg};">
    <div class="payment-tabs">
      <div
        class="payment-tab {paymentMethod === 'telebirr' ? 'active' : ''}"
        on:click={() => paymentMethod = 'telebirr'}
      >
        <img src="/src/icons/Telebirr.png" alt="Telebirr" class="tab-icon" />
        <span>Telebirr</span>
      </div>
      <div
        class="payment-tab {paymentMethod === 'cbebirr' ? 'active' : ''}"
        on:click={() => paymentMethod = 'cbebirr'}
      >
        <img src="/src/icons/cbebirr.jpeg" alt="CBE Birr" class="tab-icon" />
        <span>CBE Birr</span>
      </div>
      <div
        class="payment-tab {paymentMethod === 'cbe_direct' ? 'active' : ''}"
        on:click={() => paymentMethod = 'cbe_direct'}
      >
        <img src="/src/icons/cbe.png" alt="CBE Direct" class="tab-icon" />
        <span>CBE Direct</span>
      </div>
    </div>
    <form class="payment-form" on:submit|preventDefault={pay} style="border-left: 0; border-color: {borderColor};">

      {#if paymentMethod === 'telebirr' || paymentMethod === 'cbebirr'}
        <div class="extra-fields">
          <label>
            Name:
            <input type="text" bind:value={payerName} placeholder="Name on the account" required />
          </label>
          <label>
            Phone Number:
            <input type="tel" bind:value={payerPhone} placeholder="09xxxxxxxx"   />
          </label>
        </div>
      {/if}
      {#if paymentMethod === 'cbe_direct'}
        <div class="extra-fields">
          <label>
            Name:
            <input type="text" bind:value={payerName} placeholder="Name on the account" required />
          </label>
        </div>
      {/if}
      <div class="amount-prominent">
        Amount to pay: <b>{orderDetails.amount || '-'} ETB</b>
      </div>
      <button type="submit" class="btn pay-btn">
        <img src={accountLogo} alt={accountLabel} class="pay-btn-icon" />
        Pay with {accountLabel}
      </button>
    </form>
  </div>
  <div class="payment-footer">
    <div class="footer-info">
      <strong>Nexterra</strong>, a No middleman interoperable payment system for merchants.
      <br />
      Based on Ethswitch
    </div>
  </div>

  {#if showModal}
    <div class="modal-backdrop"></div>
    <div class="modal">
      {#if paymentStatus === 'waiting'}
        <h3>Waiting for your payment...</h3>
        <div class="spinner"></div>
        <div class="amount-info">Amount: <b>{orderDetails.amount || '-'} ETB</b></div>
        <div style="display: flex; flex-direction:column; gap: 1rem; margin: 1.5rem; justify-content: center;">
          <button class="btn" on:click={showManualProof}>Pay manually</button>
          <button class="modal-close" on:click={() => { showModal = false; stopPolling(); }}>Cancel</button>
        </div>
        {#if showManual}
          <div class="pay-instruction-box" style="margin-top: 1.5rem;">
            <div class="pay-instruction-header">
              <img src={accountLogo} alt="logo" class="pay-instruction-logo" />
              <span class="pay-instruction-label">{accountLabel}</span>
            </div>
            <div class="pay-instruction-details">
              <div class="pay-instruction-row">
                <span class="pay-instruction-number">{accountNumber || '...'}</span>
                <button class="copy-btn-2" on:click={() => copyToClipboard(accountNumber)} title="Copy to clipboard">
                  📋 Copy
                </button>
              </div>
              <div class="pay-instruction-name">{accountName || '...'}</div>
            </div>
            <div class="pay-instruction-amount">
              <span>Amount:</span> <b>{orderDetails.amount || '-'} ETB</b>
            </div>
          </div>
          <input type="text" bind:value={txnNo} placeholder="Enter transaction number" style="margin-top:0.5rem; width:100%;" />
          <button class="btn" on:click={submitManualProof} style="margin-top:1.2rem;">Submit Proof</button>
        {/if}
      {:else if paymentStatus === 'success'}
        <h3>Payment Successful!</h3>
        <div class="success-check">✔️</div>
        <div class="amount-info">Amount: <b>{orderDetails.amount || '-'} ETB</b></div>
        <p style="color: #2ecc40; margin-top: 1rem;">Thank you for your payment. Your order is being processed.</p>
        <button class="btn" on:click={() => { showModal = false; window.location.hash = '#/'; }}>Back to Home</button>
      {:else if paymentStatus === 'failure'}
        <h3>Payment Failed</h3>
        <div class="fail-x">❌</div>
        <p style="color: #e74c3c; margin-top: 1rem;">Sorry, we could not verify your payment. Please try again or enter proof manually.</p>
        <button class="btn" on:click={showManualProof}>Enter payment proof manually</button>
        <button class="modal-close" on:click={() => showModal = false}>Cancel</button>
      {:else if paymentStatus === 'manual'}
        <h3>Manual Payment Proof</h3>
        <div class="pay-instruction-box">
          <div class="pay-instruction-header">
            <img src={accountLogo} alt="logo" class="pay-instruction-logo" />
            <span class="pay-instruction-label">{accountLabel}</span>
          </div>
          <div class="pay-instruction-details">
            <div class="pay-instruction-row">
              <span class="pay-instruction-number">{accountNumber || '...'}</span>
              <button class="copy-btn-2" on:click={() => copyToClipboard(accountNumber)} title="Copy to clipboard">
                📋 Copy
              </button>
            </div>
            <div class="pay-instruction-name">{accountName || '...'}</div>
          </div>
          <div class="pay-instruction-amount">
            <span>Amount:</span> <b>{orderDetails.amount || '-'} ETB</b>
          </div>
        </div>
        <input type="text" bind:value={txnNo} placeholder="Enter transaction number (optional)" style="margin-top:0.5rem; width:100%;" />
        <button class="btn" on:click={submitManualProof} style="margin-top:1.2rem;">Submit Proof</button>
        <button class="modal-close" on:click={() => showModal = false}>Cancel</button>
      {/if}
      <p style="margin-top:1rem; color:#888; font-size:0.95em;">Our system will check your payment and you will be notified automatically.</p>
    </div>
  {/if}
</main> 

<style>
.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  margin-bottom: 2rem;
}

.payment-tabs-group {
  display: flex;
  flex-direction: row;
  height: fit-content;
  max-width: 600px;
  background: #f7faff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px 0 rgba(75, 75, 75, 0.11);
  border: 0.7px solid #f0fffc;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: border-color 0.8s;
}

.payment-tabs {
  width: 190px;
  min-width: 190px;
  max-width: 190px;
  display: flex;
  flex-direction: column;
  padding: 1.2rem 0rem 1.2rem 0.7rem;
  z-index: 1000;
  gap: 0.3rem;
}

.payment-tab {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem;
  border-radius: 0.7rem 0rem 0rem 0.7rem;
  color: #22223b;
  font-size: 1.08rem;
  position: relative;
  z-index: 1;
}

.payment-tab.active {
  background: #fff;
  color: #2d6cdf;
  font-weight: 600;
  border-radius: 0.7rem 0rem 0rem 0.7rem !important;
  border-left: 1px solid #42424213 !important;
  border-top: 1px solid #42424213 !important;
  border-bottom: 1px solid #42424213 !important;
  z-index: 2;
}

.tab-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
  background: #fff;
}

.payment-form {
  position: relative;
  min-height: 260px;
  padding-bottom: 70px;
  background: #fff;
  border-radius: 0;
  min-width: 0;
  max-width: 100vw;
  flex: 1;
  padding: 2rem 2.5rem;
  margin: 0;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.extra-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.extra-fields label {
  font-size: 1rem;
  color: #22223b;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
}

input[type="text"], input[type="tel"] {
  padding: 0.7rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.2rem;
  width: 100%;
  box-sizing: border-box;
  box-shadow: inset 0 2px 2px 0 rgba(151, 148, 148, 0.158) !important;
}

.amount-info {
  margin-top: 0.7rem;
  font-size: 1.1rem;
  color: #22223b;
}

.pay-btn {

  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 1.5rem;
  background: linear-gradient(180deg, #fff 80%, #f6f7fa 100%);
  color: #22223b;
  border: 1px solid #e0e0e0;
  border-radius: 0.7rem;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.07);
}

.pay-btn:active {
  box-shadow: inset 0 4px 8px 0 rgba(60,60,60,0.13);
  background: linear-gradient(180deg, #f6f7fa 60%, #fff 100%);
}

.pay-btn-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 5px;
  background: #fff;
  border: 1px solid #eee;
}

.payment-footer {
  margin-top: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.98rem;
  letter-spacing: 0.01em;
}



.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
}
.modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 32px 0 rgba(60,60,60,0.18);
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  z-index: 1001;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}



/* Consolidated button styles */
.btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: linear-gradient(180deg, #fff 80%, #f6f7fa 100%);
  color: #22223b;
  border: 1px solid #e0e0e0;
  border-radius: 0.7rem;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 4px 0 rgba(60,60,60,0.07);
  transition: background 0.15s, color 0.15s, border 0.15s, box-shadow 0.15s;
  width: fit-content;
  margin: 0 auto;
  text-decoration: none;
}
.btn:active {
  box-shadow: inset 0 4px 8px 0 rgba(60,60,60,0.13);
  background: linear-gradient(180deg, #f6f7fa 60%, #fff 100%);
}



.modal-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1rem;
  cursor: pointer;
}

.pay-instruction-box {
  background: linear-gradient(90deg, #e6f9ed 0%, #d0f5e6 100%);
  border: 1.5px solid #7ed6a7;
  border-radius: 1rem;
  padding: 1.3rem 1.5rem 1.1rem 1.5rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(60,180,120,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 270px;
  max-width: 100vw;
}
.pay-instruction-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.7rem;
}
.pay-instruction-logo {
  width: 38px;
  height: 38px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #b2f2d7;
}
.pay-instruction-label {
  font-size: 1.1rem;
  color:rgb(65, 65, 65);
  font-weight: 600;
}
.pay-instruction-details {
  width: 100%;
  margin-bottom: 0.5rem;
}
.pay-instruction-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.2rem;
}
.pay-instruction-number {
  font-family: monospace;
  font-size: 1.15rem;
  background: #f4fff8;
  padding: 0.18em 0.7em;
  border-radius: 6px;
  color:rgb(5, 5, 5);
  user-select: all;
  border: 1px solid #b2f2d7;
}
.copy-btn-2 {
  background: #7ed6a7;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.3em 0.9em;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.copy-btn-2:hover {
  background: #4bbf7b;
}
.pay-instruction-name {
  font-size: 1.2rem;
  text-transform: uppercase;
  color:rgb(39, 41, 40);
  margin-left: 2px;
  margin-bottom: 0.2rem;
}
.pay-instruction-amount {
  margin-top: 0.5rem;
  font-size: 1.08rem;
  color: #22223b;
  font-weight: 500;
}



@media (max-width: 700px) {
  .payment-tabs-group {
    flex-direction: column;
    border-radius: 1.2rem;
    box-shadow: 0 2px 12px 0 rgba(60,60,60,0.08);
    max-width: 98vw;
  }
  .payment-tabs {
    flex-direction: row;
    border-right: none;
    padding: 0.7rem 0.7rem 0rem 0.7rem;
    gap: 0.7rem;
    justify-content: center;
    background: #f0f6ff;
    transition: border-color 0.2s;
    width: auto;
    min-width: 0;
    max-width: 100vw;
  }
  .payment-tab {
    border-radius: 0.7rem 0.7rem 0.7rem 0.7rem;
    padding: 0.7rem 0.8rem;
    font-size: 1rem;
    margin-bottom: 0;
  }
  .payment-tab.active {
  background: #fff;
  color: #2d6cdf;
  font-weight: 600;
  border-radius: 0.7rem 0.7rem 0rem 0rem !important;
  border-left: 1px solid #42424213 !important;
  border-top: 1px solid #42424213 !important;
  border-bottom: 1px solid #42424213 !important;
  z-index: 2;
}
  .payment-form {
    border-radius: 0 0 1.2rem 1.2rem;
    padding: 1.5rem 1rem;
    border-left: none;
  }
}


.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f8cff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 1.5rem auto 1.2rem auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.success-check {
  font-size: 3rem;
  color: #2ecc40;
  margin: 1.5rem 0 1.2rem 0;
}
.fail-x {
  font-size: 3rem;
  margin-bottom: 1.2rem;
  text-align: center;
}

.amount-prominent {
  font-size: 1rem;
  font-weight: bold;
  color: #1a3c6b;
  background: linear-gradient(90deg, #e6f0ff 0%, #f7faff 100%);
  border-radius: 0.7rem;
  padding: 1rem 1rem;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.08);
  text-align: center;
  letter-spacing: 0.03em;
  border: 1.5px solid #b2d4fa;
}
</style> 