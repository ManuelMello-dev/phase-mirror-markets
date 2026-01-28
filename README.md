# phase-mirror-markets

A Railway-deployable monorepo with a Vite + React frontend and Express + TypeScript backend API.

## 📁 Structure

This is a monorepo containing two deployable services:

- **`apps/web`** - Vite + React frontend
- **`apps/app`** - Express + TypeScript backend API (Quant Oracle)

## 🚀 Railway Deployment

To deploy on Railway:

1. Create two separate Railway services:
   - **Frontend Service**: Set Root Directory to `apps/web`
   - **Backend Service**: Set Root Directory to `apps/app`

2. Railway will automatically detect:
   - Vite build for the frontend
   - Node.js for the backend

3. Environment variables (if needed):
   - `PORT` is automatically provided by Railway

## 💻 Local Development

### Install dependencies

```bash
npm install
```

### Run services

**Backend API:**
```bash
npm run dev:app
```

**Frontend:**
```bash
npm run dev:web
```

### Build services

**Backend API:**
```bash
npm run build:app
```

**Frontend:**
```bash
npm run build:web
```

## 🔌 API Endpoints

The backend API (`apps/app`) provides:

- `GET /` - Returns API name and status
- `GET /health` - Health check endpoint
- `GET /oracle/signal?symbol=BTC-USD` - Returns trading signal data

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5
- **Backend**: Express, TypeScript, Node.js
- **Package Manager**: npm workspaces