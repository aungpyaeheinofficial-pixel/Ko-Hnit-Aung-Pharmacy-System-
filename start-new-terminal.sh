#!/bin/bash

# Ko Hnit Aung Pharmacy - Start in New Terminal

echo "🚀 Starting Ko Hnit Aung Pharmacy System..."
echo ""

# Kill any existing servers
echo "📌 Stopping any existing servers..."
lsof -ti:4000 | xargs kill 2>/dev/null || true
lsof -ti:5173 | xargs kill 2>/dev/null || true
sleep 2

echo "✅ Servers stopped"
echo ""

# Start Backend in background
echo "🔧 Starting Backend Server (Port 4000)..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 5

# Check backend health
echo "🔍 Checking Backend..."
curl -s http://localhost:4000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running"
else
    echo "   ⚠️  Backend not ready yet, waiting..."
    sleep 5
fi

echo ""

# Start Frontend in background
echo "🎨 Starting Frontend Server (Port 5173)..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Ko Hnit Aung Pharmacy System is RUNNING!"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:4000"
echo ""
echo "🔐 Login:"
echo "   Email:    admin@kohnitaung.com"
echo "   Password: password"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Stop servers:"
echo "   npm run stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep script running
while true; do
    sleep 1
done
