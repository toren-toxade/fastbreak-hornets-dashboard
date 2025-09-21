# 🏀 FastBreak - Charlotte Hornets Dashboard

A secure, interactive dashboard showcasing player statistics for the Charlotte Hornets, built with Next.js, TypeScript, and Auth0 authentication.

## ✨ Features

- **🔐 Secure Authentication**: Auth0 integration with login/logout functionality
- **📊 Interactive Visualizations**: Multiple chart types using Recharts
- **📱 Responsive Design**: Mobile-first design with TailwindCSS
- **⚡ Real-time Data**: API endpoints with caching for optimal performance
- **🎨 Modern UI**: Clean, professional interface with loading states

### Dashboard Widgets

1. **Player Leaderboard**: Top 5 players in each statistical category
2. **Shooting Efficiency**: Bar chart comparing FG% and 3-point percentage
3. **Performance Radar Chart**: Multi-axis analysis for individual players
4. **Points Distribution**: Points per game visualization across roster

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Auth0
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- Auth0 account (free tier available)
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fastbreak-hornets-dashboard
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Generate a secret for Auth0
openssl rand -hex 32
```

Update `.env.local` with your Auth0 v4 credentials:

```env
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_SECRET=your-generated-secret
APP_BASE_URL=http://localhost:3000
```

### 3. Auth0 Configuration

1. Create a new Auth0 application (Regular Web Application)
2. Set Allowed Callback URLs: `http://localhost:3000/auth/callback`
3. Set Allowed Logout URLs: `http://localhost:3000`
4. Set Allowed Web Origins: `http://localhost:3000`
5. Copy your Domain, Client ID, and Client Secret to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📊 Data Source

Currently uses mock data for Charlotte Hornets players. Live NBA data can be enabled via Ball Don't Lie API:

- Free tier: access to `/players` and `/games` endpoints (no `/stats`).
- Features using `/stats` (e.g., 10-game aggregates, per-game box scores) will return 401 on free tier.
- The UI automatically falls back to Season mode when live stats are unavailable.
- Mock data ensures widgets remain functional during development.

## 🧾 Environment Template

Copy `.env.local.example` to `.env.local` and fill in values.

## 🚢 Deployment

### Automated Deployment

```bash
# Make sure .env.local is configured
./deploy.sh
```

### Manual Vercel Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard (Production):
   - AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
   - APP_BASE_URL = https://YOUR-VERCEL-DOMAIN.vercel.app
   - NBA_API_BASE_URL = https://api.balldontlie.io/v1
   - NBA_API_KEY = your BDL key
   - NBA_API_TIER = free
   - INGEST_TOKEN = your shared secret
4. Update Auth0 URLs with production domain

Once deployed, you can run the minimal ingestion against your deployment:

```bash
TOKEN={{INGEST_TOKEN}}
curl -sS -H "x-ingest-token: $TOKEN" -H "authorization: Bearer $TOKEN" \
  -X POST 'https://YOUR-VERCEL-DOMAIN.vercel.app/api/admin/ingest-bdl?season=2024&mode=mini' | jq
```

### Environment Variables for Production (.env or Vercel Dashboard)

```
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/
│   │   └── players/     # Player data API (auth via session check)
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main dashboard
│   └── providers.tsx    # Auth0Provider wrapper
├── components/          # React components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── widgets/         # Dashboard widgets
├── lib/                 # Utilities
│   ├── auth0.ts         # Auth0 v4 server client
│   ├── auth-guard.ts    # Helper for route protection
│   └── mockData.ts      # Mock player data
├── middleware.ts        # Auth0 middleware (mounts /auth/*)
└── types/               # TypeScript definitions
    └── player.ts        # Player data types
```

### Key Components

- **ProtectedRoute**: Wraps pages requiring authentication
- **DashboardLayout**: Main layout with header and navigation
- **PlayerLeaderboard**: Interactive leaderboard with category selection
- **Charts**: Responsive visualizations using Recharts

### Adding New Features

1. **New Widget**: Create in `src/components/widgets/`
2. **API Endpoint**: Add to `src/app/api/`
3. **Types**: Define in `src/types/`
4. **Mock Data**: Update `src/lib/mockData.ts`

## 🧪 Testing

```bash
# Run build to check for errors
npm run build

# Start production build locally
npm run start

# Minimal ingestion (free-tier safe; single /players page)
npm run ingest:mini
```

## 📈 Performance

- **Loading States**: All components show loading indicators
- **API Caching**: 5-minute cache on player data endpoint
- **Responsive Images**: Optimized for all screen sizes
- **Code Splitting**: Automatic with Next.js App Router

## 🔒 Security

- Authentication: Auth0 v4 via middleware + session management
- Protected UI: `ProtectedRoute` wraps dashboard
- API Security: Route handlers enforce `auth0.getSession()` (or helper in `lib/auth-guard.ts`)
- Environment Variables: Configure Auth0 via `.env.local` (no secrets in code)
- HTTPS Only: Production deployment uses HTTPS

## 🎯 Future Enhancements

- [ ] Live NBA API integration
- [ ] Player comparison feature
- [ ] Historical data trends
- [ ] Team performance metrics
- [ ] Export functionality
- [ ] Dark mode support

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues:

1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs

---

**Built with ❤️ for Charlotte Hornets fans**
