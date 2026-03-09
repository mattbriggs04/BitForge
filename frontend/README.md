# Frontend (Next.js)

App Router frontend for BitForge.

## Routes

- `/` landing page
- `/problems` catalog
- `/problems/[slug]` detail + solve workbench
- `/api/backend/[...path]` proxy to backend API

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Config

`BACKEND_API_URL` is used by server components and proxy routes.
