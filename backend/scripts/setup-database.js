#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database setup script for PostgreSQL
class DatabaseSetup {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'subguard_dev'
    };
  }

  async runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(`✅ ${description} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ ${description} failed:`, error.message);
      throw error;
    }
  }

  async checkPostgreSQLInstallation() {
    console.log('\n📋 Checking PostgreSQL installation...');
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('✅ PostgreSQL is installed');
      return true;
    } catch (error) {
      console.error('❌ PostgreSQL is not installed or not in PATH');
      console.log('\n📖 Please install PostgreSQL:');
      console.log('   Windows: Download from https://www.postgresql.org/download/windows/');
      console.log('   macOS: brew install postgresql');
      console.log('   Ubuntu: sudo apt-get install postgresql postgresql-contrib');
      return false;
    }
  }

  async createDatabase() {
    const { host, port, user, password, database } = this.dbConfig;
    
    console.log(`\n🗄️  Creating database: ${database}`);
    
    // Set PGPASSWORD environment variable for non-interactive connection
    process.env.PGPASSWORD = password;
    
    try {
      // Check if database exists
      const checkDbCommand = `psql -h ${host} -p ${port} -U ${user} -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = '${database}'"`;
      const dbExists = execSync(checkDbCommand, { encoding: 'utf8', stdio: 'pipe' }).trim();
      
      if (dbExists === '1') {
        console.log(`✅ Database '${database}' already exists`);
        return;
      }
      
      // Create database
      const createDbCommand = `psql -h ${host} -p ${port} -U ${user} -d postgres -c "CREATE DATABASE ${database}"`;
      await this.runCommand(createDbCommand, `Creating database '${database}'`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    } finally {
      // Clear password from environment
      delete process.env.PGPASSWORD;
    }
  }

  async createExtensions() {
    const { host, port, user, password, database } = this.dbConfig;
    
    console.log('\n🔧 Creating PostgreSQL extensions...');
    
    process.env.PGPASSWORD = password;
    
    try {
      const extensions = ['uuid-ossp', 'pg_trgm'];
      
      for (const extension of extensions) {
        const command = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "CREATE EXTENSION IF NOT EXISTS ${extension}"`;
        await this.runCommand(command, `Creating extension '${extension}'`);
      }
    } catch (error) {
      console.error('❌ Failed to create extensions:', error.message);
      throw error;
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async runMigrations() {
    console.log('\n🔄 Running database migrations...');
    
    try {
      // Import and run Sequelize sync
      const { syncDatabase } = require('../models');
      await syncDatabase(false); // Don't force sync
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.error('❌ Database migrations failed:', error.message);
      throw error;
    }
  }

  async createSampleData() {
    console.log('\n🌱 Creating sample data...');
    
    try {
      const { User, Subscription, Alert } = require('../models');
      
      // Check if sample data already exists
      const userCount = await User.count();
      if (userCount > 0) {
        console.log('✅ Sample data already exists, skipping...');
        return;
      }
      
      // Create sample user
      const sampleUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        isEmailVerified: true
      });
      
      console.log('✅ Sample user created');
      
      // Create sample subscriptions
      const subscriptions = [
        {
          userId: sampleUser.id,
          name: 'Netflix Premium',
          category: 'Streaming',
          merchant: 'Netflix',
          amount: 15.99,
          currency: 'USD',
          billingCycle: 'monthly',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          userId: sampleUser.id,
          name: 'Spotify Premium',
          category: 'Music',
          merchant: 'Spotify',
          amount: 9.99,
          currency: 'USD',
          billingCycle: 'monthly',
          nextBilling: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
      ];
      
      for (const subData of subscriptions) {
        await Subscription.create(subData);
      }
      
      console.log('✅ Sample subscriptions created');
      
      // Create sample alert
      await Alert.create({
        userId: sampleUser.id,
        type: 'fraud',
        severity: 'high',
        title: 'Suspicious Transaction Detected',
        description: 'Unusual spending pattern detected on your account',
        merchant: 'Unknown Merchant',
        amount: 99.99,
        currency: 'USD',
        date: new Date()
      });
      
      console.log('✅ Sample alert created');
      
    } catch (error) {
      console.error('❌ Failed to create sample data:', error.message);
      throw error;
    }
  }

  async setup() {
    console.log('🚀 Starting PostgreSQL database setup...\n');
    
    try {
      // Check PostgreSQL installation
      const pgInstalled = await this.checkPostgreSQLInstallation();
      if (!pgInstalled) {
        process.exit(1);
      }
      
      // Create database
      await this.createDatabase();
      
      // Create extensions
      await this.createExtensions();
      
      // Run migrations
      await this.runMigrations();
      
      // Create sample data (optional)
      if (process.env.CREATE_SAMPLE_DATA === 'true') {
        await this.createSampleData();
      }
      
      console.log('\n🎉 Database setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Update your .env file with the correct database credentials');
      console.log('   2. Run: npm start (to start the server)');
      console.log('   3. Run: npm run dev (for development with auto-reload)');
      
    } catch (error) {
      console.error('\n💥 Database setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.setup();
}

module.exports = DatabaseSetup;
