# Gmail OAuth Setup Guide

## Error 400: invalid_request - Solution

The "Error 400: invalid_request" occurs because Gmail OAuth credentials are not properly configured. Follow these steps to fix it:

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "SubGuard Gmail Integration"
4. Click "Create"

## Step 2: Enable Gmail API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" → "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "SubGuard"
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Add test users (your Gmail address)

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "SubGuard Gmail Integration"
   - Authorized redirect URIs: `http://localhost:5000/api/gmail/callback`
   - Click "Create"

5. Copy the Client ID and Client Secret

## Step 4: Update Environment Variables

Update your `Hacktproject/backend/.env` file:

```env
# Gmail OAuth Configuration
GMAIL_CLIENT_ID=your-actual-client-id-here
GMAIL_CLIENT_SECRET=your-actual-client-secret-here
GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/callback
GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
```

## Step 5: Test the Integration

1. Restart your backend server
2. Go to Dashboard in your app
3. Click "Connect Gmail"
4. You should be redirected to Google OAuth page
5. Grant permissions
6. You'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"invalid_request" error**: 
   - Check if Client ID and Client Secret are correct
   - Ensure redirect URI matches exactly: `http://localhost:5000/api/gmail/callback`

2. **"redirect_uri_mismatch" error**:
   - Make sure the redirect URI in Google Cloud Console matches your .env file
   - Check for trailing slashes or http vs https

3. **"access_denied" error**:
   - Make sure you've added your Gmail address as a test user
   - Check OAuth consent screen configuration

4. **"unauthorized_client" error**:
   - Verify the Client ID is correct
   - Make sure the OAuth consent screen is properly configured

## Alternative: Disable Gmail Integration

If you don't want to set up Gmail integration right now, you can:

1. Comment out the Gmail integration section in the Dashboard
2. Focus on testing the CSV upload functionality first
3. Set up Gmail integration later when needed

## Testing CSV Upload (Works Without Gmail)

The CSV upload functionality works independently and doesn't require Gmail setup:

1. Go to Subscriptions page
2. Click "Upload CSV"
3. Select the `sample_subscriptions.csv` file
4. Watch for success message

This will help you test the core functionality while you set up Gmail integration separately.
