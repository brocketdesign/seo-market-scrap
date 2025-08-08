# Token Validation & Redirect Testing Guide

This document provides step-by-step instructions for testing the token validation and redirect system.

## Prerequisites

1. WordPress site (`https://yuuyasumi.com`) must be running with the updated plugin
2. Your app (`https://app.rakurabu.com/ja/`) must be running
3. Both backend and frontend should be started

## Testing Steps

### 1. Test WordPress Token Generation

First, verify that WordPress can generate tokens:

```bash
curl -X POST https://yuuyasumi.com/wp-json/myapi/v1/get-token \
  -H "Content-Type: application/json" \
  -d '{"secret": "KnixnLd3"}'
```

Expected response:
```json
{
  "token": "some-uuid-token",
  "expires_in": 60
}
```

### 2. Test WordPress Token Validation

Test the new external validation endpoint:

```bash
curl -X POST https://yuuyasumi.com/wp-json/myapi/v1/validate-external-token \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "KnixnLd3",
    "token": "YOUR_TOKEN_HERE",
    "domain": "app.rakurabu.com"
  }'
```

Expected response (if token is valid):
```json
{
  "success": true,
  "message": "Token is valid",
  "origin": "websiteA",
  "domain": "app.rakurabu.com"
}
```

### 3. Test Your App's Token Validation

Test your app's backend validation endpoint:

```bash
curl -X POST http://localhost:5000/api/affiliation/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Token is valid",
  "origin": "websiteA"
}
```

### 4. Test Redirect URL Generation

Test getting redirect URLs:

```bash
curl -X GET "http://localhost:5000/api/affiliation/redirect/86?token=YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "success": true,
  "pageId": 86,
  "redirectUrl": "//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3736574&pid=891642258",
  "affiliateName": "Yahoo ショッピング",
  "category": "ショッピング",
  "hasToken": true
}
```

### 5. Test Frontend Integration

1. Start your development servers:
   ```bash
   # In backend directory
   npm run dev
   
   # In frontend directory (separate terminal)
   npm run dev
   ```

2. Visit the test pages with a token:
   - `http://localhost:3000/ja/yahoo?t=YOUR_TOKEN_HERE`
   - `http://localhost:3000/ja/expedia?t=YOUR_TOKEN_HERE`

3. Verify that:
   - The token is validated
   - The page content loads
   - Automatic redirection occurs to the affiliate URL
   - The token is removed from the URL after processing
   - A cookie is set to prevent duplicate redirections

### 6. Test Error Scenarios

#### Invalid Token
```bash
curl -X POST http://localhost:5000/api/affiliation/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid-token"}'
```

#### Invalid Page ID
```bash
curl -X GET "http://localhost:5000/api/affiliation/redirect/999?token=YOUR_TOKEN_HERE"
```

#### Missing Token
```bash
curl -X POST http://localhost:5000/api/affiliation/validate-token \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Integration Testing

### Full Flow Test

1. Get a token from WordPress:
   ```javascript
   // In browser console on a partner site
   fetch('https://yuuyasumi.com/wp-json/myapi/v1/get-token', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ secret: 'KnixnLd3' })
   })
   .then(res => res.json())
   .then(data => console.log('Token:', data.token));
   ```

2. Use the token to visit your app:
   ```
   https://app.rakurabu.com/ja/yahoo?t=THE_TOKEN_FROM_STEP_1
   ```

3. Verify the complete flow:
   - Token validation occurs
   - User sees the page briefly
   - Automatic redirection to affiliate link
   - URL is cleaned up
   - Cookie prevents duplicate redirections

## Monitoring & Debugging

### Backend Logs
Check your backend console for request logs:
```
[TIMESTAMP] [BACKEND] POST /api/affiliation/validate-token
[TIMESTAMP] [BACKEND] Response 200 for POST /api/affiliation/validate-token
```

### Frontend Debugging
Open browser developer tools and check:
- Network tab for API calls
- Console for any JavaScript errors
- Application tab for cookies being set

### WordPress Debugging
Check WordPress debug logs for:
- Token generation requests
- Token validation requests
- Transient storage/retrieval

## Production Considerations

1. **CORS Configuration**: Ensure your app's domain is added to WordPress CORS headers
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse
3. **Token Expiry**: Adjust token expiry times based on your needs
4. **Error Handling**: Implement proper error logging and monitoring
5. **Security**: Consider using HTTPS only in production
6. **Database Storage**: For better performance, consider storing affiliate mappings in database

## Troubleshooting

### Common Issues

1. **CORS Errors**: Add your app domain to WordPress CORS settings
2. **Token Not Found**: Check if token has expired (60-second default)
3. **Redirect Not Working**: Verify affiliate URL mappings
4. **Multiple Redirects**: Check cookie implementation and expiry

### Debug Mode

To enable debug mode, add to your environment:
```
NODE_ENV=development
DEBUG=true
```
