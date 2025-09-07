# SubGuard Backend API

This is the Node.js backend API for the SubGuard application, providing RESTful endpoints for subscription management, fraud detection, and user authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Gmail API credentials
- Twilio account (for SMS notifications)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**
```bash
npm run dev
```

4. **Start production server**
```bash
npm start
```

## 📁 Project Structure

```
backend/
├── models/           # MongoDB models
│   ├── User.js
│   ├── Subscription.js
│   └── Alert.js
├── routes/           # API routes
│   ├── auth.js
│   ├── user.js
│   ├── subscriptions.js
│   ├── alerts.js
│   ├── analytics.js
│   ├── gmail.js
│   └── notifications.js
├── middleware/       # Custom middleware
│   └── auth.js
├── uploads/          # File upload directory
├── server.js         # Main server file
├── package.json
└── .env              # Environment variables
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/subguard
MONGODB_TEST_URI=mongodb://localhost:27017/subguard_test

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Gmail API Configuration
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# NLP Service Configuration
NLP_SERVICE_URL=http://localhost:5001

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Subscription Endpoints

#### Get All Subscriptions
```http
GET /api/subscriptions
Authorization: Bearer <jwt-token>
```

#### Create Subscription
```http
POST /api/subscriptions
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Netflix",
  "merchant": "Netflix Inc.",
  "amount": 499,
  "billingCycle": "monthly",
  "nextBilling": "2024-02-15",
  "category": "Streaming"
}
```

#### Upload CSV
```http
POST /api/subscriptions/upload-csv
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <csv-file>
```

### Alert Endpoints

#### Get All Alerts
```http
GET /api/alerts
Authorization: Bearer <jwt-token>
```

#### Resolve Alert
```http
POST /api/alerts/:id/resolve
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "resolution": "confirmed_fraud",
  "notes": "Confirmed fraudulent transaction"
}
```

### Analytics Endpoints

#### Get Spending Analytics
```http
GET /api/analytics/spending?range=6months
Authorization: Bearer <jwt-token>
```

#### Get Recommendations
```http
GET /api/analytics/recommendations
Authorization: Bearer <jwt-token>
```

### Gmail Integration

#### Connect Gmail
```http
GET /api/gmail/connect
Authorization: Bearer <jwt-token>
```

#### Sync Transactions
```http
POST /api/gmail/sync
Authorization: Bearer <jwt-token>
```

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  gmailConnected: Boolean,
  gmailTokens: Object,
  notificationSettings: Object,
  preferences: Object,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription Model
```javascript
{
  user: ObjectId,
  name: String,
  merchant: String,
  amount: Number,
  currency: String,
  billingCycle: String,
  nextBilling: Date,
  status: String,
  category: String,
  usage: Object,
  source: String,
  confidence: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Alert Model
```javascript
{
  user: ObjectId,
  subscription: ObjectId,
  type: String,
  severity: String,
  title: String,
  description: String,
  merchant: String,
  amount: Number,
  currency: String,
  date: Date,
  status: String,
  resolution: String,
  actions: Array,
  metadata: Object,
  notifications: Object,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting protection
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Express-validator for data validation
- **Helmet.js**: Security headers protection
- **MongoDB Injection Protection**: Mongoose ODM protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "auth"
```

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Winston**: Application logging
- **Health Check**: `/health` endpoint
- **Error Handling**: Global error handler
- **Performance Monitoring**: Response time tracking

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://production-db-url
   JWT_SECRET=production-secret-key
   ```

2. **Process Management**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start server.js --name subguard-api
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name api.subguard.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Comprehensive error handling

### Git Workflow
1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit pull request

### API Versioning
- Current version: v1
- Version in URL: `/api/v1/`
- Backward compatibility maintained

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

3. **Gmail API Errors**
   - Verify OAuth credentials
   - Check API quotas
   - Validate redirect URI

4. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Validate file format

### Debug Mode
```bash
DEBUG=subguard:* npm run dev
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized MongoDB indexes
- **Caching**: Redis for session storage
- **Compression**: Gzip compression enabled
- **Connection Pooling**: MongoDB connection pooling
- **Rate Limiting**: API rate limiting

## 🔮 Future Enhancements

- **GraphQL API**: GraphQL endpoint
- **WebSocket Support**: Real-time updates
- **Microservices**: Service decomposition
- **Caching Layer**: Redis integration
- **API Documentation**: Swagger/OpenAPI
- **Monitoring**: APM integration

---

For more information, see the main [README.md](../README.md) file.
