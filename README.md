# CoreframeAI Radar

This is a minimal Next.js (App Router) application that serves content at https://radar.coreframeai.com.

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

To run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/radar](http://localhost:3000/radar) to view the page locally.

### Production Build

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Deployment

This project is configured to deploy automatically to Vercel when changes are pushed to the `main` branch.

### How to Redeploy

Simply push your changes to the `main` branch:

```bash
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically build and deploy the changes.

## Vercel Configuration

- **Production Branch**: main
- **Custom Domain**: radar.coreframeai.com (CNAME already points to Vercel)

## Project Structure

```
app/
  radar/
    page.tsx          ← returns minimal placeholder
next.config.js        ← host-based rewrite
package.json
tsconfig.json
.gitignore
README.md
```

The application is configured to serve the `/radar` route as the default document when accessed via the `radar.coreframeai.com` domain.
