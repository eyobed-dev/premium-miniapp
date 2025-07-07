<script>
  import { onMount } from 'svelte';

  let paymentMethod = 'telebirr';
  let orderDetails = {};
  let paymentInfo = {};
  let showModal = false;
  let isPaying = false;
  let payerName = '';
  let payerPhone = '';
  let txnNo = '';
  let accountNumber = '';
  let accountName = '';
  let accountLogo = '';
  let accountLabel = '';
  let payError = '';

  let telegramUser = null;

  // Add a reactive border color for the tab group and active tab
  $: borderColor = paymentMethod === 'telebirr' ? '#4bbf7b' : '#7c3aed';
  $: activeTabBg = '#fff'; // content background

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

  function pay() {
    if ((paymentMethod === 'telebirr' || paymentMethod === 'cbebirr') && (!payerName.trim() || !payerPhone.trim())) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (paymentMethod === 'cbe_direct' && !payerName.trim()) {
      alert('Please enter your name.');
      return;
    }
    showModal = true;
  }

  async function confirmPaid() {
    isPaying = true;
    payError = '';
    // Compose order payload
    let orderPayload = {
      service_type: orderDetails.type,
      service_identifier: orderDetails.email || orderDetails.username || '',
      amount: orderDetails.amount,
      payment_method: paymentMethod,
      payer_name: payerName,
      payer_phone: payerPhone,
      status: 'pending',
      payment_proof: txnNo || null
    };
    // Add user info
    if (telegramUser) {
      orderPayload.telegram_id = telegramUser.id;
    }
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        window.location.hash = '#/success';
      } else {
        payError = 'Failed to create order. Please try again.';
        window.location.hash = '#/failure';
      }
    } catch (e) {
      payError = 'Network error. Please try again.';
      window.location.hash = '#/failure';
    } finally {
      isPaying = false;
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
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
    accountNumber = paymentInfo.telebirrPhone || '';
    accountName = paymentInfo.telebirrName || '';
    accountLogo = '/src/icons/Telebirr.png';
    accountLabel = 'Telebirr';
  } else if (paymentMethod === 'cbebirr') {
    accountNumber = paymentInfo.cbebirrPhone || '';
    accountName = paymentInfo.cbebirrName || '';
    accountLogo = '/src/icons/cbebirr.jpeg';
    accountLabel = 'CBE Birr';
  } else if (paymentMethod === 'cbe_direct') {
    accountNumber = paymentInfo.cbeAccount || '';
    accountName = paymentInfo.cbeAccountName || '';
    accountLogo = '/src/icons/cbe.png';
    accountLabel = 'CBE Mobile';
  }
</script>

