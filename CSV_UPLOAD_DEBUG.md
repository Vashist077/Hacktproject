# CSV Upload Debug Guide

## Issue: "Failed to upload" but file dialog opens

This means the frontend is working but there's an issue with the backend processing.

## Debugging Steps:

### 1. Check Backend Server
Make sure your backend server is running:
```bash
cd Hacktproject/backend
npm start
```

### 2. Check Console Logs
Open browser developer tools (F12) and check the Console tab for errors.

### 3. Check Network Tab
1. Open Developer Tools → Network tab
2. Try uploading a CSV file
3. Look for the `/api/subscriptions/upload-csv` request
4. Check the response status and error message

### 4. Check Backend Logs
Look at your backend server console for error messages. The updated code now includes detailed logging.

### 5. Test Authentication
First, test if you're properly logged in:
1. Go to: `http://localhost:5000/api/subscriptions/test`
2. You should get a JSON response with user info
3. If you get 401 error, you need to log in first

### 6. Test with Sample CSV
Use the provided `sample_subscriptions.csv` file:
- It has the correct format
- All required fields are present
- File size is small

## Common Issues & Solutions:

### Issue 1: Authentication Error (401)
**Symptoms:** "Access token required" or "Invalid token"
**Solution:** 
- Make sure you're logged in
- Check if token is stored in localStorage
- Try logging out and logging in again

### Issue 2: File Not Found (404)
**Symptoms:** "Route not found"
**Solution:**
- Make sure backend server is running on port 5000
- Check if the route `/api/subscriptions/upload-csv` exists

### Issue 3: Database Connection Error
**Symptoms:** Database-related errors in backend logs
**Solution:**
- Check if PostgreSQL is running
- Verify database credentials in `.env` file
- Make sure database exists

### Issue 4: File Upload Error
**Symptoms:** "No file uploaded" or multer errors
**Solution:**
- Check if `uploads` directory exists in backend
- Verify file is actually selected
- Check file size (should be under 10MB)

### Issue 5: CSV Parsing Error
**Symptoms:** "Failed to parse CSV file"
**Solution:**
- Make sure file is actually a CSV
- Check CSV format matches the expected columns
- Verify file is not corrupted

## Testing Steps:

1. **Login First:**
   - Go to your app
   - Login with valid credentials
   - Verify you can see the dashboard

2. **Test Backend Connection:**
   - Open browser console
   - Go to: `http://localhost:5000/api/subscriptions/test`
   - Should return JSON with user info

3. **Test CSV Upload:**
   - Go to Subscriptions page
   - Click "Upload CSV"
   - Select `sample_subscriptions.csv`
   - Check console for detailed logs

4. **Check Results:**
   - Look for success/error messages
   - Check if subscriptions appear in the list
   - Verify backend logs for processing details

## Expected Behavior:

### Successful Upload:
- File dialog opens ✅
- File is selected ✅
- "Uploading..." appears ✅
- Success message shows ✅
- Subscriptions list updates ✅
- Backend logs show processing details ✅

### Failed Upload:
- File dialog opens ✅
- File is selected ✅
- "Uploading..." appears ✅
- Error message shows ❌
- Check console/network tabs for details ❌

## Quick Fix Commands:

```bash
# Restart backend
cd Hacktproject/backend
npm start

# Check if uploads directory exists
ls -la uploads/

# Create uploads directory if missing
mkdir uploads

# Check database connection
cd Hacktproject/backend
node test-connection.js
```

## Still Having Issues?

1. Check the browser console for JavaScript errors
2. Check the Network tab for HTTP errors
3. Check the backend server console for server errors
4. Verify all environment variables are set correctly
5. Make sure the database is running and accessible
