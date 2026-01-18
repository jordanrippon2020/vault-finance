'use server'

import { db } from '@/lib/db'
import { transactions, categories, accounts } from '@/lib/db/schema'
import { eq, desc, ilike, and, or, sql, inArray, gte, lte } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'

export interface TransactionWithCategory {
  id: string
  date: string
  description: string
  amount: string
  merchant: string | null
  notes: string | null
  category: {
    id: string
    name: string
    color: string
    icon: string | null
  } | null
}

export interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  netChange: number
  transactionCount: number
}

export interface GetTransactionsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  startDate?: string
  endDate?: string
  accountId?: string
}

export interface GetTransactionsResult {
  transactions: TransactionWithCategory[]
  total: number
  page: number
  pageSize: number
  stats: TransactionStats
}

export async function getTransactions(params: GetTransactionsParams = {}): Promise<GetTransactionsResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { page = 1, pageSize = 10, search, category, startDate, endDate, accountId } = params
  const offset = (page - 1) * pageSize

  // Get user's accounts
  const userAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, user.id))

  const accountIds = userAccounts.map(a => a.id)

  if (accountIds.length === 0) {
    return {
      transactions: [],
      total: 0,
      page,
      pageSize,
      stats: { totalIncome: 0, totalExpenses: 0, netChange: 0, transactionCount: 0 }
    }
  }

  // Build where conditions - filter by specific account if provided
  const conditions = accountId
    ? [eq(transactions.accountId, accountId)]
    : [inArray(transactions.accountId, accountIds)]

  if (search) {
    conditions.push(
      or(
        ilike(transactions.description, `%${search}%`),
        ilike(transactions.merchant, `%${search}%`)
      )!
    )
  }

  if (startDate) {
    conditions.push(gte(transactions.date, startDate))
  }

  if (endDate) {
    conditions.push(lte(transactions.date, endDate))
  }

  // Query transactions with categories
  const results = await db
    .select({
      id: transactions.id,
      date: transactions.date,
      description: transactions.description,
      amount: transactions.amount,
      merchant: transactions.merchant,
      notes: transactions.notes,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date))
    .limit(pageSize)
    .offset(offset)

  // Filter by category name if provided (after join)
  let filteredResults = results
  if (category && category !== 'All') {
    filteredResults = results.filter(r => r.categoryName === category)
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(transactions)
    .where(and(...conditions))

  const total = countResult[0]?.count ?? 0

  // Calculate stats for all matching transactions (not just current page)
  const statsResult = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalExpenses: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(and(...conditions))

  const totalIncome = parseFloat(statsResult[0]?.totalIncome || '0')
  const totalExpenses = parseFloat(statsResult[0]?.totalExpenses || '0')

  // Transform results
  const transformedTransactions: TransactionWithCategory[] = filteredResults.map(r => ({
    id: r.id,
    date: r.date,
    description: r.description,
    amount: r.amount,
    merchant: r.merchant,
    notes: r.notes,
    category: r.categoryId ? {
      id: r.categoryId,
      name: r.categoryName || 'Uncategorized',
      color: r.categoryColor || '#6366f1',
      icon: r.categoryIcon,
    } : null,
  }))

  return {
    transactions: transformedTransactions,
    total,
    page,
    pageSize,
    stats: {
      totalIncome,
      totalExpenses,
      netChange: totalIncome - totalExpenses,
      transactionCount: total,
    }
  }
}

export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
    })
    .from(categories)
    .orderBy(categories.name)

  return result
}

export interface Account {
  id: string
  name: string
  type: string
  institution: string | null
  balance: string
}

export async function getAccounts(): Promise<Account[]> {
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
      institution: accounts.institution,
      balance: accounts.balance,
    })
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .orderBy(accounts.name)

  return result
}
