# Supabase Setup Guide

To use Supabase as your database for the AI Counsellor project, follow these steps:

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Give it a name (e.g., `ai-counsellor`), set a strong database password, and choose a region close to your Render deployment.

## 2. Get the Connection String
1. Once the project is ready, go to **Project Settings** (gear icon) -> **Database**.
2. Look for the **Connection string** section.
3. Select **URI** (not Node.js or Go).
4. Copy the URL. It should look something like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

> [!IMPORTANT]
> Change the password in the URI to the one you set during project creation.

## 3. Configure Render
When setting up your services on Render (using the `render.yaml` I provided), you will need to paste this URI into the `DATABASE_URL` environment variable for both the **API** and the **Agent** services.

## 4. Run Migrations
After you have the `DATABASE_URL`, you can run the migrations locally to set up the tables on Supabase:

1. Update your local `.env` file temporarily with the Supabase `DATABASE_URL`.
2. Run:
   ```bash
   cd backend
   alembic upgrade head
   ```

