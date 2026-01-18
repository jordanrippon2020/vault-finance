'use server'

import { db } from '@/lib/db'
import { budgets, categories, transactions, accounts } from '@/lib/db/schema'
import { eq, and, sql, inArray, gte, lte, desc } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BudgetWithSpending {
  id: string
  categoryId: string | null
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  spent: number
  period: 'weekly' | 'monthly' | 'yearly'
  startDate: string
  isActive: boolean
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  overBudgetCount: number
  onTrackCount: number
  underBudgetCount: number
}

export interface CategoryOption {
  id: string
  name: string
  color: string
  icon: string
}

// Get the date range for the current period
function getPeriodDateRange(period: 'weekly' | 'monthly' | 'yearly'): { start: string; end: string } {
  const now = new Date()
  let start: Date
  let end: Date

  if (period === 'weekly') {
    // Start of current week (Monday)
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    start = new Date(now.setDate(diff))
    start.setHours(0, 0, 0, 0)
    end = new Date(start)
    end.setDate(end.getDate() + 6)
  } else if (period === 'monthly') {
    // Start of current month
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  } else {
    // Start of current year
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear(), 11, 31)
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export async function getBudgets(period: 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<{
  budgets: BudgetWithSpending[]
  summary: BudgetSummary
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get user's accounts for spending calculation
  const userAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, user.id))

  const accountIds = userAccounts.map(a => a.id)

  // Get budgets for the user with the specified period
  const userBudgets = await db
    .select({
      id: budgets.id,
      categoryId: budgets.categoryId,
      amount: budgets.amount,
      period: budgets.period,
      startDate: budgets.startDate,
      isActive: budgets.isActive,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
    })
    .from(budgets)
    .leftJoin(categories, eq(budgets.categoryId, categories.id))
    .where(and(
      eq(budgets.userId, user.id),
      eq(budgets.period, period),
      eq(budgets.isActive, true)
    ))
    .orderBy(desc(budgets.createdAt))

  // Get date range for the period
  const { start, end } = getPeriodDateRange(period)

  // Calculate spending for each budget's category
  const budgetsWithSpending: BudgetWithSpending[] = await Promise.all(
    userBudgets.map(async (budget) => {
      let spent = 0

      if (budget.categoryId && accountIds.length > 0) {
        // Calculate spending for this category in the period
        const spendingResult = await db
          .select({
            total: sql<string>`COALESCE(SUM(ABS(${transactions.amount})), 0)`,
          })
          .from(transactions)
          .where(and(
            inArray(transactions.accountId, accountIds),
            eq(transactions.categoryId, budget.categoryId),
            gte(transactions.date, start),
            lte(transactions.date, end),
            sql`${transactions.amount} < 0` // Only expenses
          ))

        spent = parseFloat(spendingResult[0]?.total || '0')
      }

      return {
        id: budget.id,
        categoryId: budget.categoryId,
        categoryName: budget.categoryName || 'Uncategorized',
        categoryColor: budget.categoryColor || '#6366f1',
        categoryIcon: budget.categoryIcon || 'tag',
        amount: parseFloat(budget.amount),
        spent,
        period: budget.period as 'weekly' | 'monthly' | 'yearly',
        startDate: budget.startDate,
        isActive: budget.isActive,
      }
    })
  )

  // Calculate summary
  const totalBudgeted = budgetsWithSpending.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)

  const summary: BudgetSummary = {
    totalBudgeted,
    totalSpent,
    totalRemaining: totalBudgeted - totalSpent,
    overBudgetCount: budgetsWithSpending.filter(b => b.spent > b.amount).length,
    onTrackCount: budgetsWithSpending.filter(b => b.spent <= b.amount && b.spent / b.amount >= 0.75).length,
    underBudgetCount: budgetsWithSpending.filter(b => b.amount > 0 && b.spent / b.amount < 0.75).length,
  }

  return { budgets: budgetsWithSpending, summary }
}

export async function getCategories(): Promise<CategoryOption[]> {
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
    .where(eq(categories.userId, user.id))
    .orderBy(categories.name)

  return result.map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
  }))
}

export async function createBudget(data: {
  categoryId: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Check if budget already exists for this category and period
    const existing = await db
      .select({ id: budgets.id })
      .from(budgets)
      .where(and(
        eq(budgets.userId, user.id),
        eq(budgets.categoryId, data.categoryId),
        eq(budgets.period, data.period),
        eq(budgets.isActive, true)
      ))
      .limit(1)

    if (existing.length > 0) {
      return { success: false, error: 'Budget already exists for this category and period' }
    }

    // Get period start date
    const { start } = getPeriodDateRange(data.period)

    await db.insert(budgets).values({
      userId: user.id,
      categoryId: data.categoryId,
      amount: data.amount.toString(),
      period: data.period,
      startDate: start,
      isActive: true,
    })

    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error) {
    console.error('Failed to create budget:', error)
    return { success: false, error: 'Failed to create budget' }
  }
}

export async function updateBudget(
  budgetId: string,
  data: { amount: number }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Verify budget belongs to user
    const existing = await db
      .select({ id: budgets.id })
      .from(budgets)
      .where(and(
        eq(budgets.id, budgetId),
        eq(budgets.userId, user.id)
      ))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Budget not found' }
    }

    await db
      .update(budgets)
      .set({ amount: data.amount.toString() })
      .where(eq(budgets.id, budgetId))

    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error) {
    console.error('Failed to update budget:', error)
    return { success: false, error: 'Failed to update budget' }
  }
}

export async function deleteBudget(budgetId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Verify budget belongs to user
    const existing = await db
      .select({ id: budgets.id })
      .from(budgets)
      .where(and(
        eq(budgets.id, budgetId),
        eq(budgets.userId, user.id)
      ))
      .limit(1)

    if (existing.length === 0) {
      return { success: false, error: 'Budget not found' }
    }

    // Soft delete by setting isActive to false
    await db
      .update(budgets)
      .set({ isActive: false })
      .where(eq(budgets.id, budgetId))

    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete budget:', error)
    return { success: false, error: 'Failed to delete budget' }
  }
}
