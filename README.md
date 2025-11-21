# fooddevilery

This repository contains a Vite + React frontend located in the `my-cuzdoor-app` directory.

Deployment
- Vercel (recommended): this repo is configured to build the app from the `my-cuzdoor-app` folder via `vercel.json`.

Quick deploy (CLI):
```bash
# install Vercel CLI if you don't have it
npm install -g vercel

# deploy the app in the subdirectory non-interactively
vercel --prod --confirm --cwd my-cuzdoor-app
```

Or connect this repository in the Vercel dashboard — Vercel will run the build using the `package.json` referenced in `vercel.json`.
