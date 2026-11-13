# Royal Ludo - Deployment Guide

## 1. Environment Configurations
See `.env.example` at root for required keys:
- `PORT`: Server port (default 4000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing tokens
- `REDIS_URL`: Redis connection (optional for single-node development, required for multi-pod scaling)
- `EXPO_PUBLIC_API_URL`: Client REST API target
- `EXPO_PUBLIC_SOCKET_URL`: Client Socket.IO target

## 2. Server Deployment
- Production container using Dockerfile:
  ```bash
  cd server
  docker build -t royal-ludo-server .
  docker run -p 4000:4000 royal-ludo-server
  ```
- Compatible with cloud environments: Railway, Render, AWS ECS, GCP Cloud Run.

## 3. Mobile Client Deployment (Expo EAS Build)
- Install EAS CLI: `npm install -g eas-cli`
- Configure `eas.json` for Android APK (preview) and Android App Bundle (.aab for Google Play Store).
- Command:
  ```bash
  cd mobile
  eas build --platform android --profile preview
  ```
