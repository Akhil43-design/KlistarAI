# KlistarAI Cloud Deployment Guide

## 1. Deploy the Backend (Brain)
You need to host the AI server on a cloud provider. We recommend **Render** (Free Tier available).

### Option A: Render.com (Easiest)
1.  Push your code to GitHub (if not already).
2.  Sign up at [dashboard.render.com](https://dashboard.render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  Render will auto-detect the `render.yaml` file I created.
6.  Click **Create Web Service**.
7.  **Wait** for build to finish.
8.  **Copy the URL** (e.g., `https://klistar-ai.onrender.com`).

### Option B: Railway.app
1.  Sign up at [railway.app](https://railway.app).
2.  New Project -> Deploy from GitHub.
3.  It will detect the `Dockerfile` automatically.
4.  Wait for deployment -> Click the URL.

## 2. Update the Mobile App
Once you have your Backend URL (e.g., `https://klistar-ai.onrender.com`):

1.  Open `d:\ada_v2-main\ada_v2-main\KlistarAI_Production\.env.production`.
2.  Change the line:
    ```
    VITE_BACKEND_URL=https://klistar-ai.onrender.com
    ```
3.  **Rebuild the App**:
    - Open Terminal in `KlistarAI_Production`.
    - Run: `npm run build`
    - Run: `npx cap copy android`
    - Run: `./gradlew assembleDebug` (in android folder)

## 3. Install on Phone
- Transfer the new `app-debug.apk` to your phone.
- It will now connect to the Cloud Server automatically!
- **Note**: The first connection might take 30-60 seconds to "wake up" the free tier server.
