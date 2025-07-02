<main class="result-container success">
  <h2>Payment Successful!</h2>
  <p>Thank you for your purchase. Your order has been processed successfully.</p>
  <button on:click={() => window.location.hash = '#/'} class="home-btn">Back to Home</button>
</main>

<style>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem 1rem;
}
.success h2 {
  color: #2ecc40;
}
.home-btn {
  margin-top: 2rem;
  background: #4f8cff;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.home-btn:hover {
  background: #2d6cdf;
}
</style> 