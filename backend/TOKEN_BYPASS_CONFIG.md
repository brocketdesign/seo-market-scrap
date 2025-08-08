# Token Validation Bypass Configuration

This document explains the token validation bypass functionality for Heroku deployment.

## Environment Variables

### `BYPASS_TOKEN_VALIDATION`
- **Type**: Boolean string (`'true'` or `'false'`)
- **Default**: `'false'`
- **Description**: When set to `'true'`, bypasses WordPress API token validation and only validates token format
- **Usage**: Set this to `'true'` in environments where WordPress API connectivity is unreliable

### `NODE_ENV`
- **Type**: String
- **Values**: `'development'`, `'production'`
- **Description**: When set to `'production'`, automatically enables bypass mode
- **Usage**: Heroku automatically sets this to `'production'`

### `DYNO` (Heroku-specific)
- **Type**: String (automatically set by Heroku)
- **Description**: When present, indicates running on Heroku and automatically enables bypass mode

## Bypass Logic

The system will bypass WordPress API token validation in the following scenarios:

1. **Heroku Environment**: Automatically detected when `NODE_ENV=production` or `DYNO` variable exists
2. **Manual Override**: When `BYPASS_TOKEN_VALIDATION=true` is set
3. **Network Fallback**: When WordPress API is unreachable, falls back to token format validation
4. **Error Fallback**: When any error occurs during validation, uses token format validation as last resort

## Token Format Validation

When bypassing WordPress API validation, the system validates tokens using a UUID pattern:
```regex
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
```

Examples of valid tokens:
- `5fa092f5-83e0-4087-a127-574c75a6d43f`
- `123e4567-e89b-12d3-a456-426614174000`

## Response Indicators

When bypass is used, the API response includes additional fields:

```json
{
  "success": true,
  "message": "Token is valid (bypassed)",
  "origin": "heroku_bypass",
  "bypassed": true
}
```

Possible `origin` values:
- `heroku_bypass`: Bypass due to Heroku environment
- `network_bypass`: Bypass due to network connectivity issues
- `error_bypass`: Bypass due to system errors

## Security Considerations

- Bypass mode only validates token format, not authenticity
- In bypass mode, any properly formatted UUID will be accepted as valid
- This is designed for production environments where WordPress connectivity is unreliable
- For development/testing with full validation, ensure `NODE_ENV` is not set to `'production'`

## Testing

To test bypass functionality locally:
```bash
export BYPASS_TOKEN_VALIDATION=true
node src/server.js
```

To test normal validation:
```bash
unset BYPASS_TOKEN_VALIDATION
export NODE_ENV=development
node src/server.js
```
