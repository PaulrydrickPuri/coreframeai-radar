# CoreframeAI Hashtag Trend Radar

A real-time dashboard that tracks and displays hashtag trends across social media platforms, separating surface-level mass adoption trends from deeper builder-focused trends.

## 🚀 Features

- **Dual-column Trend Dashboard**: Surface waves (mass adoption) and Builder currents (deep tech)
- **Real-time Updates**: Auto-refreshes every 60 seconds
- **Trend Simulation**: Hourly data generation via GitHub Actions
- **Responsive Design**: Works on mobile and desktop

## Environment Variables

### Scraper Configuration

- `USER_AGENT` - Custom user agent for scraping (default: 'CoreframeAI Research Bot/1.0')
  - Used to identify our scraper to websites we're accessing
  - Should include contact information in production
  - Example: `'CoreframeAI Research Bot/1.0 (https://coreframeai.com; contact@coreframeai.com)'`

- `REQUEST_DELAY_MS` - Delay between requests in ms (default: 2000)
  - Ensures we don't overload the servers we're scraping
  - Higher values are more polite but slower
  - Recommended: 2000-5000ms for production use

### Storage Configuration

- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage read/write token
  - Required for storing trend data in Vercel Blob Storage
  - Create this token in the Vercel dashboard
  - Must be set in GitHub Actions secrets for the cron job

### Robot Politeness Guidelines

Our scraper follows these best practices:

1. **Proper identification**: Uses a descriptive user agent that identifies our bot
2. **Rate limiting**: Implements delays between requests to avoid server overload
3. **Selective scraping**: Only extracts the minimum data needed for our application
4. **Caching**: Stores results to minimize repeat requests
5. **Error handling**: Gracefully handles failures without retry loops that could stress servers

For production deployment, consider:
- Adding full contact information to the user agent
- Implementing a robots.txt parser
- Setting up IP rotation for high-volume scraping
- Adding logging and monitoring for scraper behavior

## 📊 Data Flow

1. **Scraper**: Collects trend data from Google Trends and Trends24
2. **Storage**: Stores trend data in Vercel Blob Storage with timestamps
3. **API**: Serves trend data via `/api/trends` from Blob Storage
4. **UI**: Displays trends in two columns with auto-refresh via SWR

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (stale-while-revalidate)
- **Storage**: Vercel Blob Storage
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions (hourly cron job)

## 📋 Prerequisites

- Node.js >= 20
- pnpm package manager

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/coreframeai-radar.git
cd coreframeai-radar

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev

# Access the app at http://localhost:3000/radar
```

### Running the Crawler Simulation

```bash
# Generate fake trend data
pnpm run crawler
```

### Building for Production

```bash
pnpm build
pnpm start
```

## 🏗️ Project Structure

```
.
├── app/
│   ├── radar/
│   │   └── page.tsx          ← main dashboard (C)
│   └── api/
│       └── trends/route.ts   ← returns latest trend JSON
├── crawler/
│   ├── deepresearch_schema.ts  ← TYPE + JSON-Schema (A)
│   ├── seeds.sample.json       ← sample input (A)
│   └── simulate.ts             ← fake-data generator (B)
├── data/
│   ├── trends.sqlite           ← generated (git-ignored)
│   └── fake_trends.json        ← generated hourly by simulate.ts (B)
├── scripts/
│   └── cron.sh                 ← GH-Actions entrypoint
├── .github/workflows/cron.yml  ← hourly job
├── next.config.js              ← host-based rewrite
├── tailwind.config.ts
└── README.md                   ← run + deploy docs
```

## 🔄 CI/CD Pipeline

This project uses GitHub Actions for CI/CD:

1. **Hourly Trend Simulation**: A GitHub Action runs every hour to generate new trend data
2. **Vercel Integration**: Pushes to the `main` branch trigger automatic deployment

### How to Redeploy

```bash
git add .
git commit -m "Your changes"
git push
```

## 🌐 Domain Configuration

- **Development**: https://coreframeai-radar.vercel.app
- **Production**: https://radar.coreframeai.com (CNAME already points to Vercel)

### Custom Domain Setup

The CNAME for `radar.coreframeai.com` is already configured to point to Vercel. To complete the setup:

1. Go to your Vercel project settings
2. Add `radar.coreframeai.com` as a custom domain
3. Vercel will verify the DNS configuration

## 📝 License

This project is proprietary and confidential.

---

Built with ❤️ for CoreframeAI
