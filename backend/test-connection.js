const { Sequelize } = require('sequelize');
require('dotenv').config();

// Test database connection
async function testConnection() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'subguard',
    process.env.DB_USER || 'shirrapthi',
    process.env.DB_PASSWORD || 'subguard',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection has been established successfully.');
    
    // Test if we can create a simple table
    await sequelize.query('SELECT version();');
    console.log('✅ Database is responding to queries.');
    
    await sequelize.close();
    console.log('✅ Connection closed successfully.');
    
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL database:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
