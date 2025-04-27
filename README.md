# CoreframeAI Hashtag Trend Radar

A real-time dashboard that tracks and displays hashtag trends across social media platforms, separating surface-level mass adoption trends from deeper builder-focused trends.

## 🚀 Features

- **Dual-column Trend Dashboard**: Surface waves (mass adoption) and Builder currents (deep tech)
- **Real-time Updates**: Auto-refreshes every 60 seconds
- **Trend Simulation**: Hourly data generation via GitHub Actions
- **Responsive Design**: Works on mobile and desktop

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (file-based, dev-only)
- **State Management**: SWR for data fetching
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
