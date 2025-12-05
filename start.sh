#!/bin/bash

# WatchWise Local Development Startup Script

echo "🚀 Starting WatchWise..."

# Clear any processes on ports 5001 and 3000
echo "📍 Clearing ports..."
lsof -ti:5001,3000,3001 | xargs kill -9 2>/dev/null
sleep 1

# Start backend server
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait a moment for servers to initialize
sleep 3

echo ""
echo "✅ WatchWise is running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Frontend: http://localhost:3001"
echo "🔌 Backend:  http://localhost:5001"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running and handle Ctrl+C
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait
