# Enterprise EMI Collection System

A B2B SaaS PWA for village-based EMI collection.

## Features

- Offline-first: works without internet
- Fast agent collection (3 taps)
- Owner dashboard with reports
- Automatic sync via Firebase
- Daily email backups
- Simple numeric customer IDs

## Tech Stack

- Next.js (PWA)
- Tailwind CSS
- Dexie (IndexedDB)
- Firebase Auth & Firestore
- Vercel Deployment

## Setup

1. Clone repo
2. Install dependencies: `npm install`
3. Create Firebase project and enable Email/Password auth
4. Add Firebase config to `.env.local`
5. Run dev: `npm run dev`
6. Build: `npm run build`

## Deployment

Deploy to Vercel for free.