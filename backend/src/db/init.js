const pool = require('./connection');

async function initDB() {
  // Users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      telegram_id BIGINT NOT NULL UNIQUE,
      telegram_username VARCHAR(64),
      first_name VARCHAR(64),
      last_name VARCHAR(64),
      language_code VARCHAR(8),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      service_type VARCHAR(64) NOT NULL,
      service_identifier VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(32) NOT NULL,
      payer_name VARCHAR(100),
      payer_phone VARCHAR(20),
      status ENUM('pending', 'paid', 'completed', 'failed') DEFAULT 'pending',
      payment_proof VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized');
}

initDB().then(() => process.exit()).catch(err => { console.error(err); process.exit(1); }); 