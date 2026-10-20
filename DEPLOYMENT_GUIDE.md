# Shop to Door - Full Decoupled Production Deployment Guide (Render & Cloud)

Yeh document explain karta hai ki **Backend (Unified Engine)** aur **Frontend (Client PWA)** Render par alag-alag kaise 2 minute me 100% live deploy hote hain.

---

## 🏗️ Architecture Overview

```text
shop to door/
│
├── unified-engine/auth-backend/    <--- [BACKEND WEB SERVICE]
│   ├── src/index.js                (Server entry point, connects to MongoDB Atlas)
│   ├── src/models/                 (User, Shop, Product, Combo, Coupon, Order)
│   ├── src/routes/v1/              (Auth, Shops, Products, Combos, Coupons, Orders)
│   └── package.json                (Node 20.x, start: "node src/index.js")
│
└── frontend/                       <--- [FRONTEND STATIC SITE - PWA]
    ├── src/App.jsx                 (Claude-style UI, Customer & Dukandar Portals)
    ├── src/api.js                  (Connects directly to backend VITE_API_URL)
    └── package.json                (build: "vite build" -> dist)
```

---

## 🚀 STEP 1: Backend Deploy Karein (Render Web Service)

1. Render Dashboard (`dashboard.render.com`) me jayein.
2. Click **"New +" ➔ "Web Service"**.
3. Apni GitHub repository select karein: `shop-to-door`.
4. Yeh settings bharein:
   - **Name**: `shop-to-door-backend`
   - **Language / Runtime**: `Node`
   - **Root Directory**: `unified-engine/auth-backend` *(Bohat zaroori hai!)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Niche **"Environment Variables"** me ye 5 variables add karein:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URL` | `mongodb+srv://mehtabh865_db_user:m6ZdOWOL2quv4g7w@cluster0.is8wxqj.mongodb.net/shoptodoor?retryWrites=true&w=majority` |
| `JWT_SECRET` | `super_secret_jwt_key_shop_to_door_2026_hyperlocal_auth_secure` |
| `JWT_ACCESS_EXPIRATION_MINUTES` | `10080` |
| `JWT_REFRESH_EXPIRATION_DAYS` | `30` |

6. Click **"Deploy Web Service"**.
7. Render aapko aapka live backend URL dega (e.g. `https://shop-to-door-backend.onrender.com`).
   - Browser me kholein: `https://shop-to-door-backend.onrender.com/` ➔ Output: `{"status":"online","service":"Shop to Door Unified Engine"}`.

---

## 🌐 STEP 2: Frontend Deploy Karein (Render Static Site)

1. Render Dashboard me click **"New +" ➔ "Static Site"**.
2. Wahi GitHub repo connect karein: `shop-to-door`.
3. Yeh settings dalein:
   - **Name**: `shop-to-door`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables** me dalein:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://shop-to-door-backend.onrender.com/v1` *(Step 1 ka backend URL + `/v1`)*
5. Click **"Create Static Site"**.

---

Aapka poora hyperlocal system 24/7 cloud par MongoDB Atlas ke sath seamlessly chalega!
