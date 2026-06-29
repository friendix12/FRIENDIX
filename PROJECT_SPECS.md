# Friendix Social Media Platform - Technical Specifications & Deployment Documentation

This document contains the complete configuration, database credentials, deployment mappings, API keys, and system architecture for the Friendix social network application. Any AI assistant or developer reading this document can immediately take over development, understand the tech stack, and deploy changes correctly.

---

## 🚀 Quick Reference Summary
*   **Production App URL**: [https://friendix-app.vercel.app](https://friendix-app.vercel.app)
*   **Production Backend API URL**: [https://friendix-api.vercel.app](https://friendix-api.vercel.app)
*   **GitHub Repository**: [https://github.com/friendix12/FRIENDIX](https://github.com/friendix12/FRIENDIX)

---

## 🛠 Tech Stack Overview

1.  **Frontend**: Single Page Application (SPA) built with **React (Vite)**. Styling is written in **Vanilla CSS** (No TailwindCSS).
2.  **Backend**: REST API built with **Node.js, Express, and Mongoose**.
3.  **Database**: **MongoDB Atlas** (Cloud Database).
4.  **Storage**: **Telegram Bot API Storage** (Files/Images are uploaded to Telegram channels/bots as database storage. Cloudinary is configured as an optional fallback).

---

## 🔑 Database Credentials

*   **Database Provider**: MongoDB Atlas
*   **Database URI**: `mongodb+srv://biswasbti_db_user:Gnpit3cpVOxAczNu@cluster0.iepfoqh.mongodb.net/friendix?retryWrites=true&w=majority&appName=Cluster0`
*   **Connection Database**: `friendix`
*   **Mongoose Models**:
    *   `User`: Handles user data, friend lists, followers, password hashes, bio, location, education, work, gender, dob, admin privileges, and bans.
    *   `Post`: Handles posts, descriptions, tags, likes, comments, and media URLs.
    *   `Story`: Handles 24-hour temporary stories (auto-expires using MongoDB's TTL index).
    *   `Group`: Handles communities/groups, members, descriptions, and privacy.
    *   `Message`: Handles real-time chats between users.
    *   `Notification`: Handles system notification logs.
    *   `Product`: Handles marketplace items.
    *   `CloudinaryConfig`: Stores optional Cloudinary credentials set by the administrator.

---

## 📂 GitHub Repository & Token Details

*   **Repository URL**: `https://github.com/friendix12/FRIENDIX.git`
*   **GitHub Username**: `friendix12`
*   **Primary Development Branch**: `main`
*   **GitHub Personal Access Token (Classic)**: `ghp_M0z4...HucmR`
    *   *Usage & Retrieval*: Stored inside git remote origin URL for push/pull auth. Any local assistant or developer can retrieve the full token directly from `[remote "origin"]` URL inside the `.git/config` file.
    *   *Remote origin URL pattern*: `https://<YOUR_TOKEN_HERE>@github.com/friendix12/FRIENDIX.git`

---

## ⛅ Vercel Production Deployments

*   **Vercel Account Username**: `biswasbti-8083`
*   **Associated Organization**: `my-s-projects19`
*   **Automatic Deployments**: Linked to the GitHub repository. Pushing code to `main` branch triggers auto-builds on Vercel.

### 1. Backend Service (`/backend`)
*   **Vercel Project Name**: `friendix-api`
*   **Production API URL**: `https://friendix-api.vercel.app`
*   **Manual Deploy Command** (run inside `backend/` folder):
    ```bash
    vercel --prod --yes
    ```

### 2. Frontend Application (`/frontend`)
*   **Vercel Project Name**: `friendix-app`
*   **Production App URL**: `https://friendix-app.vercel.app`
*   **Manual Deploy Command** (run inside `frontend/` folder):
    ```bash
    vercel --prod --yes
    ```

---

## 🔒 Configuration & Environment Variables

### Backend Config (`backend/.env`):
```env
PORT=5000
NODE_ENV=production

# MongoDB URI
MONGO_URI=mongodb+srv://biswasbti_db_user:Gnpit3cpVOxAczNu@cluster0.iepfoqh.mongodb.net/friendix?retryWrites=true&w=majority&appName=Cluster0

# JWT Auth Secret
JWT_SECRET=friendix_super_secret_jwt_key_2024_do_not_share
JWT_EXPIRES_IN=30d

# CORS Allowed Origin
CLIENT_URL=https://friendix-app.vercel.app

# Telegram Media Storage Config
STORAGE_PROVIDER=telegram
TELEGRAM_BOT_TOKEN=8973841556:AAFgx0uuRvDnp13-NZ29XNwqMKrFQfNQI2A
TELEGRAM_CHAT_ID=-1003680485341
```

### Frontend Config (`frontend/.env.production`):
```env
VITE_API_URL=https://friendix-api.vercel.app/api
```

---

## 🤖 AI Programming Guidelines (Read Before Modifying Code)

When implementing new features or fixing bugs in this repository, always follow these architecture patterns:

1.  **Do Not Cache User Data in Profile Pages**:
    *   Always query `usersAPI.getProfile(targetId)` unconditionally in `ProfilePage.jsx`. Do not short-circuit with local `currentUser` variables, as the cached user might contain unpopulated MongoDB string IDs instead of fully-populated user objects.
2.  **Ensure Symmetrical Friends/Request Updates**:
    *   Friend requests, accepts, unfriend actions, and declines must perform symmetrical updates on BOTH the actor and the target user documents (e.g. pulling/pushing on `friends`, `friendRequests`, and `sentRequests` in the same database transaction).
3.  **Always Populate Friend Entities Fully**:
    *   When returning user objects containing a `friends` array, always populate it with `fullName firstName lastName avatar` on the backend query to ensure correct avatar initials and profile routing paths.
4.  **Stories Persistence**:
    *   Stories must NOT be stored in browser `localStorage`. Always store them in the MongoDB database using the `Story` model and fetch them through `/api/stories`.
5.  **Vanilla CSS & Styled Overlays**:
    *   Do NOT install or use TailwindCSS unless explicitly instructed by the user.
    *   When uploading files (avatars, covers), use absolute overlays inside the parent container rather than setting global loading states which cause page unmounting and visual screen flashes.
