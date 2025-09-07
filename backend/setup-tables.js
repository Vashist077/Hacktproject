const { syncDatabase } = require('./models');

async function setupTables() {
  console.log('🚀 Setting up database tables...');
  
  try {
    // Sync database (create tables)
    await syncDatabase(false); // Don't force sync (don't drop existing data)
    console.log('✅ Database tables created successfully!');
    
    // Test the connection
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection verified!');
    
    // Show created tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Created tables:');
    results.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await sequelize.close();
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupTables();
