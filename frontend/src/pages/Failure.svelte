<script>
  function retry() {
    window.history.back();
  }
</script>
<main class="result-container failure">
  <h2>Payment Failed</h2>
  <p>Sorry, your payment could not be processed. Please try again.</p>
  <div class="btn-group">
    <button on:click={retry} class="retry-btn">Retry</button>
    <button on:click={() => window.location.hash = '#/'} class="home-btn">Back to Home</button>
  </div>
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
.failure h2 {
  color: #e74c3c;
}
.btn-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}
.retry-btn, .home-btn {
  background: #4f8cff;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.9rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
}
.retry-btn:hover, .home-btn:hover {
  background: #2d6cdf;
}
</style> 