const pool = require('./connection');

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stores table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400),
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ratings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `);

    console.log('Tables created successfully');

    // Insert initial data
    await insertInitialData();

  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

const insertInitialData = async () => {
  try {
    const bcrypt = require('bcryptjs');

    // Check if admin user already exists
    const adminExists = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);

    if (adminExists.rows.length === 0) {
      // Create admin user
      const adminPassword = await bcrypt.hash('Admin123!', 10);
      await pool.query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['System Administrator', 'admin@example.com', adminPassword, '123 Admin Street, Admin City, AC 12345', 'admin']);

      console.log('Admin user created');
    }

    // Check if store owner exists
    const storeOwnerExists = await pool.query('SELECT id FROM users WHERE email = $1', ['storeowner@example.com']);

    if (storeOwnerExists.rows.length === 0) {
      // Create store owner
      const storeOwnerPassword = await bcrypt.hash('Store123!', 10);
      const storeOwner = await pool.query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, ['Store Owner', 'storeowner@example.com', storeOwnerPassword, '456 Store Owner Lane, Store City, SC 54321', 'store_owner']);

      // Create sample stores
      await pool.query(`
        INSERT INTO stores (name, email, address, owner_id) 
        VALUES ($1, $2, $3, $4)
      `, ['Sample Store 1', 'store1@example.com', '123 Main Street, City, State 12345', storeOwner.rows[0].id]);

      await pool.query(`
        INSERT INTO stores (name, email, address, owner_id) 
        VALUES ($1, $2, $3, $4)
      `, ['Sample Store 2', 'store2@example.com', '456 Oak Avenue, City, State 12345', storeOwner.rows[0].id]);

      console.log('Store owner and sample stores created');
    }

    // Check if normal user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', ['user@example.com']);

    if (userExists.rows.length === 0) {
      // Create normal user
      const userPassword = await bcrypt.hash('User123!', 10);
      await pool.query(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['Normal User', 'user@example.com', userPassword, '789 User Street, User City, UC 98765', 'user']);

      console.log('Normal user created');
    }

    // Create additional sample stores without owners
    const stores = [
      ['Tech Store', 'tech@example.com', '789 Innovation Drive, Tech City, TC 54321'],
      ['Book Store', 'books@example.com', '321 Knowledge Lane, Book Town, BT 67890'],
      ['Food Market', 'food@example.com', '654 Fresh Street, Food City, FC 13579'],
      ['Sports Store', 'sports@example.com', '987 Athletic Avenue, Sports Town, ST 24680']
    ];

    for (const [name, email, address] of stores) {
      const storeExists = await pool.query('SELECT id FROM stores WHERE name = $1', [name]);
      if (storeExists.rows.length === 0) {
        await pool.query('INSERT INTO stores (name, email, address) VALUES ($1, $2, $3)', [name, email, address]);
      }
    }

    console.log('Sample data inserted successfully');

  } catch (error) {
    console.error('Error inserting initial data:', error);
  }
};

// Run setup
createTables().then(() => {
  console.log('Database setup completed');
  process.exit(0);
}).catch((error) => {
  console.error('Database setup failed:', error);
  process.exit(1);
});
