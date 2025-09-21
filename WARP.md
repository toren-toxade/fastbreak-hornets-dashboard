# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm run start

# Lint code
npm run lint
```

### Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Generate Auth0 secret (required)
openssl rand -hex 32
```

### Deployment
```bash
# Automated deployment (recommended)
./deploy.sh

# Manual Vercel deployment
vercel --prod
```

## Architecture Overview

This is a **Next.js 15 App Router** application with **Auth0 authentication (SDK v4)** and **TypeScript**. The app displays Charlotte Hornets player statistics through interactive dashboard widgets.

### Authentication Flow (Auth0 v4)
- Client: `@auth0/nextjs-auth0` provides `useUser` and `Auth0Provider` (see `src/app/providers.tsx`)
- Server: `@auth0/nextjs-auth0/server` `Auth0Client` instance in `src/lib/auth0.ts`
- Middleware: `src/middleware.ts` mounts `/auth/*` routes (login, logout, callback, profile) and manages sessions
- Protected routes: UI guarded by `ProtectedRoute`; server endpoints call `auth0.getSession()`
- Login/Logout links: `/auth/login`, `/auth/logout`

### Data Architecture
```
API Route (src/app/api/players/route.ts)
  → Auth check via auth0.getSession()
  → Mock Data (src/lib/mockData.ts)
  → Dashboard Widgets (Recharts)
```

- API caching: 5-minute server cache with stale-while-revalidate
- Type system: Centralized in `src/types/player.ts` (`Player`, `PlayerStats`, `DashboardData`)
- Mock data: Realistic Charlotte Hornets player stats in `src/lib/mockData.ts`

### Component Structure (high level)
```
src/
├── app/                    # Next.js App Router
│   ├── api/players/        # Player data API (auth-protected via session check)
│   ├── layout.tsx          # Root layout + Providers
│   ├── page.tsx            # Dashboard (widgets)
│   └── providers.tsx       # Auth0Provider wrapper
├── components/
│   ├── auth/               # Auth UI (Login/Logout, ProtectedRoute)
│   ├── layout/             # Layout components
│   └── widgets/            # Dashboard visualizations (Recharts)
├── lib/
│   ├── auth0.ts            # Auth0 v4 client (server)
│   ├── auth-guard.ts       # Helper to enforce session in route handlers
│   └── mockData.ts         # Charlotte Hornets mock data
├── middleware.ts           # Auth0 v4 middleware (mounts /auth/*, manages session)
└── types/player.ts         # TypeScript interfaces
```

### Dashboard Widgets
1. PlayerLeaderboard: Interactive stat category selector with top 5 players
2. ShootingEfficiencyChart: Bar chart comparing FG% vs 3P% using Recharts
3. PerformanceRadarChart: Multi-axis player comparison radar chart
4. PointsDistributionChart: Points per game distribution across roster

## Development Guidelines

### Authentication Requirements
- All dashboard routes require authentication via `ProtectedRoute`
- Server endpoints enforce auth via `auth0.getSession()` (or helper in `lib/auth-guard.ts`)
- User state accessed via `useUser()` from Auth0

### Data Flow Patterns
- Widgets fetch from `/api/players` endpoint
- API routes return structured `DashboardData` interface
- Loading states handled in individual components

### Styling Approach
- TailwindCSS for styling
- Fonts: Geist Sans and Geist Mono via next/font/google
- Charts: Recharts library
- Icons: Lucide React

### Environment Configuration (Auth0 v4)
Required environment variables in `.env.local`:
```
AUTH0_DOMAIN=           # e.g. dev-xxxx.us.auth0.com
AUTH0_CLIENT_ID=        # Auth0 application client ID
AUTH0_CLIENT_SECRET=    # Auth0 application client secret
AUTH0_SECRET=           # Generated with `openssl rand -hex 32`
APP_BASE_URL=           # http://localhost:3000 for dev
```

### Future NBA API Integration
The architecture supports replacing mock data with live NBA APIs:
- Current: `mockHornetsData` in `src/lib/mockData.ts`
- Future: integrate external NBA API in `/api/players/route.ts` before transformation layer
