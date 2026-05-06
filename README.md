## Overview

This project has:

1. Frontend: React app in this folder.
2. Backend: Node.js + Express + Socket.IO app in ../backend.

## Local Development

### 1) Run Backend

From the backend folder:

1. cd ../backend
2. npm install
3. npm start

Backend runs on http://localhost:5000 by default.

### 2) Run Frontend

From this folder:

1. npm install
2. npm start

Frontend runs on http://localhost:3000.

## Frontend Build Commands

From this folder:

1. npm install
2. npm run build

Optional preview of production build:

1. npx serve -s build

## Deployment Setup

### Backend on Render

Service settings:

1. Root Directory: backend (or fleet/backend based on repo root)
2. Build Command: npm install
3. Start Command: npm start

Environment variables:

1. FRONTEND_ORIGIN=https://your-frontend.vercel.app

### Frontend on Vercel

Project settings:

1. Root Directory: frontend/fleet
2. Install Command: npm install
3. Build Command: npm run build
4. Output Directory: build

Environment variables:

1. REACT_APP_API_URL=https://fleet-syec.onrender.com
2. REACT_APP_SOCKET_URL=https://fleet-syec.onrender.com

## Troubleshooting

If you see Missing script: build on backend deployment, ensure Render Build Command is npm install (or add a backend build script).

If you see Cannot find module express, verify backend Root Directory is correct and redeploy with cleared build cache.

## Note

As of my academic examinations, I cannot continue further at the moment. I have also been learning some more libraries while working on this project.
