# KrishiMitra Deployment & MongoDB Atlas Setup Guide

This guide explains how to connect KrishiMitra to **MongoDB Atlas** (cloud database) and deploy both the Frontend and Backend services.

---

## 1. Setting Up MongoDB Atlas

MongoDB Atlas is a fully managed cloud database. Follow these steps to set it up:

### Step 1: Create an Account and Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create** to deploy a new cluster. Select the **M0 (Free)** tier.
3. Choose your preferred Cloud Provider (e.g., AWS) and Region closest to your users (e.g., Mumbai for India).
4. Click **Create Deployment**.

### Step 2: Configure Database Access (User)
1. In the Security section on the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Choose **Password** authentication.
4. Enter a username (e.g., `krishi_user`) and a secure password. *Write this down!*
5. Under Database User Privileges, select **Read and write to any database**.
6. Click **Add User**.

### Step 3: Configure Network Access (IP Whitelist)
1. In the Security section, click **Network Access**.
2. Click **Add IP Address**.
3. To test locally or deploy on dynamic cloud environments (like Render/Vercel), click **Allow Access From Anywhere** (which adds `0.0.0.0/0`).
4. Click **Confirm**.

### Step 4: Get Your Connection String
1. Go to the **Database / Clusters** tab on the left.
2. Click the **Connect** button next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It will look like this:
   `mongodb+srv://<db_username>:<db_password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

---

## 2. Configuring Backend for Atlas

1. Open `backend/.env` on your system.
2. Replace the `MONGODB_URI` with the copied connection string.
3. Replace `<db_username>` with your Atlas username and `<db_password>` with your database password.
4. Specify a database name in the path (e.g., `/krishimitra`), like this:
   ```env
   MONGODB_URI=mongodb+srv://krishi_user:YOUR_SECRET_PASSWORD@cluster0.xxxx.mongodb.net/krishimitra?retryWrites=true&w=majority
   ```
5. When you restart the backend, Mongoose will connect directly to MongoDB Atlas in the cloud!

---

## 3. How to Deploy the Application

### Option A: Deploying Backend (e.g., Render / Railway / Heroku)
1. Create a repository on GitHub and push the code (containing `backend/` and `frontend/` directories).
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build` (or similar build steps)
   - **Start Command**: `node dist/server.js` (or `npm run start`)
5. In the **Environment Variables** section on Render, add all keys from your `backend/.env`:
   - `MONGODB_URI` (pointing to your Atlas cluster)
   - `PORT` = `10000` (or let Render assign it)
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
   - `ENCRYPTION_KEY` (64-character hex)
   - `GEMINI_API_KEY` (Your Gemini API key)

### Option B: Deploying Frontend (e.g., Vercel / Netlify / Render)
1. Create a new **Project** on [Vercel](https://vercel.com/).
2. Select the same GitHub repository.
3. Configure the settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set up proxy or update API base URL:
   - Since Vercel hosts the static site, update your backend base URL in `frontend/src/utils/api.ts` to your live backend URL (e.g., `https://your-backend.onrender.com`) instead of `http://localhost:5000` during production builds.
