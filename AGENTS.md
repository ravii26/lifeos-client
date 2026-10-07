# AGENTS.md: lifeos-client (Ally web)

> Web app for **Ally** (formerly LifeOS). It becomes "desk mode" for the same places as mobile
> (Now · Plan · Notes · You) in build step 7. **Lower priority than mobile**; the phone app is the product.
> Full context: workspace root `AGENTS.md`, `docs/`, `product-design/12-final-plan.md`. Branch: **`lifeos-2.0`**.

## Commands
```bash
npm install
npm run dev        # :5173 (VITE_API_BASE_URL in .env, default http://localhost:3000/api/v1)
npm run build      # tsc -b && vite build
npm test           # vitest
```

## Stack
React 19 · Vite · TypeScript · Redux Toolkit / RTK Query (`src/lib/api`) · Tailwind 4 · `react-router-dom`.
Env is validated in `src/lib/env.ts` (`VITE_API_BASE_URL` must be a URL).

## State today
Renamed to Ally (user-visible). It still has the old LifeOS page set (dashboard, areas, goals, library…) and does **not**
yet have chat, today's card, undo or offline. Don't invest in the old pages; step 7 rebuilds the web as desk mode.

## Deploy
Vercel (`vercel.json`: Vite build + SPA rewrites). Env `VITE_API_BASE_URL=https://lifeos-api-2sjo.onrender.com/api/v1`;
add the Vercel URL to the API's `CORS_ORIGINS`.
