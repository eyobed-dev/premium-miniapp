<script>
const services = [
  {
    name: 'Substack (MeseretMedia)',
    type: 'meseretmedia',
    icon: '/src/icons/meseretmedia.jpg',
  },
  {
    name: 'Substack (WazemaRadio)',
    type: 'wazemaradio',
    icon: '/src/icons/wazemaradio.jpg',
  },
  {
    name: 'TelegramPro',
    type: 'telegrampro',
    icon: '/src/icons/premium.jpg',
  },
  {
    name: 'TelegramStars',
    type: 'telegramstars',
    icon: '/src/icons/stars.png',
  },
  {
    name: 'ChatGPT Pro',
    type: 'chatgptpro',
    icon: '/src/icons/gpt.png', // Or your ChatGPT icon
  },
];
  function selectService(type) {
    window.location.hash = `#/service?type=${type}`;
  }
</script>

<main class="home-container">
  <h1>Premium Services</h1>
  <div class="icon-grid">
    {#each services as service}
      <button type="button" class="icon-card" on:click={() => selectService(service.type)}>
        <img src={service.icon} alt={service.name} class="service-icon" />
        <span>{service.name}</span>
      </button>
    {/each}
  </div>
</main>

<style>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
  padding: 2rem 1rem;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #22223b;
  letter-spacing: 1px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 800px;
}

.icon-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 2px 16px 0 rgba(60,60,60,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 2px solid transparent;
}
.icon-card:hover {
  transform: translateY(-6px) scale(1.04);
  box-shadow: 0 6px 24px 0 rgba(60,60,60,0.13);
  border-color: #a3bffa;
}
.service-icon {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1rem;
  border: 2px solid #e0e7ef;
}
.icon-card span {
  font-size: 1.1rem;
  color: #22223b;
  margin-top: 0.5rem;
  text-align: center;
}
</style> 