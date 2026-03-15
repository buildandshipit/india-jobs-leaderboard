# India Tech Jobs Leaderboard

A Next.js web application that scrapes job listings from top tech companies and displays a leaderboard ranking companies by number of open positions in India.

## Features

- **Leaderboard Rankings** - Companies ranked by job count with medal indicators
- **Company Detail Pages** - View all jobs for a specific company with search functionality
- **Job Scrapers** - Automated scrapers for Microsoft, Amazon, Apple, and Google
- **SQLite Database** - Lightweight database with Prisma ORM
- **Scheduled Scraping** - Optional node-cron scheduler for periodic updates
- **Dark Mode Support** - Tailwind CSS with automatic dark mode

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Scraping:** Custom scrapers with fetch API
- **Scheduling:** node-cron

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/buildandshipit/india-jobs-leaderboard.git
cd india-jobs-leaderboard

# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the leaderboard.

## Usage

### Scraping Jobs

Click the "Refresh Data" button in the header, or trigger via API:

```bash
# Scrape all companies
curl -X POST http://localhost:3000/api/scrape

# Scrape a specific company
curl -X POST http://localhost:3000/api/scrape?company=microsoft
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leaderboard` | GET | Get ranked list of companies |
| `/api/jobs` | GET | Get jobs (supports `?company=slug&search=query`) |
| `/api/scrape` | POST | Trigger job scraping |
| `/api/scrape` | GET | Get scrape history/logs |
| `/api/health` | GET | Health check with stats |

## Project Structure

```
india-jobs-leaderboard/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── companies/[slug]/ # Company detail page
│   │   ├── page.tsx          # Leaderboard homepage
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   ├── lib/
│   │   ├── db.ts             # Prisma client
│   │   ├── scheduler.ts      # Cron scheduler
│   │   └── scrapers/         # Company scrapers
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
└── scripts/
    └── scrape.ts             # Manual scrape script
```

## Supported Companies

| Company | Scraper Status |
|---------|----------------|
| Microsoft | JSON API |
| Amazon | JSON API |
| Apple | JSON API |
| Google | Requires Puppeteer (fallback) |

## Database Schema

- **Company** - Company info (name, slug, logo, website)
- **Job** - Job listings (title, location, department, URL)
- **ScrapeLog** - Scrape history (status, job count, duration)

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push schema to database
npm run db:studio  # Open Prisma Studio
```

## License

MIT
