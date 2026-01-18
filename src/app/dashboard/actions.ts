'use server'

import { db } from '@/lib/db'
import { transactions, categories, accounts } from '@/lib/db/schema'
import { eq, desc, sql, inArray, gte, and } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  netChange: number
  transactionCount: number
}

export interface SpendingByCategory {
  category: string
  amount: number
  color: string
}

export interface RecentTransaction {
  id: string
  description: string
  merchant: string | null
  amount: string
  date: string
  category: {
    name: string
    color: string
  } | null
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's accounts
  const userAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, user.id))

  const accountIds = userAccounts.map(a => a.id)

  if (accountIds.length === 0) {
    return { totalIncome: 0, totalExpenses: 0, netChange: 0, transactionCount: 0 }
  }

  // Get current month start
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  // Calculate stats for current month
  const statsResult = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(transactions)
    .where(and(
      inArray(transactions.accountId, accountIds),
      gte(transactions.date, monthStartStr)
    ))

  const totalIncome = parseFloat(statsResult[0]?.totalIncome || '0')
  const totalExpenses = parseFloat(statsResult[0]?.totalExpenses || '0')

  return {
    totalIncome,
    totalExpenses,
    netChange: totalIncome - totalExpenses,
    transactionCount: statsResult[0]?.count || 0,
  }
}

export async function getSpendingByCategory(): Promise<SpendingByCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's accounts
  const userAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, user.id))

  const accountIds = userAccounts.map(a => a.id)

  if (accountIds.length === 0) {
    return []
  }

  // Get current month start
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  // Group expenses by category for current month
  const result = await db
    .select({
      categoryName: categories.name,
      categoryColor: categories.color,
      total: sql<string>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      inArray(transactions.accountId, accountIds),
      gte(transactions.date, monthStartStr),
      sql`${transactions.amount} < 0`
    ))
    .groupBy(categories.name, categories.color)
    .orderBy(sql`SUM(ABS(${transactions.amount})) DESC`)
    .limit(6)

  return result.map(r => ({
    category: r.categoryName || 'Uncategorized',
    amount: parseFloat(r.total || '0'),
    color: r.categoryColor || 'oklch(0.6 0.02 260)',
  }))
}

export async function getRecentTransactions(limit = 5): Promise<RecentTransaction[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's accounts
  const userAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, user.id))

  const accountIds = userAccounts.map(a => a.id)

  if (accountIds.length === 0) {
    return []
  }

  const result = await db
    .select({
      id: transactions.id,
      description: transactions.description,
      merchant: transactions.merchant,
      amount: transactions.amount,
      date: transactions.date,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(inArray(transactions.accountId, accountIds))
    .orderBy(desc(transactions.date))
    .limit(limit)

  return result.map(r => ({
    id: r.id,
    description: r.description,
    merchant: r.merchant,
    amount: r.amount,
    date: r.date,
    category: r.categoryName ? {
      name: r.categoryName,
      color: r.categoryColor || 'oklch(0.6 0.02 260)',
    } : null,
  }))
}

export interface AccountBalance {
  id: string
  name: string
  type: string
  balance: number
}

export async function getAccountBalances(): Promise<AccountBalance[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const result = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      balance: accounts.balance,
    })
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.name)

  return result.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    balance: parseFloat(r.balance),
  }))
}
