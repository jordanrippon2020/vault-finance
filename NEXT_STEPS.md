# Vault - Next Steps

> Personal Finance Manager - Development Roadmap

---

## Phase 1: Infrastructure Setup

### 1.1 Supabase Setup
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy project URL and anon key to `.env.local`
- [ ] Enable Row Level Security on all tables
- [ ] Set up authentication providers (magic link email)

### 1.2 Database Migration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add `DATABASE_URL` from Supabase (Settings > Database > Connection string)
- [ ] Run `pnpm drizzle-kit push` to create tables
- [ ] Verify tables in Supabase dashboard

### 1.3 Environment Variables
```bash
# Required for Phase 1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

---

## Phase 2: Authentication

### 2.1 Auth Flow
- [ ] Create `/login` page with magic link form
- [ ] Create `/signup` page
- [ ] Set up Supabase auth middleware
- [ ] Protect `/dashboard/*` routes
- [ ] Add session management

### 2.2 User Profile
- [ ] Create user record on first login
- [ ] Settings page for preferences (currency, debt strategy)
- [ ] Profile editing

---

## Phase 3: Monzo Integration

### 3.1 Developer Setup
- [ ] Register at [developers.monzo.com](https://developers.monzo.com)
- [ ] Create OAuth client (set redirect URI to `/api/auth/monzo/callback`)
- [ ] Add `MONZO_CLIENT_ID` and `MONZO_CLIENT_SECRET` to `.env.local`

### 3.2 OAuth Flow
- [ ] Create `/api/auth/monzo/route.ts` - initiates OAuth
- [ ] Create `/api/auth/monzo/callback/route.ts` - handles callback
- [ ] Store encrypted tokens in database
- [ ] Handle token refresh

### 3.3 Data Sync
- [ ] Create `/api/sync/monzo/route.ts` - syncs transactions
- [ ] Map Monzo categories to app categories
- [ ] Implement duplicate detection (external_id)
- [ ] Set up Vercel Cron for automatic sync (every 6 hours)

---

## Phase 4: Google Sheets Import (Fallback)

### 4.1 Setup
- [ ] Google Cloud Console project
- [ ] Enable Sheets API
- [ ] OAuth credentials for Sheets access

### 4.2 Import Wizard
- [ ] Create `/dashboard/import` page
- [ ] Sheet URL input and validation
- [ ] Column mapping interface
- [ ] Preview before import
- [ ] Import progress tracking

### 4.3 Your Existing Data
- [ ] Import Monzo Transactions sheet
- [ ] Import debt workbook data (£250/mo, avalanche strategy)
- [ ] Map to existing schema

---

## Phase 5: Core Features

### 5.1 Transactions Page
- [ ] Create `/dashboard/transactions/page.tsx`
- [ ] Filterable/searchable transaction list
- [ ] Category assignment
- [ ] Date range filtering
- [ ] Export to CSV

### 5.2 Budgets Page
- [ ] Create `/dashboard/budgets/page.tsx`
- [ ] Budget creation form (category, amount, period)
- [ ] Progress bars showing spent vs budget
- [ ] Monthly/weekly toggle
- [ ] Overspend warnings

### 5.3 Debts Page
- [ ] Create `/dashboard/debts/page.tsx`
- [ ] Debt entry form (name, balance, APR, minimum)
- [ ] Avalanche vs Snowball comparison
- [ ] Payoff timeline visualization
- [ ] Payment logging
- [ ] Interest saved calculator

### 5.4 Net Worth Page
- [ ] Create `/dashboard/net-worth/page.tsx`
- [ ] Asset/liability breakdown
- [ ] Historical snapshots (auto-captured monthly)
- [ ] Net worth trend chart
- [ ] Manual asset entry (property, vehicles)

---

## Phase 6: Polish & Launch

### 6.1 UI Refinements
- [ ] Mobile responsive testing
- [ ] Loading states (skeletons)
- [ ] Error boundaries
- [ ] Empty states

### 6.2 Notifications
- [ ] Budget overspend alerts
- [ ] Sync status notifications
- [ ] Bill reminders (future)

### 6.3 Data Export
- [ ] Export all data as JSON
- [ ] Export transactions as CSV
- [ ] Download statements

### 6.4 Deployment
- [ ] Deploy to Vercel
- [ ] Set up environment variables in Vercel
- [ ] Configure Vercel Cron for sync
- [ ] Custom domain (optional)

---

## Quick Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm lint                   # Run ESLint

# Database
pnpm drizzle-kit push       # Push schema to database
pnpm drizzle-kit studio     # Open Drizzle Studio GUI
pnpm drizzle-kit generate   # Generate migration files

# Components
pnpm dlx shadcn@latest add [component]  # Add shadcn component
```

---

## File Locations

| Feature | Location |
|---------|----------|
| Landing page | `src/app/page.tsx` |
| Dashboard layout | `src/app/dashboard/layout.tsx` |
| Dashboard home | `src/app/dashboard/page.tsx` |
| Database schema | `src/lib/db/schema.ts` |
| UI components | `src/components/ui/` |
| Global styles | `src/app/globals.css` |

---

## Resources

- [Monzo API Docs](https://docs.monzo.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Framer Motion](https://www.framer.com/motion/)

---

## Notes

- **Monzo API**: Personal use only, not for public apps
- **Debt Strategy**: Your existing workbook uses Avalanche (highest APR first)
- **Monthly Budget**: £250 allocated to debt payments
- **Planning Horizon**: 60 months in debt workbook

---

*Last updated: January 2026*
