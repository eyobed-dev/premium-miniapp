<script>
  import { onMount } from 'svelte';

  let paymentMethod = 'telebirr';
  let orderDetails = {};
  let paymentInfo = {};
  let showModal = false;
  let isPaying = false;
  let payerName = '';
  let payerPhone = '';
  let accountNumber = '';
  let accountName = '';
  let accountLogo = '';
  let accountLabel = '';

  onMount(async () => {
    let hash = window.location.hash || '';
    let queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    orderDetails = {
      type: params.get('type'),
      email: params.get('email'),
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

  function confirmPaid() {
    isPaying = true;
    setTimeout(() => {
      isPaying = false;
      if (Math.random() > 0.2) {
        window.location.hash = '#/success';
      } else {
        window.location.hash = '#/failure';
      }
    }, 1200);
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
  <form class="payment-form" on:submit|preventDefault={pay}>
    <div class="payment-category">
      <h3>Mobile Money</h3>
      <div class="payment-options">
        <label class="payment-option">
          <input type="radio" name="method" value="telebirr" bind:group={paymentMethod} />
          <img src="/src/icons/Telebirr.png" alt="Telebirr" class="pay-icon" />
          <span>Telebirr</span>
        </label>
        <label class="payment-option">
          <input type="radio" name="method" value="cbebirr" bind:group={paymentMethod} />
          <img src="/src/icons/cbebirr.jpeg" alt="CBE Birr" class="pay-icon" />
          <span>CBE Birr</span>
        </label>
      </div>
    </div>
    <div class="payment-category">
      <h3>Bank Transfer</h3>
      <div class="payment-options">
        <label class="payment-option">
          <input type="radio" name="method" value="cbe_direct" bind:group={paymentMethod} />
          <img src="/src/icons/cbe.png" alt="CBE Direct Deposit" class="pay-icon" />
          <span>CBE Direct Deposit</span>
        </label>
      </div>
    </div>
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
    <button type="submit" class="pay-btn">Pay</button>
  </form>

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
      </div>
      <button class="pay-btn" on:click={confirmPaid} disabled={isPaying}>{isPaying ? 'Checking...' : 'I have paid'}</button>
      <button class="modal-close" on:click={() => showModal = false}>Cancel</button>
    </div>
  {/if}
</main>

<style>
.pay-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 0.5rem;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #eee;
}
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

.payment-form {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px 0 rgba(60,60,60,0.08);
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 320px;
  max-width: 100vw;
}
.payment-category {
  margin-bottom: 1.5rem;
}
.payment-category h3 {
  margin-bottom: 0.7rem;
  font-size: 1.1rem;
  color: #4f8cff;
  font-weight: 600;
}
.payment-options {
  display: flex;
  gap: 2rem;
  justify-content: flex-start;
}
.payment-option {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.1rem;
  color: #22223b;
}
.pay-btn {
  margin-top: 1.5rem;
  background: #4f8cff;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.pay-btn:hover {
  background: #2d6cdf;
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
  min-width: 320px;
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
  text-decoration: underline;
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
.helper-text {
  color: #888;
  font-size: 0.95em;
  margin-top: 0.1rem;
}
input[type="text"], input[type="tel"] {
  padding: 0.7rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.2rem;
  width: 100%;
  box-sizing: border-box;
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
</style> 