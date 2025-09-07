# Database Migration: MongoDB to PostgreSQL

This document outlines the migration from MongoDB to PostgreSQL for the SubGuard application.

## Changes Made

### 1. Dependencies Updated
- **Removed**: `mongoose` (MongoDB ODM)
- **Added**: `sequelize` (PostgreSQL ORM), `pg` (PostgreSQL driver), `pg-hstore` (PostgreSQL data type support)

### 2. Database Configuration
- Created `backend/config/database.js` with Sequelize configuration
- Supports development, test, and production environments
- Includes connection pooling and SSL support

### 3. Models Converted
All models have been converted from Mongoose schemas to Sequelize models:

#### User Model (`backend/models/User.js`)
- Converted nested objects to flat table structure
- Gmail tokens flattened to separate columns
- Notification settings flattened to individual boolean columns
- Preferences flattened to individual columns

#### Subscription Model (`backend/models/Subscription.js`)
- Usage object flattened to individual columns
- Tags converted to PostgreSQL array type
- Metadata converted to JSONB for flexibility

#### Alert Model (`backend/models/Alert.js`)
- Actions array converted to JSONB
- Metadata converted to JSONB
- Tags converted to PostgreSQL array type

### 4. Server Configuration
- Updated `backend/server.js` to use Sequelize instead of Mongoose
- Updated error handling for Sequelize-specific errors
- Updated graceful shutdown to close Sequelize connections

### 5. Database Setup Script
- Created `backend/scripts/setup-database.js` for automated database setup
- Includes PostgreSQL installation check
- Creates database and required extensions
- Runs migrations and optionally creates sample data

## Setup Instructions

### Prerequisites
1. **Install PostgreSQL**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - Windows: Start PostgreSQL service from Services
   - macOS: `brew services start postgresql`
   - Ubuntu: `sudo systemctl start postgresql`

### Environment Configuration
1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=subguard_dev
   ```

### Database Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database setup**:
   ```bash
   npm run setup-db
   ```

   This will:
   - Check PostgreSQL installation
   - Create the database
   - Install required extensions (uuid-ossp, pg_trgm)
   - Create all tables and relationships
   - Optionally create sample data (set `CREATE_SAMPLE_DATA=true` in .env)

3. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## Database Schema

### Tables Created
- `users` - User accounts and preferences
- `subscriptions` - Subscription services
- `alerts` - Fraud and system alerts

### Key Features
- **UUID Primary Keys**: All tables use UUID for better distributed system support
- **JSONB Support**: Flexible metadata storage using PostgreSQL's JSONB type
- **Array Support**: Tags stored as PostgreSQL arrays
- **Foreign Key Constraints**: Proper referential integrity
- **Indexes**: Optimized for common query patterns

### Extensions Installed
- `uuid-ossp`: For UUID generation
- `pg_trgm`: For text similarity searches

## Migration Notes

### Data Type Changes
- MongoDB ObjectId → PostgreSQL UUID
- Nested objects → Flattened columns or JSONB
- Arrays → PostgreSQL arrays or JSONB
- Mixed types → JSONB for flexibility

### Query Changes
- Mongoose queries → Sequelize queries
- Aggregation pipelines → Sequelize aggregations or raw SQL
- Virtual fields → Instance methods

### API Compatibility
The API endpoints remain the same, but internal database operations have been updated to use Sequelize instead of Mongoose.

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Failed**
   - Verify PostgreSQL is running
   - Check credentials in `.env`
   - Ensure database exists

2. **Permission Denied**
   - Ensure PostgreSQL user has CREATE DATABASE privileges
   - Check file permissions for the project directory

3. **Extension Installation Failed**
   - Ensure PostgreSQL contrib modules are installed
   - Check user permissions for creating extensions

### Manual Database Creation
If the automated setup fails, you can manually create the database:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE subguard_dev;

-- Create user (optional)
CREATE USER subguard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE subguard_dev TO subguard_user;

-- Connect to the new database
\c subguard_dev

-- Install extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## Performance Considerations

### Indexes
The following indexes are automatically created:
- User email (unique)
- Subscription user_id + status
- Alert user_id + status
- Alert user_id + type
- Alert user_id + severity
- Alert user_id + date
- Alert user_id + is_read

### Connection Pooling
Sequelize is configured with connection pooling:
- Development: max 5 connections
- Production: max 20 connections
- Idle timeout: 10 seconds
- Acquire timeout: 30 seconds

## Testing

Run tests with the test database:
```bash
npm test
```

The test database will be automatically created and cleaned up during testing.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Configure production database credentials
3. Set `DB_SSL=true` if using a managed PostgreSQL service
4. Ensure proper backup and monitoring is in place

The application will automatically use production-optimized settings when `NODE_ENV=production`.
