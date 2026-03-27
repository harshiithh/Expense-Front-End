#!/bin/bash

# ===============================
# 🚀 Full-Stack Expense Tracker Deployment Script
# ===============================

# --- CONFIGURATION ---
FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"
BACKEND_RENDER_URL="https://expense-front-end-2bp1.onrender.com"
VITE_ENV_FILE="$FRONTEND_DIR/.env"
REQUIRED_JAVA_VERSION=17

# ===============================
echo "1️⃣ Checking Java version..."
JAVA_MAJOR=$(java -version 2>&1 | awk -F[\".] '/version/ {print $2}')
if [ "$JAVA_MAJOR" -ne $REQUIRED_JAVA_VERSION ]; then
    echo "❌ Java $REQUIRED_JAVA_VERSION required. Current version: $JAVA_MAJOR"
    echo "Please switch your terminal to JDK $REQUIRED_JAVA_VERSION using:"
    echo "export JAVA_HOME=\$(/usr/libexec/java_home -v 17)"
    echo "export PATH=\$JAVA_HOME/bin:\$PATH"
    exit 1
fi
echo "✅ Java version $JAVA_MAJOR detected."

# ===============================
echo "2️⃣ Updating frontend environment variable..."
echo "VITE_API_URL=$BACKEND_RENDER_URL/api" > $VITE_ENV_FILE
echo "✅ Updated $VITE_ENV_FILE"

# ===============================
echo "3️⃣ Building frontend..."
cd $FRONTEND_DIR || exit
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
echo "✅ Frontend build complete"

# ===============================
echo "4️⃣ Pushing frontend to GitHub (Vercel auto-deploy)..."
git add .
git commit -m "Update API URL for production" || echo "No changes to commit"
git push origin main
echo "✅ Frontend pushed. Vercel will auto-deploy."

# ===============================
echo "5️⃣ Building backend..."
cd ../$BACKEND_DIR || exit
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✅ Backend build complete"

# ===============================
echo "6️⃣ Pushing backend to GitHub (Render auto-deploy)..."
git add .
git commit -m "Backend production update" || echo "No changes to commit"
git push origin main
echo "✅ Backend pushed. Render will auto-deploy."

# ===============================
echo "7️⃣ Testing backend endpoints..."
HEALTH_URL="$BACKEND_RENDER_URL/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ Backend is healthy at $HEALTH_URL"
else
    echo "⚠️ Backend health check failed! Status: $HTTP_STATUS"
fi

# ===============================
echo "8️⃣ Deployment Complete!"
echo "Frontend URL: https://<your-vercel-frontend>.vercel.app"
echo "Backend URL: $BACKEND_RENDER_URL"
