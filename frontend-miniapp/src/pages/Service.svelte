<script>
  import { onMount } from 'svelte';

  let serviceType = '';
  let serviceName = '';
  let email = '';
  let username = '';
  let duration = 'monthly';
  let amount = 100;
  let prices = {};
  let loadingPrices = true;
  let priceError = '';
  let starOptions = [];

  // Try to auto-fill Telegram username if available
  function autofillTelegramUsername() {
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      // @ts-ignore
      username = window.Telegram.WebApp.initDataUnsafe.user.username || '';
    }
  }

  async function fetchPrices() {
    loadingPrices = true;
    priceError = '';
    try {
      const res = await fetch(`http://localhost:5000/api/prices`);
      if (!res.ok) throw new Error('Failed to fetch prices');
      prices = await res.json();
      if (prices.telegramstars && Array.isArray(prices.telegramstars)) {
        starOptions = prices.telegramstars;
        amount = starOptions[0]?.amount || 100;
      }
    } catch (e) {
      priceError = 'Could not load prices.';
    } finally {
      loadingPrices = false;
    }
  }

  $: selectedPrice = (() => {
    if (!prices || !serviceType) return null;
    if (serviceType === 'meseretmedia' || serviceType === 'wazemaradio' || serviceType === 'telegrampro') {
      return prices[serviceType]?.[duration] ?? null;
    } else if (serviceType === 'chatgptpro') {
      return prices[serviceType]?.monthly ?? null;
    } else if (serviceType === 'telegramstars') {
      if (starOptions.length > 0) {
        const found = starOptions.find(opt => opt.amount == amount);
        return found ? found.price : null;
      }
    }
    return null;
  })();

  onMount(() => {
    fetchPrices();
    // Parse the type param from the hash (for hash-based routing)
    let hash = window.location.hash || '';
    let queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    serviceType = params.get('type') || '';
    switch (serviceType) {
      case 'meseretmedia':
        serviceName = 'Substack (MeseretMedia)';
        break;
      case 'wazemaradio':
        serviceName = 'Substack (WazemaRadio)';
        break;
      case 'telegrampro':
        serviceName = 'TelegramPro';
        autofillTelegramUsername();
        break;
      case 'telegramstars':
        serviceName = 'TelegramStars';
        autofillTelegramUsername();
        break;
      case 'chatgptpro':
        serviceName = 'ChatGPT Pro';
        break;
      default:
        serviceName = 'Service';
    }
  });

  function orderPayment() {
    let params = `type=${serviceType}`;
    if (serviceType === 'meseretmedia' || serviceType === 'wazemaradio') {
      params += `&email=${encodeURIComponent(email)}&duration=${duration}`;
    } else if (serviceType === 'telegrampro') {
      params += `&username=${encodeURIComponent(username)}&duration=${duration}`;
    } else if (serviceType === 'telegramstars') {
      params += `&username=${encodeURIComponent(username)}&amount=${amount}`;
    } else if (serviceType === 'chatgptpro') {
      params += `&email=${encodeURIComponent(email)}&duration=monthly`;
    }
    window.location.hash = `#/payment?${params}`;
  }
</script>

<main class="service-container">
  <h2>Order {serviceName}</h2>
  {#if loadingPrices}
    <p>Loading prices...</p>
  {:else if priceError}
    <p style="color: red">{priceError}</p>
  {:else}
    <form class="order-form" on:submit|preventDefault={orderPayment}>
      {#if serviceType === 'meseretmedia' || serviceType === 'wazemaradio'}
        <label>
          Email
          <input type="email" bind:value={email} required placeholder="Enter your email" />
        </label>
        <div class="radio-group">
          <span>Duration</span>
          <label class="radio-option">
            <input type="radio" name="duration" value="monthly" bind:group={duration} />
            Monthly ({prices[serviceType]?.monthly ?? '-'} ETB)
          </label>
          <label class="radio-option">
            <input type="radio" name="duration" value="yearly" bind:group={duration} />
            Yearly ({prices[serviceType]?.yearly ?? '-'} ETB)
          </label>
        </div>
        <div class="price-info">Selected price: <b>{selectedPrice ?? '-'} </b>ETB</div>
      {:else if serviceType === 'telegrampro'}
        <label>
          Username
          <input type="text" bind:value={username} required placeholder="Enter your Telegram username" />
        </label>
        <div class="radio-group">
          <span>Duration</span>
          <label class="radio-option">
            <input type="radio" name="duration" value="monthly" bind:group={duration} />
            Monthly ({prices[serviceType]?.monthly ?? '-'} ETB)
          </label>
          <label class="radio-option">
            <input type="radio" name="duration" value="yearly" bind:group={duration} />
            Yearly ({prices[serviceType]?.yearly ?? '-'} ETB)
          </label>
        </div>
        <div class="price-info">Selected price: <b>{selectedPrice ?? '-'} </b>ETB</div>
      {:else if serviceType === 'telegramstars'}
        <label>
          Username
          <input type="text" bind:value={username} required placeholder="Enter your Telegram username" />
        </label>
        <div class="radio-group">
          <span>Amount</span>
          {#each starOptions as opt}
            <label class="radio-option">
              <input type="radio" name="star-amount" value={opt.amount} bind:group={amount} />
              {opt.amount} stars ({opt.price} ETB)
            </label>
          {/each}
        </div>
        <div class="price-info">Total price: <b>{selectedPrice ?? '-'} </b>ETB</div>
      {:else if serviceType === 'chatgptpro'}
        <label>
          Email
          <input type="email" bind:value={email} required placeholder="Enter your email" />
        </label>
        <div class="radio-group">
          <span>Duration</span>
          <label class="radio-option">
            <input type="radio" name="duration" value="monthly" bind:group={duration} disabled />
            Monthly ({prices[serviceType]?.monthly ?? '-' } ETB)
          </label>
        </div>
        <div class="price-info">Selected price: <b>{selectedPrice ?? '-'} </b>ETB</div>
      {/if}
      <button type="submit" class="order-btn">Order Payment</button>
    </form>
  {/if}
</main>

<style>
.service-container {
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

.order-form {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px 0 rgba(60,60,60,0.08);
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 320px;
  max-width: 100vw;
}
label {
  display: flex;
  flex-direction: column;
  font-size: 1.1rem;
  color: #22223b;
  gap: 0.5rem;
}
input, select {
  padding: 0.7rem 1rem;
  border-radius: 0.7rem;
  border: 1px solid #a3bffa;
  font-size: 1rem;
  outline: none;
  margin-top: 0.2rem;
}
.order-btn {
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
.order-btn:hover {
  background: #2d6cdf;
}
.radio-group {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}
.price-info {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #2d6cdf;
}
</style> 