# Deployment Guide

## Heroku Deployment

### Environment Variables Required

Make sure to set these environment variables in Heroku:

```bash
# Database
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set MONGODB_NAME="your_database_name"

# JWT Secret
heroku config:set JWT_SECRET="your_jwt_secret_here"
heroku config:set JWT_EXPIRE="30d"

# Frontend API URL (IMPORTANT: Set to empty string to avoid double /api/api)
heroku config:set NEXT_PUBLIC_API_URL="localhost:${process.env.PORT}"

# NextAuth Configuration
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set NEXTAUTH_SECRET="your_nextauth_secret_here"

# Node Environment
heroku config:set NODE_ENV="production"
```

### Important Notes

1. **NEXT_PUBLIC_API_URL**: Must be set to `localhost:${process.env.PORT}` in production. The frontend code already appends `/api/...` to API calls, so setting this to `/api` would result in double `/api/api/...` URLs.

2. **Build Process**: The `heroku-postbuild` script will automatically:
   - Install backend dependencies
   - Install frontend dependencies  
   - Build the frontend for production (static export)

3. **Static Serving**: The backend server serves the frontend static files in production mode.

### Deployment Commands

```bash
# Deploy to Heroku
git add .
git commit -m "Deploy to production"
git push heroku main

# Check logs
heroku logs --tail

# Set config vars
heroku config:set NEXT_PUBLIC_API_URL=""
```

### Troubleshooting

- If you see `/api/api/...` URLs in logs, check that `NEXT_PUBLIC_API_URL` is set to `localhost:${process.env.PORT}`
- If frontend doesn't load, check that the frontend build completed successfully in build logs
- Use `heroku logs --tail` to monitor real-time logs during deployment
