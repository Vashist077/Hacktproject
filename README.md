# SubGuard - Subscription Monitoring & Fraud Detection System

SubGuard is a comprehensive web application that helps users monitor their subscriptions, detect fraudulent transactions, and optimize their spending through AI-powered analysis.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure signup/login with JWT tokens
- **Subscription Management**: Track and manage all your subscriptions
- **Fraud Detection**: AI-powered detection of suspicious transactions
- **Gmail Integration**: Automatic transaction monitoring via Gmail API
- **CSV Upload**: Manual import of bank/UPI transaction data
- **Real-time Notifications**: Email, SMS, and push notifications
- **Analytics Dashboard**: Comprehensive spending insights and forecasts

### AI/NLP Capabilities
- **Transaction Parsing**: Extract structured data from transaction emails
- **Subscription Detection**: Identify recurring charges and subscriptions
- **Fraud Analysis**: Detect suspicious patterns and unauthorized transactions
- **Smart Categorization**: Automatically categorize transactions by type

## 🏗️ Architecture

```
SubGuard/
├── frontend/          # React.js application
├── backend/           # Node.js + Express API
├── nlp_service/       # Python Flask AI service
└── docs/             # Documentation
```

### Technology Stack

**Frontend:**
- React 19.1.1
- React Router 7.8.2
- Chart.js 4.5.0
- TailwindCSS (via inline styles)

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Gmail API Integration
- Twilio SMS Integration

**AI/NLP Service:**
- Python Flask
- NLTK + spaCy
- scikit-learn
- Custom fraud detection algorithms

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB
- Gmail API credentials
- Twilio account (for SMS)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd subguard
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup Frontend**
```bash
cd Hacktproject
npm install
npm start
```

4. **Setup NLP Service**
```bash
cd nlp_service
pip install -r requirements.txt
python app.py
```

### Environment Configuration

Create `.env` files in both `backend/` and `nlp_service/` directories:

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/subguard
JWT_SECRET=your-super-secret-jwt-key
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
NLP_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

## 📱 Usage

### 1. User Registration & Login
- Sign up with email and password
- Verify email (optional)
- Login to access dashboard

### 2. Subscription Management
- **Manual Entry**: Add subscriptions manually
- **CSV Upload**: Import bank statements
- **Gmail Integration**: Connect Gmail for automatic monitoring

### 3. Transaction Monitoring
- **Gmail Watch**: Monitor emails for transaction notifications
- **AI Processing**: Automatic parsing and classification
- **Fraud Detection**: Real-time fraud analysis

### 4. Alerts & Notifications
- **Fraud Alerts**: Immediate notification of suspicious transactions
- **Renewal Reminders**: Upcoming subscription renewals
- **Spending Alerts**: Budget threshold notifications

### 5. Analytics & Insights
- **Spending Trends**: Monthly/yearly spending analysis
- **Category Breakdown**: Spending by subscription type
- **Forecasting**: Predictive spending analysis
- **Recommendations**: AI-powered optimization suggestions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `POST /api/subscriptions/upload-csv` - Upload CSV file

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/:id/ignore` - Ignore alert

### Analytics
- `GET /api/analytics/spending` - Spending over time
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/fraud-detection` - Fraud statistics
- `GET /api/analytics/recommendations` - AI recommendations

### Gmail Integration
- `GET /api/gmail/connect` - Get OAuth URL
- `POST /api/gmail/sync` - Sync transactions
- `POST /api/gmail/disconnect` - Disconnect Gmail

## 🤖 AI/NLP Service

The Python Flask service provides:

### Endpoints
- `POST /analyze` - Analyze multiple transactions
- `POST /extract` - Extract data from single transaction
- `POST /detect-fraud` - Detect fraud in transaction
- `POST /classify-subscription` - Classify subscription type

### Features
- **Text Processing**: NLTK + spaCy for advanced NLP
- **Pattern Recognition**: Regex patterns for transaction data
- **Machine Learning**: scikit-learn for classification
- **Fraud Detection**: Custom algorithms for suspicious activity

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting protection
- **CORS Configuration**: Cross-origin request security
- **Input Validation**: Comprehensive data validation
- **Helmet.js**: Security headers protection

## 📊 Data Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  gmailConnected: Boolean,
  notificationSettings: Object,
  preferences: Object
}
```

### Subscription
```javascript
{
  user: ObjectId,
  name: String,
  merchant: String,
  amount: Number,
  billingCycle: String,
  nextBilling: Date,
  status: String,
  category: String,
  usage: Object
}
```

### Alert
```javascript
{
  user: ObjectId,
  type: String,
  title: String,
  description: String,
  merchant: String,
  amount: Number,
  status: String,
  severity: String,
  metadata: Object
}
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   - Set production MongoDB URI
   - Configure Gmail API credentials
   - Set up Twilio for SMS
   - Configure email SMTP settings

2. **Database Setup**
   - Create MongoDB production database
   - Set up indexes for performance
   - Configure backup strategy

3. **Server Configuration**
   - Use PM2 for process management
   - Configure Nginx reverse proxy
   - Set up SSL certificates
   - Configure firewall rules

4. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Set up performance monitoring
   - Configure log aggregation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Advanced AI**: Machine learning model improvements
- **Bank Integration**: Direct bank API integration
- **Multi-currency**: Support for multiple currencies
- **Team Features**: Family/team subscription sharing
- **API Marketplace**: Third-party integrations

---

**SubGuard** - Protecting your finances, one subscription at a time! 🛡️
