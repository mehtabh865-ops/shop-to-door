# Shop to Door - Full Architecture & Render Deployment Guide

Yeh document explain karta hai ki **Backend** aur **Frontend** kis tarah **100% alag-alag (Decoupled & Industry Standard)** hain aur Render par kaise 2 minutes me deploy hote hain.

---

## 1. 🏗️ Architecture Overview

```
shop to door/
│
├── backend/                  <--- [BACKEND REST API - Node.js + Express + MongoDB Atlas]
│   ├── src/
│   │   ├── index.js          (Server entry point on PORT 5000 or process.env.PORT)
│   │   ├── app.js            (Express app, CORS, security, healthcheck '/')
│   │   ├── models/           (User, Shop, Product, Combo, Coupon, Order)
│   │   ├── routes/v1/        (Auth, Shops, Products, Combos, Coupons, Orders)
│   │   └── services/         (Business logic & DB queries)
│   └── package.json          (start: "node src/index.js")
│
└── frontend/                 <--- [FRONTEND CLIENT - React 19 + Vite + Tailwind + PWA]
    ├── src/
    │   ├── App.jsx           (Separated Customer App, Dukandar Portal & Login Gate)
    │   └── api.js            (Points to VITE_API_URL backend)
    └── package.json          (build: "vite build")
```

---

## 2. 💻 Local Testing (Laptop & Wi-Fi)

1. **Backend Start karein:**
   ```bash
   cd backend
   npm install
   node src/index.js
   # Output: Listening to port 5000, Connected to MongoDB
   ```

2. **Frontend Start karein:**
   ```bash
   cd frontend
   npm install
   npm run preview -- --host --port 5173
   # Output: Local: http://localhost:5173, Network: http://192.168.1.3:5173
   ```

---

## 3. 🚀 Render Par 24/7 Production Deployment (2 Simple Steps)

### STEP 1: Backend Deploy Karein (As Render "Web Service")
1. Render Dashboard (`dashboard.render.com`) me jayein.
2. **"New +" ➔ "Web Service"** dabayein.
3. GitHub repository connect karein: `shop-to-door`.
4. Settings set karein:
   - **Name**: `shop-to-door-backend`
   - **Region**: Singapore ya Oregon
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables** me ye 5 variables dalein:
   - `NODE_ENV` = `production`
   - `MONGODB_URL` = `mongodb+srv://mehtabh865_db_user:password123@cluster0.is8wxqj.mongodb.net/shoptodoor?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` = `shoptodoor_jwt_secret_key_2026_secure`
   - `JWT_ACCESS_EXPIRATION_MINUTES` = `10080`
   - `JWT_REFRESH_EXPIRATION_DAYS` = `30`
6. **"Deploy Web Service"** dabayein.
7. Deploy hone par Render aapko URL dega (e.g., `https://shop-to-door-backend.onrender.com`).
   - Browser me kholein: `https://shop-to-door-backend.onrender.com/` ➔ `{"status":"online"}` dikhega.

---

### STEP 2: Frontend Deploy Karein (As Render "Static Site")
1. Render Dashboard me **"New +" ➔ "Static Site"** dabayein (ya existing static site use karein).
2. GitHub repo `shop-to-door` select karein.
3. Settings:
   - **Name**: `shop-to-door`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables** me dalein:
   - `VITE_API_URL` = `https://shop-to-door-backend.onrender.com/v1` *(Step 1 ka backend link + /v1)*
5. **"Create Static Site"** dabayein.

Ab aapka frontend aur backend pure industry standard ke sath 24/7 bina laptop on rakhe cloud par live chalega!
