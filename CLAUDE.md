# Vault - Personal Finance Manager

**Repository**: https://github.com/jordanrippon2020/vault-finance

## Project Overview
Personal finance dashboard built with Next.js 16, connecting to Monzo bank for transaction tracking, budgeting, debt management, and net worth visualization.

---

## Development Workflow

### Git Branching Strategy
```
main (production-ready)
  └── feature/xxx (new features)
  └── fix/xxx (bug fixes)
  └── chore/xxx (maintenance, docs, refactoring)
```

### For Each Feature/Fix:
1. **Create GitHub Issue** - Describe the work, add labels
2. **Create feature branch** - `git checkout -b feature/issue-number-short-description`
3. **Make commits** - Small, atomic commits with clear messages
4. **Push & create PR** - Reference the issue (`Closes #123`)
5. **Merge to main** - Squash merge to keep history clean

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- chore: Maintenance
- docs: Documentation
- refactor: Code restructure
- test: Adding tests

Examples:
- feat(auth): add Supabase authentication
- fix(transactions): correct date parsing for UK format
- chore(deps): update dependencies
```

### GitHub Issue Labels
- `enhancement` - New feature
- `bug` - Something broken
- `priority: high/medium/low`
- `phase: 2/3/4`

---

## Tech Stack
- **Framework**: Next.js 16.1.2 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **UI**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Charts**: Recharts
- **Auth**: Supabase Auth (planned)

## Key Directories
- `src/app/` - Next.js pages and API routes
- `src/app/dashboard/` - Dashboard pages (transactions, budgets, debts, net-worth, settings)
- `src/components/ui/` - shadcn/ui components
- `src/lib/db/` - Drizzle schema and database utilities
- `src/lib/monzo/` - Monzo API client (to be created)
- `src/lib/sheets/` - Google Sheets import utilities (to be created)

## Commands
```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm drizzle-kit push # Push schema to database
pnpm drizzle-kit studio # Open Drizzle Studio
```

## Environment Variables
See `.env.example` for required variables:
- Supabase credentials (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY)
- Monzo API credentials (MONZO_CLIENT_ID, MONZO_CLIENT_SECRET, MONZO_REDIRECT_URI)
- Google OAuth credentials
- Encryption key for token storage (ENCRYPTION_KEY)

## Data Sources

### Monzo Google Sheets (Primary - Phase 1)
- **Spreadsheet ID**: `1m9Qi53V2fZwU-Fj9In4QSyiecx-qhdcW5BcLKtPKVM4`
- Auto-exported transactions via Monzo Plus
- Access via Google Sheets API or MCP google-workspace tools

**Sheet Tabs:**
- `Personal Account Transactions` - Main personal account data
- `Joint Account Transactions` - Joint account data
- `Hello 👋` - Welcome/info tab (ignore)

**Column Structure (A-P):**
| Column | Header | Example | Maps To |
|--------|--------|---------|---------|
| A | Transaction ID | `tx_0000APMTEY74z1cuTDtu2k` | `externalId` |
| B | Date | `07/11/2022` (DD/MM/YYYY) | `date` |
| C | Time | `13:16:31` | `date` (combined) |
| D | Type | `Card payment`, `Pot transfer` | `paymentMethod` |
| E | Name | `Tesco`, `Monzo Plus` | `merchant` |
| F | Emoji | `⛽️`, `🍎` | `merchantLogo` (placeholder) |
| G | Category | `Groceries`, `Transport` | `categoryId` (mapped) |
| H | Amount | `-40.05`, `100.00` | `amount` |
| I | Currency | `GBP` | `currency` |
| J | Local amount | `-40.05` | (ignore, use H) |
| K | Local currency | `GBP` | (ignore) |
| L | Notes and #tags | `MONZO-LMBHJ` | `notes` |
| M | Address | `14 Loughgall Road` | `location` |
| N | Receipt | (URL) | `receiptUrl` |
| O | Description | `SPAR LOUGHGALL ROAD` | `description` |
| P | Category split | (JSON) | (ignore for now) |

### Monzo API (Phase 2)
- OAuth 2.0 authentication via developers.monzo.com
- Direct API access to transactions, accounts, balances
- Webhooks for real-time `transaction.created` events
- **Important**: After 5 mins post-auth, only last 90 days accessible (SCA restriction)

### Debt Workbook
- **Spreadsheet ID**: `1XTDj4pgeLO9_obuFEWLFwM80UQxQVfnpJtJbO7WiYD8`
- Budget: £250/mo for debt repayment
- Strategy: Avalanche method

## Database Schema

Key tables supporting Monzo integration:

```typescript
// transactions table
externalId: text('external_id').unique()  // Monzo transaction ID
merchant: text('merchant')                 // Monzo merchant name
merchantLogo: text('merchant_logo')        // Monzo logo URL

// accounts table
externalId: text('external_id')            // Monzo account ID
lastSyncedAt: timestamp('last_synced_at')

// categories table
monzoCategory: text('monzo_category')      // Maps Monzo categories

// userTokens table
provider: text('provider')                 // 'monzo' | 'google'
accessToken: text('access_token')          // Encrypted
refreshToken: text('refresh_token')        // Encrypted
expiresAt: timestamp('expires_at')

// importLogs table
source: text('source')                     // 'monzo_api' | 'monzo_sheets' | 'csv'
```

## Current Status

### Phase 1: Foundation (COMPLETE)
- [x] Landing page with premium dark theme
- [x] Dashboard overview with charts
- [x] Transactions page with filters/pagination
- [x] Budgets page with progress tracking
- [x] Debts page with avalanche/snowball calculator
- [x] Net Worth page with asset/liability breakdown
- [x] Settings page with preferences
- [x] Database schema designed (Drizzle ORM)
- [x] Monzo Google Sheets import (3,975 transactions)
- [x] GitHub repository setup

### Phase 2: Authentication & Data (IN PROGRESS)
Track progress: https://github.com/jordanrippon2020/vault-finance/issues

- [ ] #1 Add Supabase Authentication
- [ ] #2 Wire transactions page to real database
- [ ] #3 Wire budgets page to real data
- [ ] #4 Wire net worth page to real data
- [ ] #5 Import debt data from Google Sheets

### Phase 3: Monzo API Integration
- [ ] #6 Implement Monzo OAuth flow
- [ ] #7 Add Monzo webhook endpoint
- [ ] #8 Token refresh background job

### Phase 4: Deployment & Polish
- [ ] #9 Deploy to Vercel
- [ ] #10 Add scheduled sync cron job
- [ ] #11 Category management UI
- [ ] #12 Mobile responsive refinements

## API Routes

| Route | Status | Purpose |
|-------|--------|---------|
| `POST /api/sync/sheets` | ✅ | Sync from Google Sheets |
| `GET /api/auth/monzo` | Planned | Initiate Monzo OAuth |
| `GET /api/auth/monzo/callback` | Planned | Handle OAuth callback |
| `POST /api/webhooks/monzo` | Planned | Receive transaction webhooks |
| `POST /api/cron/sync-sheets` | Planned | Scheduled sync |
| `POST /api/cron/refresh-tokens` | Planned | Token refresh |

## References
- [GitHub Issues](https://github.com/jordanrippon2020/vault-finance/issues)
- [Monzo API Docs](https://docs.monzo.com/)
- [Monzo Developer Portal](https://developers.monzo.com/)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
