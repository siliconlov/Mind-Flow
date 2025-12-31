# Deployment Guide for MindFlow

This guide steps you through deploying your MindFlow application to production using **Render** (Backend & Database) and **Vercel** (Frontend).

## Prerequisites

- GitHub Account (project pushed to a repo).
- [Render Account](https://render.com/) (for Backend & DB).
- [Vercel Account](https://vercel.com/) (for Frontend).

---

## Part 1: Database Setup (PostgreSQL)

Your local app uses SQLite. For production, you **must** use PostgreSQL.

1.  **Create a Database on Render**:
    - Go to your Render Dashboard used "New +".
    - Select **PostgreSQL**.
    - Name it `mindflow-db`.
    - Pick a region and the "Free" plan.
    - Click **Create Database**.
    - **Wait** for it to be created.
    - Copy the **Internal Database URL** (for Render backend) and **External Database URL** (for your local machine if you want to run migrations from your PC).

2.  **Update `schema.prisma`**:
    > **WARNING**: This will break your local SQLite setup if you don't swap it back. We recommend creating a separate branch for deployment or carefully managing this file.

    Open `server/prisma/schema.prisma` and change the datasource provider:

    ```prisma
    datasource db {
      provider = "postgresql" // CHANGED from "sqlite"
      url      = env("DATABASE_URL")
    }
    ```

3.  **Run Migrations**:
    Inside `server/` directory, run:
    ```bash
    # On Windows Powershell
    $env:DATABASE_URL="YOUR_EXTERNAL_POSTGRES_URL_FROM_RENDER"
    npx prisma migrate deploy
    ```
    *Note: If you have issues connecting from your PC, you can also run this command as a "Build Command" on Render, or use the "Internal Database URL" if deployment is automated.*

---

## Part 2: Backend Deployment (Render)

1.  **New Web Service**:
    - On Render Dashboard, select "New +", then **Web Service**.
    - Connect your GitHub repository `Mind-Flow`.
    - Select the root directory (or allow it to detect).

2.  **Configure Service**:
    - **Name**: `mindflow-api`
    - **Root Directory**: `MindFlow/server` (Correct!)
    - **Runtime**: Node
    - **Build Command**: `npm install && npm run build && npx prisma migrate deploy`
    - **Start Command**: `npm start`

3.  **Environment Variables**:
    Add the following variables in the "Environment" tab:
    - `DATABASE_URL`: Your **Internal** Render Database URL.
    - `JWT_SECRET`: A long random string (e.g., generate one [here](https://generate-secret.vercel.app/32)).
    - `PERPLEXITY_API_KEY`: Your Perplexity AI API Key.
    - `NODE_ENV`: `production`

4.  **Deploy**:
    - Click **Create Web Service**.
    - Wait for the build to finish.
    - Copy your backend URL (e.g., `https://mindflow-api.onrender.com`).

---

## Part 3: Frontend Deployment (Vercel)

1.  **New Project**:
    - Go to Vercel Dashboard, click "Add New...", then **Project**.
    - Import your `Mind-Flow` repository.

2.  **Configure Project**:
    - **Framework Preset**: Vite (Should auto-detect).
    - **Root Directory**: Click "Edit" and select `MindFlow/client`.

3.  **Environment Variables**:
    - Expand "Environment Variables".
    - Add `VITE_API_URL` with the value of your **Render Backend URL** + `/api`.
      - Example: `https://mindflow-api.onrender.com/api`
      - *Note: No trailing slash at the very end usually, but check your client code logic.*

4.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy your site.

---

## Part 4: Final verification

1.  Open your Vercel URL.
2.  Try to Sign Up (this tests the database connection).
3.  Create a Note.
4.  Chat with AI (tests the Gemini API key).

**Troubleshooting**:
- **Application Error**: Check Render "Logs" to see server errors.
- **CORS Error**: Ensure your Backend `cors` configuration allows the Vercel domain (currently set to allow all `*`, which is fine for extensive testing but should be restricted later).
