#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class DatabaseManager {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'vashist',
      password: process.env.DB_PASSWORD || 'dedsec',
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

  async showTables() {
    console.log('\n📋 Current Database Tables:');
    process.env.PGPASSWORD = this.dbConfig.password;
    
    try {
      const command = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -c "\\dt"`;
      const result = await this.runCommand(command, 'Fetching table list');
      console.log(result);
    } catch (error) {
      console.error('Failed to fetch tables:', error.message);
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async showTableStructure(tableName) {
    console.log(`\n🏗️  Structure of table: ${tableName}`);
    process.env.PGPASSWORD = this.dbConfig.password;
    
    try {
      const command = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -c "\\d ${tableName}"`;
      const result = await this.runCommand(command, `Fetching structure of ${tableName}`);
      console.log(result);
    } catch (error) {
      console.error(`Failed to fetch structure of ${tableName}:`, error.message);
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async showTableData(tableName, limit = 10) {
    console.log(`\n📊 Data from table: ${tableName} (limit: ${limit})`);
    process.env.PGPASSWORD = this.dbConfig.password;
    
    try {
      const command = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -c "SELECT * FROM ${tableName} LIMIT ${limit};"`;
      const result = await this.runCommand(command, `Fetching data from ${tableName}`);
      console.log(result);
    } catch (error) {
      console.error(`Failed to fetch data from ${tableName}:`, error.message);
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async runCustomQuery(query) {
    console.log(`\n🔍 Running custom query: ${query}`);
    process.env.PGPASSWORD = this.dbConfig.password;
    
    try {
      const command = `psql -h ${this.dbConfig.host} -p ${this.dbConfig.port} -U ${this.dbConfig.user} -d ${this.dbConfig.database} -c "${query}"`;
      const result = await this.runCommand(command, 'Executing custom query');
      console.log(result);
    } catch (error) {
      console.error('Failed to execute query:', error.message);
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async resetDatabase() {
    console.log('\n⚠️  WARNING: This will delete all data in the database!');
    const answer = await this.askQuestion('Are you sure you want to reset the database? (yes/no): ');
    
    if (answer.toLowerCase() === 'yes') {
      try {
        const { syncDatabase } = require('../models');
        await syncDatabase(true); // Force sync (drops and recreates tables)
        console.log('✅ Database reset completed');
      } catch (error) {
        console.error('❌ Database reset failed:', error.message);
      }
    } else {
      console.log('❌ Database reset cancelled');
    }
  }

  async createSampleData() {
    console.log('\n🌱 Creating sample data...');
    
    try {
      const { User, Subscription, Alert } = require('../models');
      
      // Check if sample data already exists
      const userCount = await User.count();
      if (userCount > 0) {
        console.log('⚠️  Sample data already exists. Skipping...');
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
      console.log('✅ Sample data creation completed');
      
    } catch (error) {
      console.error('❌ Failed to create sample data:', error.message);
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  async showMenu() {
    console.log('\n🗄️  Database Management Menu');
    console.log('============================');
    console.log('1. Show all tables');
    console.log('2. Show table structure');
    console.log('3. Show table data');
    console.log('4. Run custom SQL query');
    console.log('5. Reset database (⚠️  DANGER)');
    console.log('6. Create sample data');
    console.log('7. Exit');
    
    const choice = await this.askQuestion('\nEnter your choice (1-7): ');
    
    switch (choice) {
      case '1':
        await this.showTables();
        break;
      case '2':
        const tableName = await this.askQuestion('Enter table name: ');
        await this.showTableStructure(tableName);
        break;
      case '3':
        const tableName2 = await this.askQuestion('Enter table name: ');
        const limit = await this.askQuestion('Enter limit (default 10): ') || '10';
        await this.showTableData(tableName2, parseInt(limit));
        break;
      case '4':
        const query = await this.askQuestion('Enter SQL query: ');
        await this.runCustomQuery(query);
        break;
      case '5':
        await this.resetDatabase();
        break;
      case '6':
        await this.createSampleData();
        break;
      case '7':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid choice. Please try again.');
    }
    
    // Show menu again
    await this.showMenu();
  }

  async start() {
    console.log('🚀 Database Manager Started');
    console.log(`📊 Connected to: ${this.dbConfig.database}@${this.dbConfig.host}:${this.dbConfig.port}`);
    
    try {
      await this.showMenu();
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  const manager = new DatabaseManager();
  manager.start();
}

module.exports = DatabaseManager;
