const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Gmail OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID || 'dummy-client-id',
  process.env.GMAIL_CLIENT_SECRET || 'dummy-client-secret',
  process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/api/gmail/callback'
);

// @route   GET /api/gmail/connect
// @desc    Get Gmail OAuth URL
// @access  Private
router.get('/connect', authenticateToken, async (req, res) => {
  try {
    // Check if Gmail OAuth is properly configured
    if (!process.env.GMAIL_CLIENT_ID || process.env.GMAIL_CLIENT_ID === 'your-gmail-client-id') {
      return res.status(400).json({
        success: false,
        message: 'Gmail OAuth not configured. Please set up Google Cloud credentials.',
        setupRequired: true
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: (req.user._id || req.user.id).toString()
    });

    res.json({
      success: true,
      data: {
        authUrl: authUrl
      }
    });
  } catch (error) {
    console.error('Gmail connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Gmail auth URL',
      error: error.message
    });
  }
});

// @route   GET /api/gmail/callback
// @desc    Handle Gmail OAuth callback
// @access  Public
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Missing authorization code or state'
      });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Find user by state
    const user = await User.findById(state);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Save tokens to user
    user.gmailConnected = true;
    user.gmailTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date)
    };
    await user.save();

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail_connected=true`);
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?gmail_error=true`);
  }
});

// @route   POST /api/gmail/disconnect
// @desc    Disconnect Gmail integration
// @access  Private
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear Gmail tokens
    user.gmailConnected = false;
    user.gmailTokens = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Gmail integration disconnected successfully'
    });
  } catch (error) {
    console.error('Gmail disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Gmail integration',
      error: error.message
    });
  }
});

// @route   GET /api/gmail/status
// @desc    Get Gmail connection status
// @access  Private
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let isConnected = user.gmailConnected;
    let needsRefresh = false;

    // Check if token needs refresh
    if (isConnected && user.gmailTokens?.expiryDate) {
      const now = new Date();
      const expiryDate = new Date(user.gmailTokens.expiryDate);
      needsRefresh = now >= expiryDate;
    }

    res.json({
      success: true,
      data: {
        connected: isConnected,
        needsRefresh: needsRefresh,
        lastSync: user.gmailTokens?.lastSync || null
      }
    });
  } catch (error) {
    console.error('Gmail status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Gmail status',
      error: error.message
    });
  }
});

// @route   POST /api/gmail/sync
// @desc    Sync transactions from Gmail
// @access  Private
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user || !user.gmailConnected) {
      return res.status(400).json({
        success: false,
        message: 'Gmail not connected'
      });
    }

    // Check if token needs refresh
    if (user.gmailTokens?.expiryDate && new Date() >= new Date(user.gmailTokens.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Gmail token expired. Please reconnect.'
      });
    }

    // Set up Gmail API client
    oauth2Client.setCredentials({
      access_token: user.gmailTokens.accessToken,
      refresh_token: user.gmailTokens.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for transaction emails
    const searchQuery = 'from:(bank OR upi OR payment OR debit OR subscription) subject:(debited OR charged OR payment OR subscription OR renewed)';
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 50
    });

    const messages = response.data.messages || [];
    const transactions = [];
    const newAlerts = [];

    // Process each email
    for (const message of messages) {
      try {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Extract transaction data (simplified - in real app, use NLP service)
        const transactionData = await extractTransactionData(email.data, subject, from);

        if (transactionData) {
          transactions.push(transactionData);

          // Check if this is a new transaction that needs an alert
          const existingAlert = await Alert.findOne({
            user: req.user._id || req.user.id,
            'metadata.transactionId': transactionData.transactionId
          });

          if (!existingAlert && transactionData.amount > 0) {
            // Create alert for new transaction
            const alert = new Alert({
              user: req.user._id || req.user.id,
              type: 'fraud', // Default to fraud, AI will classify
              title: `New Transaction: ${transactionData.merchant}`,
              description: `Transaction of ₹${transactionData.amount} detected from ${transactionData.merchant}`,
              merchant: transactionData.merchant,
              amount: transactionData.amount,
              date: new Date(date),
              transactionDate: new Date(date),
              metadata: {
                source: 'gmail_import',
                transactionId: transactionData.transactionId,
                confidence: 0.7
              }
            });

            await alert.save();
            newAlerts.push(alert);
          }
        }
      } catch (error) {
        console.error(`Error processing email ${message.id}:`, error);
      }
    }

    // Update last sync time
    user.gmailTokens.lastSync = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Gmail sync completed',
      data: {
        transactionsProcessed: transactions.length,
        newAlerts: newAlerts.length,
        lastSync: user.gmailTokens.lastSync
      }
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Gmail transactions',
      error: error.message
    });
  }
});

// Helper function to extract transaction data from email
async function extractTransactionData(emailData, subject, from) {
  try {
    // This is a simplified extraction - in a real app, you'd use the NLP service
    const body = getEmailBody(emailData);
    
    // Simple regex patterns for common transaction formats
    const amountPattern = /₹\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const merchantPattern = /(?:to|from|at)\s+([A-Za-z\s]+?)(?:\s|$|\.|,)/g;
    
    const amountMatch = body.match(amountPattern);
    const merchantMatch = body.match(merchantPattern);
    
    if (amountMatch && merchantMatch) {
      const amount = parseFloat(amountMatch[0].replace(/[₹,\s]/g, ''));
      const merchant = merchantMatch[0].replace(/(?:to|from|at)\s+/i, '').trim();
      
      return {
        amount: amount,
        merchant: merchant,
        transactionId: emailData.id,
        date: new Date(),
        source: 'gmail'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting transaction data:', error);
    return null;
  }
}

// Helper function to get email body text
function getEmailBody(emailData) {
  try {
    let body = '';
    
    function extractText(part) {
      if (part.body && part.body.data) {
        return Buffer.from(part.body.data, 'base64').toString();
      }
      
      if (part.parts) {
        return part.parts.map(extractText).join(' ');
      }
      
      return '';
    }
    
    if (emailData.payload) {
      body = extractText(emailData.payload);
    }
    
    return body;
  } catch (error) {
    console.error('Error extracting email body:', error);
    return '';
  }
}

// @route   POST /api/gmail/watch
// @desc    Set up Gmail push notifications
// @access  Private
router.post('/watch', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user || !user.gmailConnected) {
      return res.status(400).json({
        success: false,
        message: 'Gmail not connected'
      });
    }

    // Set up Gmail API client
    oauth2Client.setCredentials({
      access_token: user.gmailTokens.accessToken,
      refresh_token: user.gmailTokens.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Set up watch for new emails
    const watchResponse = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/topics/gmail-notifications`,
        labelIds: ['INBOX'],
        labelFilterBehavior: 'include'
      }
    });

    res.json({
      success: true,
      message: 'Gmail watch set up successfully',
      data: {
        historyId: watchResponse.data.historyId,
        expiration: watchResponse.data.expiration
      }
    });
  } catch (error) {
    console.error('Gmail watch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set up Gmail watch',
      error: error.message
    });
  }
});

module.exports = router;
