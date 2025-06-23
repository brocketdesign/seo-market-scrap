#!/bin/bash
# startup.sh - Initialization script for the Scraper System

echo "====================================================================="
echo "Initializing SEO Market Scraper System"
echo "====================================================================="

# Navigate to project root
cd $(dirname "$0")

echo "Starting backend services..."
cd backend

# Install any missing dependencies
echo "Checking for missing dependencies..."
npm install

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating default .env file..."
  echo "NODE_ENV=development" > .env
  echo "BACKEND_PORT=5001" >> .env
  echo "MONGODB_URI=mongodb://localhost:27017/seo-market-scraper" >> .env
  echo "JWT_SECRET=your_jwt_secret_here" >> .env
  echo "JWT_EXPIRE=30d" >> .env
fi

# Start the backend server in the background
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"

# Navigate to frontend directory
cd ../frontend

# Install any missing dependencies
echo "Checking for frontend dependencies..."
npm install

# Create a .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating default .env.local file..."
  echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
  echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
  echo "NEXTAUTH_SECRET=your_nextauth_secret_here" >> .env.local
fi

# Start the frontend server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "Frontend server started with PID: $FRONTEND_PID"

echo "====================================================================="
echo "System initialized successfully!"
echo "Frontend running at: http://localhost:3000"
echo "Backend running at: http://localhost:5001"
echo "====================================================================="
echo "To stop the servers, press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"

# Keep the script running until interrupted
wait
