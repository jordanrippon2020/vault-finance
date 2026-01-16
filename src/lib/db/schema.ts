import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  boolean,
  date,
  integer,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const accountTypeEnum = pgEnum("account_type", [
  "checking",
  "savings",
  "credit_card",
  "loan",
  "mortgage",
  "investment",
  "pension",
  "asset",
  "other",
]);

export const budgetPeriodEnum = pgEnum("budget_period", [
  "weekly",
  "monthly",
  "yearly",
]);

export const debtStrategyEnum = pgEnum("debt_strategy", [
  "avalanche",
  "snowball",
  "custom",
]);

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  currency: text("currency").notNull().default("GBP"),
  defaultBudgetPeriod: budgetPeriodEnum("default_budget_period")
    .notNull()
    .default("monthly"),
  debtStrategy: debtStrategyEnum("debt_strategy").notNull().default("avalanche"),
  monthlyDebtPayment: decimal("monthly_debt_payment", {
    precision: 12,
    scale: 2,
  }).default("250.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  budgets: many(budgets),
  netWorthSnapshots: many(netWorthSnapshots),
}));

// ============================================================================
// ACCOUNTS
// ============================================================================

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    institution: text("institution"),
    balance: decimal("balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    currency: text("currency").notNull().default("GBP"),
    externalId: text("external_id"), // Monzo account ID
    isDebt: boolean("is_debt").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_external_id_idx").on(table.externalId),
  ]
);

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  debt: one(debts),
}));

// ============================================================================
// CATEGORIES
// ============================================================================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    parentId: uuid("parent_id"),
    color: text("color").notNull().default("#6366f1"),
    icon: text("icon").notNull().default("tag"),
    isSystem: boolean("is_system").default(false),
    monzoCategory: text("monzo_category"), // Maps to Monzo's category
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("categories_user_id_idx").on(table.userId)]
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent_child",
  }),
  children: many(categories, { relationName: "parent_child" }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    date: date("date").notNull(),
    description: text("description").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    merchant: text("merchant"),
    merchantLogo: text("merchant_logo"),
    externalId: text("external_id").unique(), // Monzo transaction ID
    notes: text("notes"),
    isExcludedFromBudget: boolean("is_excluded_from_budget").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("transactions_account_id_idx").on(table.accountId),
    index("transactions_date_idx").on(table.date),
    index("transactions_category_id_idx").on(table.categoryId),
    uniqueIndex("transactions_external_id_idx").on(table.externalId),
  ]
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

// ============================================================================
// BUDGETS
// ============================================================================

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id),
    name: text("name"), // For budgets not tied to a category
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    period: budgetPeriodEnum("period").notNull().default("monthly"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // null = ongoing
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("budgets_user_id_idx").on(table.userId)]
);

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

// ============================================================================
// DEBTS
// ============================================================================

export const debts = pgTable(
  "debts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    originalAmount: decimal("original_amount", { precision: 12, scale: 2 }).notNull(),
    interestRate: decimal("interest_rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.1899 for 18.99%
    minimumPayment: decimal("minimum_payment", { precision: 12, scale: 2 }).notNull(),
    payoffOrder: integer("payoff_order"), // For custom strategy
    targetPayoffDate: date("target_payoff_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("debts_account_id_idx").on(table.accountId)]
);

export const debtsRelations = relations(debts, ({ one }) => ({
  account: one(accounts, {
    fields: [debts.accountId],
    references: [accounts.id],
  }),
}));

// ============================================================================
// NET WORTH SNAPSHOTS
// ============================================================================

export const netWorthSnapshots = pgTable(
  "net_worth_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    totalAssets: decimal("total_assets", { precision: 14, scale: 2 }).notNull(),
    totalDebts: decimal("total_debts", { precision: 14, scale: 2 }).notNull(),
    netWorth: decimal("net_worth", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("net_worth_user_date_idx").on(table.userId, table.date),
  ]
);

export const netWorthSnapshotsRelations = relations(
  netWorthSnapshots,
  ({ one }) => ({
    user: one(users, {
      fields: [netWorthSnapshots.userId],
      references: [users.id],
    }),
  })
);

// ============================================================================
// IMPORT LOGS
// ============================================================================

export const importLogs = pgTable(
  "import_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    source: text("source").notNull(), // 'monzo_api', 'monzo_sheets', 'csv'
    fileName: text("file_name"),
    recordsProcessed: integer("records_processed").notNull().default(0),
    recordsImported: integer("records_imported").notNull().default(0),
    status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
    errorMessage: text("error_message"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("import_logs_user_id_idx").on(table.userId)]
);

// ============================================================================
// USER TOKENS (for OAuth - encrypted)
// ============================================================================

export const userTokens = pgTable(
  "user_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // 'monzo', 'google'
    accessToken: text("access_token").notNull(), // Encrypted
    refreshToken: text("refresh_token"), // Encrypted
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_tokens_user_provider_idx").on(table.userId, table.provider),
  ]
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

export type Debt = typeof debts.$inferSelect;
export type NewDebt = typeof debts.$inferInsert;

export type NetWorthSnapshot = typeof netWorthSnapshots.$inferSelect;
export type NewNetWorthSnapshot = typeof netWorthSnapshots.$inferInsert;

export type ImportLog = typeof importLogs.$inferSelect;
export type NewImportLog = typeof importLogs.$inferInsert;

export type UserToken = typeof userTokens.$inferSelect;
export type NewUserToken = typeof userTokens.$inferInsert;