<main class="payment-container">
  <h2>Choose Payment Method</h2>
  <div class="payment-tabs-group" style="border-color: {borderColor};">
    <div class="payment-tabs">
      <div
        class="payment-tab {paymentMethod === 'telebirr' ? 'active' : ''}"
        style="{paymentMethod === 'telebirr' ? `background:${activeTabBg}; border-color:${borderColor}; box-shadow:inset 0 2px 8px 0 rgba(75,191,123,0.08); z-index:2;` : ''}"
        on:click={() => paymentMethod = 'telebirr'}
      >
        <img src="/src/icons/Telebirr.png" alt="Telebirr" class="tab-icon" />
        <span>Telebirr</span>
      </div>
      <div
        class="payment-tab {paymentMethod === 'cbebirr' ? 'active' : ''}"
        style="{paymentMethod === 'cbebirr' ? `background:${activeTabBg}; border-color:${borderColor}; box-shadow:inset 0 2px 8px 0 rgba(124,58,237,0.08); z-index:2;` : ''}"
        on:click={() => paymentMethod = 'cbebirr'}
      >
        <img src="/src/icons/cbebirr.jpeg" alt="CBE Birr" class="tab-icon" />
        <span>CBE Birr</span>
      </div>
      <div
        class="payment-tab {paymentMethod === 'cbe_direct' ? 'active' : ''}"
        style="{paymentMethod === 'cbe_direct' ? `background:${activeTabBg}; border-color:${borderColor}; box-shadow:inset 0 2px 8px 0 rgba(124,58,237,0.08); z-index:2;` : ''}"
        on:click={() => paymentMethod = 'cbe_direct'}
      >
        <img src="/src/icons/cbe.png" alt="CBE Direct Deposit" class="tab-icon" />
        <span>CBE Direct</span>
      </div>
    </div>
    <form class="payment-form" on:submit|preventDefault={pay} style="border-left: 0; border-color: {borderColor}; background: {activeTabBg};">
      {#if paymentMethod === 'telebirr' || paymentMethod === 'cbebirr'}
        <div class="extra-fields">
          <label>
            Name:
            <input type="text" bind:value={payerName} placeholder="Your name" required />
          </label>
          <label>
            Phone Number:
            <input type="tel" bind:value={payerPhone} placeholder="09xxxxxxxx" required pattern="^09[0-9]{8}$"  />
          </label>
        </div>
      {/if}
      {#if paymentMethod === 'cbe_direct'}
        <div class="extra-fields">
          <label>
            Name:
            <input type="text" bind:value={payerName} placeholder="Your name" required />
          </label>
        </div>
      {/if}
      <button type="submit" class="pay-btn">
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
    <div class="modal-backdrop" on:click={() => showModal = false}></div>
    <div class="modal">
      <h3>Open {accountLabel} App and Pay to this Account and press I have paid</h3>
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
      <div class="modal-content">
        <p style="margin-top:1rem; color:#888; font-size:0.95em;">Our system will check your payment and you will be notified automatically.</p>
        <label style="display:block; margin-top:1rem;">
          Transaction Number (Txn No):
          <input type="text" bind:value={txnNo} placeholder="Enter transaction/reference number (optional)" style="margin-top:0.5rem; width:100%;" />
        </label>
        {#if payError}
          <p style="color:red; margin-top:0.5rem;">{payError}</p>
        {/if}
      </div>
      <button class="pay-btn" on:click={confirmPaid} disabled={isPaying}>{isPaying ? 'Processing...' : 'I have paid'}</button>
      <button class="modal-close" on:click={() => showModal = false}>Cancel</button>
    </div>
  {/if}
</main>

<style>
.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 80vh;
  padding: 2rem 1rem;
}
h2 {
  margin-bottom: 2rem;
  color: #22223b;
}

.payment-tabs-group {
  display: flex;
  flex-direction: row;
  width: 40%;
  height: 400px;
  max-width: 600px;
  background: #f7faff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px 0 rgba(60,60,60,0.10);
  border: 2.5px solid #e0eaff;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: border-color 0.2s;
}

.payment-tabs {
  width: 190px;
  min-width: 190px;
  max-width: 190px;
  display: flex;
  flex-direction: column;
  background: #f0f6ff;
  padding: 1.2rem 0rem 1.2rem 0.7rem;
  box-shadow: 0 4px 2px 0 rgba(151, 148, 148, 0.123) !important;
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
  box-shadow: inset 0 2px 2px 0 rgba(151, 148, 148, 0.123) !important;
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
  min-height: 260px; /* adjust as needed for your content */
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

.pay-btn {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  margin: 0 auto;
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

.copyable {
  font-family: monospace;
  background: #f4f4f4;
  padding: 0.1em 0.4em;
  border-radius: 4px;
  user-select: all;
}

.copy-btn {
  margin-left: 0.5em;
  padding: 0.2em 0.7em;
  font-size: 0.95em;
  border: 1px solid #4f8cff;
  background: #f8fbff;
  color: #4f8cff;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.copy-btn:hover {
  background: #e6f0ff;
}

/* Modal styles */
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
  min-width: 150px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.modal-content {
  margin-bottom: 1.5rem;
  text-align: center;
}
.modal-close {
  margin-top: 1rem;
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
    border-bottom: 2.5px solid #e0eaff;
    padding: 0.7rem 0.7rem 0.2rem 0.7rem;
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
  .payment-form {
    border-radius: 0 0 1.2rem 1.2rem;
    padding: 1.5rem 1rem;
    border-left: none;
    border-top: 2.5px solid #e0eaff;
  }
}
</style> 