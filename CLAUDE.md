# Vault - Personal Finance Manager

## Project Overview
Personal finance dashboard built with Next.js 16, connecting to Monzo bank for transaction tracking, budgeting, debt management, and net worth visualization.

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
- [x] Landing page with premium dark theme
- [x] Dashboard overview with charts
- [x] Transactions page with filters/pagination
- [x] Budgets page with progress tracking
- [x] Debts page with avalanche/snowball calculator
- [x] Net Worth page with asset/liability breakdown
- [x] Settings page with preferences
- [x] Database schema designed (Drizzle ORM)
- [x] Monzo Google Sheets import (parser, importer, API route)
- [x] Sync button in Settings page
- [ ] Monzo API OAuth integration
- [ ] Supabase authentication
- [ ] Vercel deployment

## Implementation Plan

### Phase 1: Google Sheets Import (COMPLETE)
1. [x] Discover sheet structure (tabs: Personal Account Transactions, Joint Account Transactions)
2. [x] Build sheets import utility (`src/lib/sheets/`)
   - `types.ts` - TypeScript types for Monzo sheet data
   - `parser.ts` - Parse sheet rows to transaction format
   - `import.ts` - Database import logic with deduplication
3. [x] Create sync API route (`src/app/api/sync/sheets/route.ts`)
4. [x] Add sync button to Settings page

### Phase 2: Monzo API + Webhooks
1. Register at developers.monzo.com
2. Implement OAuth flow (`/api/auth/monzo/`)
3. Initial transaction fetch (within 5min SCA window)
4. Webhook setup (`/api/webhooks/monzo/`)
5. Background sync via Vercel Cron

### Phase 3: Polish
- Sync status indicators
- Error handling & retry logic
- Category mapping (Monzo → App categories)
- Conflict resolution for edits

## API Routes (To Be Created)

| Route | Purpose |
|-------|---------|
| `GET /api/sync/sheets` | Sync from Google Sheets |
| `GET /api/auth/monzo` | Initiate Monzo OAuth |
| `GET /api/auth/monzo/callback` | Handle OAuth callback |
| `POST /api/webhooks/monzo` | Receive transaction webhooks |

## References
- [Monzo API Docs](https://docs.monzo.com/)
- [Monzo Developer Portal](https://developers.monzo.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
