# Weight Tracker

A simple weight tracking application built with Next.js, React, and Vercel Blob storage.

## Features

- Track weight over time
- Log fasting periods
- Track energy levels
- Add notes for each entry
- Beautiful charts to visualize your progress
- Data stored in Vercel Blob storage

## Setup

### Local Development with Vercel Blob

This application uses Vercel Blob Storage to store data. To run it locally, you need to set up a Blob storage token:

1. **Create a Vercel Blob Storage**:
   - Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to Storage > Create > Blob
   - Create a new Blob storage instance

2. **Get your Blob Token**:
   - In your Blob storage dashboard, go to "Access Tokens"
   - Create a new token with read/write permissions
   - Copy the token

3. **Set up environment variables**:
   - Create a `.env.local` file in the project root
   - Add the following variables:
     ```
     BLOB_READ_WRITE_TOKEN=your_token_here
     VERCEL_BLOB_STORE_ID=your_store_id_here
     NEXT_PUBLIC_USE_LOCAL_STORAGE=false
     ```

4. **Install dependencies and run the app**:
   ```
   npm install
   npm run dev
   ```

### Deployment to Vercel

1. Create a new project on Vercel
2. Link your GitHub repository
3. Add the environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `VERCEL_BLOB_STORE_ID`
   - `NEXT_PUBLIC_USE_LOCAL_STORAGE` (set to "false")
4. Deploy

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS v4
- shadcn/ui
- Recharts for data visualization
- Vercel Blob for data storage

