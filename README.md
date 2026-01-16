# Vault - Personal Finance Manager

A modern personal finance dashboard for tracking transactions, budgets, debts, and net worth. Built with Next.js 16 and integrated with Monzo bank via Google Sheets auto-export.

![Next.js](https://img.shields.io/badge/Next.js-16.1.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)

## Features

- **Transaction Tracking** - Import and categorize transactions from Monzo
- **Budget Management** - Set and track monthly budgets by category
- **Debt Payoff Calculator** - Avalanche and snowball debt repayment strategies
- **Net Worth Dashboard** - Track assets and liabilities over time
- **Google Sheets Sync** - Auto-import from Monzo Plus/Premium export

## Screenshots

| Dashboard | Transactions | Budgets |
|-----------|--------------|---------|
| Overview with charts | Filter & search | Progress tracking |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Authentication**: Supabase Auth (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Google Cloud project with Sheets API enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vault-finance.git
   cd vault-finance
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your credentials (see [Environment Variables](#environment-variables))

4. **Push database schema**
   ```bash
   pnpm drizzle-kit push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Direct connection for Drizzle)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your-api-key

# Monzo API (Phase 2 - Optional)
MONZO_CLIENT_ID=
MONZO_CLIENT_SECRET=
MONZO_REDIRECT_URI=http://localhost:3000/api/auth/monzo/callback

# Security
ENCRYPTION_KEY=generate-32-byte-hex-key

# Cron Secret (for scheduled sync)
CRON_SECRET=
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── sync/sheets/     # Google Sheets sync endpoint
│   ├── dashboard/
│   │   ├── budgets/         # Budget management
│   │   ├── debts/           # Debt payoff calculator
│   │   ├── net-worth/       # Net worth tracking
│   │   ├── settings/        # App settings & sync
│   │   └── transactions/    # Transaction list
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── db/
    │   ├── index.ts         # Database connection
    │   └── schema.ts        # Drizzle ORM schema
    ├── sheets/
    │   ├── import.ts        # Import logic
    │   ├── parser.ts        # Parse Monzo exports
    │   └── types.ts         # TypeScript types
    └── utils.ts             # Utility functions
```

## Data Sources

### Monzo Google Sheets (Primary)

If you have Monzo Plus/Premium, transactions auto-export to Google Sheets:

1. Enable auto-export in Monzo app (Plus/Premium feature)
2. Share the spreadsheet publicly (read-only)
3. Add the spreadsheet ID to your `.env`
4. Use Settings > Sync to import transactions

### Monzo API (Phase 2 - Planned)

Direct API integration for real-time transaction sync via webhooks.

## Database Schema

Key tables:

- `users` - User accounts
- `accounts` - Bank accounts (Monzo personal, joint)
- `transactions` - Individual transactions with external IDs for deduplication
- `categories` - Transaction categories with Monzo mapping
- `budgets` - Monthly budget targets
- `debts` - Debt tracking for payoff calculator
- `net_worth_snapshots` - Point-in-time net worth records
- `import_logs` - Sync history and status

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm drizzle-kit push    # Push schema to database
pnpm drizzle-kit studio  # Open Drizzle Studio
```

## Roadmap

- [x] Landing page with premium dark theme
- [x] Dashboard overview with charts
- [x] Transactions page with filters/pagination
- [x] Budgets page with progress tracking
- [x] Debts page with avalanche/snowball calculator
- [x] Net Worth page with asset/liability breakdown
- [x] Settings page with preferences
- [x] Database schema (Drizzle ORM)
- [x] Google Sheets import (3,975 transactions imported)
- [ ] Monzo API OAuth integration
- [ ] Real-time webhooks for new transactions
- [ ] Supabase authentication
- [ ] Vercel deployment with cron jobs
- [ ] Mobile-responsive refinements

## Contributing

This is a personal project, but feel free to fork and adapt for your own use.

## License

MIT

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Monzo](https://monzo.com/) for excellent banking APIs
- [Supabase](https://supabase.com/) for the backend platform
