# Adium

**How good are your ads?**

Adium is a multi-user ads benchmarking platform that connects to Google Ads and Facebook Ads APIs to pull performance data and benchmark it against aggregated platform averages. Compare your ad performance metrics like CTR, CPC, conversion rates, and more against other advertisers without exposing individual user data.

## Features

- 🔐 **Secure Authentication** - JWT-based user authentication system
- 🔗 **OAuth Integration** - Connect Google Ads and Facebook Ads accounts seamlessly
- 📊 **Performance Metrics** - Track impressions, clicks, spend, conversions, CTR, CPC, CPM, and more
- 📈 **Benchmark Comparison** - Compare your performance against aggregated platform averages
- 🎯 **Privacy-First** - View only aggregated benchmarks, never individual user data
- 📱 **Modern UI** - Clean, responsive React interface with real-time data visualization
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## Architecture

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL database with Prisma ORM
- JWT authentication
- Google Ads API & Facebook Marketing API integrations

**Frontend:**
- React 18 + TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Router for navigation
- TanStack Query for data fetching
- Zustand for state management
- Recharts for data visualization

### Project Structure

```
Adium/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & API integrations
│   │   ├── db/             # Database client
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema & migrations
│   └── package.json
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main app component
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Google Ads API credentials (Client ID, Client Secret, Developer Token)
- Facebook Marketing API credentials (App ID, App Secret)

### Option 1: Local Development Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd Adium
```

#### 2. Set up the backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database and API credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3000`

#### 3. Set up the frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env if needed (default: VITE_API_URL=http://localhost:3000/api)

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### Option 2: Docker Setup

The easiest way to run Adium is with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/adium

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google Ads API
GOOGLE_ADS_CLIENT_ID=your-google-client-id
GOOGLE_ADS_CLIENT_SECRET=your-google-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-google-developer-token
GOOGLE_ADS_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback

# Facebook Marketing API
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/oauth/facebook/callback

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## API Credentials Setup

### Google Ads API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Ads API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:3000/api/oauth/google/callback`
6. Apply for a Developer Token at [Google Ads API Center](https://ads.google.com/aw/apicenter)

### Facebook Marketing API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the Marketing API product
4. In App Settings, add your OAuth redirect URI: `http://localhost:3000/api/oauth/facebook/callback`
5. Request advanced access for `ads_read` and `ads_management` permissions

## Usage

### 1. Register & Login

- Navigate to `http://localhost:5173/register`
- Create an account with your email and password
- Login with your credentials

### 2. Connect Ad Accounts

- Click "Connect Google Ads" or "Connect Facebook Ads"
- Authorize Adium to access your ad accounts
- Your connected accounts will appear on the dashboard

### 3. Sync Data

- Select a date range
- Click on an ad account to sync metrics
- The system will fetch data from your connected platforms

### 4. View Benchmarks

- Your performance metrics will be displayed
- Compare against platform averages
- See percentage differences with visual indicators:
  - 🟢 Green = performing better than average
  - 🔴 Red = performing below average

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### OAuth
- `GET /api/oauth/google` - Initiate Google OAuth flow
- `GET /api/oauth/google/callback` - Google OAuth callback
- `GET /api/oauth/facebook` - Initiate Facebook OAuth flow
- `GET /api/oauth/facebook/callback` - Facebook OAuth callback

### Ad Accounts
- `GET /api/ad-accounts` - List user's ad accounts
- `GET /api/ad-accounts/:id` - Get specific ad account
- `DELETE /api/ad-accounts/:id` - Remove ad account
- `POST /api/ad-accounts/:id/sync` - Sync metrics for ad account

### Metrics
- `GET /api/metrics` - Get user's metrics
- `GET /api/metrics/account/:adAccountId` - Get metrics for specific account

### Benchmarks
- `GET /api/benchmarks` - Get benchmark data
- `GET /api/benchmarks/compare` - Compare user metrics to benchmarks
- `POST /api/benchmarks/calculate` - Trigger benchmark calculation

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts
- **ad_accounts** - Connected ad platform accounts
- **ad_metrics** - Daily performance metrics per campaign
- **benchmark_snapshots** - Aggregated daily benchmarks

See `backend/prisma/schema.prisma` for the complete schema definition.

## Key Metrics Tracked

- **Impressions** - Number of times ads were shown
- **Clicks** - Number of clicks on ads
- **Spend** - Total advertising cost
- **Conversions** - Number of conversions/purchases
- **CTR** (Click-Through Rate) - Clicks / Impressions × 100
- **CPC** (Cost Per Click) - Spend / Clicks
- **CPM** (Cost Per Mille) - Spend / Impressions × 1000
- **Conversion Rate** - Conversions / Clicks × 100
- **CPA** (Cost Per Acquisition) - Spend / Conversions

## Privacy & Data Aggregation

Adium respects user privacy:

- Individual user metrics are **never** exposed to other users
- Only aggregated, anonymized benchmarks are shared
- Benchmarks require a minimum number of users to protect privacy
- Users can only see:
  - Their own detailed metrics
  - Aggregated platform averages
  - Percentile distributions (P25, P50, P75, P90)

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management

```bash
# Create a new migration
cd backend
npm run prisma:migrate

# Open Prisma Studio (visual database browser)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Deployment

### Using Docker

The included `docker-compose.yml` sets up all services:

```bash
docker-compose up -d
```

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables for production
3. Build backend: `cd backend && npm run build`
4. Build frontend: `cd frontend && npm run build`
5. Serve backend with a process manager (PM2, systemd)
6. Serve frontend with Nginx or similar

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Run migrations: `npm run prisma:migrate`

### OAuth Not Working

- Verify redirect URIs match exactly in API console and `.env`
- Check that API credentials are correct
- Ensure the APIs are enabled in the respective developer consoles

### Frontend Can't Connect to Backend

- Verify backend is running on the correct port
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend `src/index.ts`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ for advertisers who want to know: **How good are your ads?**
