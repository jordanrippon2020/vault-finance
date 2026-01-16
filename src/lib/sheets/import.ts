import { db } from "@/lib/db";
import { transactions, categories, accounts, importLogs } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { parseSheetData } from "./parser";
import type { ImportResult, ImportError, ParsedTransaction } from "./types";

// Default category mapping from Monzo to our system
const MONZO_CATEGORY_MAP: Record<string, { color: string; icon: string }> = {
  Bills: { color: "#ef4444", icon: "receipt" },
  Charity: { color: "#ec4899", icon: "heart" },
  "Eating out": { color: "#f97316", icon: "utensils" },
  Entertainment: { color: "#a855f7", icon: "film" },
  Expenses: { color: "#64748b", icon: "briefcase" },
  Family: { color: "#14b8a6", icon: "users" },
  Finances: { color: "#3b82f6", icon: "landmark" },
  General: { color: "#6366f1", icon: "tag" },
  Gifts: { color: "#f43f5e", icon: "gift" },
  Groceries: { color: "#22c55e", icon: "shopping-cart" },
  Holidays: { color: "#06b6d4", icon: "plane" },
  "Personal care": { color: "#d946ef", icon: "heart" },
  Shopping: { color: "#eab308", icon: "shopping-bag" },
  Transport: { color: "#0ea5e9", icon: "car" },
  Transfers: { color: "#8b5cf6", icon: "arrow-right-left" },
};

/**
 * Get or create categories for Monzo import
 */
export async function ensureCategoriesExist(
  userId: string,
  monzoCategories: string[]
): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();

  // Get existing categories with Monzo mapping
  const existingCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));

  // Build map of existing Monzo categories
  for (const cat of existingCategories) {
    if (cat.monzoCategory) {
      categoryMap.set(cat.monzoCategory, cat.id);
    }
  }

  // Create missing categories
  const uniqueMonzoCategories = [...new Set(monzoCategories)];
  const missingCategories = uniqueMonzoCategories.filter(
    (mc) => mc && !categoryMap.has(mc)
  );

  if (missingCategories.length > 0) {
    const newCategories = missingCategories.map((monzoCategory) => {
      const mapping = MONZO_CATEGORY_MAP[monzoCategory] || {
        color: "#6366f1",
        icon: "tag",
      };
      return {
        userId,
        name: monzoCategory,
        monzoCategory,
        color: mapping.color,
        icon: mapping.icon,
        isSystem: true,
      };
    });

    const inserted = await db
      .insert(categories)
      .values(newCategories)
      .returning();

    for (const cat of inserted) {
      if (cat.monzoCategory) {
        categoryMap.set(cat.monzoCategory, cat.id);
      }
    }
  }

  return categoryMap;
}

/**
 * Get or create Monzo account
 */
export async function ensureMonzoAccountExists(
  userId: string,
  accountName: string = "Monzo Personal"
): Promise<string> {
  // Check for existing Monzo account
  const existing = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  // Find an account that looks like Monzo
  const monzoAccount = existing.find(
    (a) =>
      a.name.toLowerCase().includes("monzo") ||
      a.institution?.toLowerCase().includes("monzo")
  );

  if (monzoAccount) {
    return monzoAccount.id;
  }

  // If there's any account, use the first one
  if (existing.length > 0) {
    return existing[0].id;
  }

  // Create new Monzo account
  const [newAccount] = await db
    .insert(accounts)
    .values({
      userId,
      name: accountName,
      type: "checking",
      institution: "Monzo",
      currency: "GBP",
      balance: "0",
    })
    .returning();

  return newAccount.id;
}

/**
 * Find existing transactions by external ID
 */
export async function getExistingExternalIds(
  externalIds: string[]
): Promise<Set<string>> {
  if (externalIds.length === 0) return new Set();

  const existing = await db
    .select({ externalId: transactions.externalId })
    .from(transactions)
    .where(inArray(transactions.externalId, externalIds));

  return new Set(existing.map((t) => t.externalId).filter(Boolean) as string[]);
}

/**
 * Import transactions from parsed sheet data
 */
export async function importTransactions(
  userId: string,
  accountId: string,
  parsedTransactions: ParsedTransaction[],
  categoryMap: Map<string, string>
): Promise<{ imported: number; skipped: number; errors: ImportError[] }> {
  const errors: ImportError[] = [];
  let imported = 0;
  let skipped = 0;

  // Get existing external IDs to avoid duplicates
  const externalIds = parsedTransactions.map((t) => t.externalId);
  const existingIds = await getExistingExternalIds(externalIds);

  // Filter out existing transactions
  const newTransactions = parsedTransactions.filter((t) => {
    if (existingIds.has(t.externalId)) {
      skipped++;
      return false;
    }
    return true;
  });

  if (newTransactions.length === 0) {
    return { imported: 0, skipped, errors };
  }

  // Batch insert transactions
  const batchSize = 100;
  for (let i = 0; i < newTransactions.length; i += batchSize) {
    const batch = newTransactions.slice(i, i + batchSize);

    try {
      const values = batch.map((t) => ({
        accountId,
        amount: t.amount.toFixed(2),
        date: t.date.toISOString().split("T")[0],
        description: t.description,
        merchant: t.merchant,
        externalId: t.externalId,
        notes: t.notes,
        categoryId: categoryMap.get(t.category) || null,
        isExcludedFromBudget: t.type === "pot_transfer" || t.category === "Transfers",
      }));

      await db.insert(transactions).values(values);
      imported += batch.length;
    } catch (error) {
      // If batch fails, try individual inserts
      for (const t of batch) {
        try {
          await db.insert(transactions).values({
            accountId,
            amount: t.amount.toFixed(2),
            date: t.date.toISOString().split("T")[0],
            description: t.description,
            merchant: t.merchant,
            externalId: t.externalId,
            notes: t.notes,
            categoryId: categoryMap.get(t.category) || null,
            isExcludedFromBudget: t.type === "pot_transfer" || t.category === "Transfers",
          });
          imported++;
        } catch (innerError) {
          errors.push({
            row: 0,
            transactionId: t.externalId,
            message:
              innerError instanceof Error
                ? innerError.message
                : "Failed to insert transaction",
          });
        }
      }
    }
  }

  return { imported, skipped, errors };
}

/**
 * Log import operation
 */
export async function logImport(
  userId: string,
  source: string,
  recordsProcessed: number,
  recordsImported: number,
  status: "completed" | "failed",
  errorMessage?: string
): Promise<void> {
  await db.insert(importLogs).values({
    userId,
    source,
    recordsProcessed,
    recordsImported,
    status,
    errorMessage: errorMessage || null,
    completedAt: new Date(),
  });
}

/**
 * Main import function - imports transactions from raw sheet data
 */
export async function importFromSheetData(
  userId: string,
  sheetData: string[][],
  sheetName: string = "Personal Account Transactions"
): Promise<ImportResult> {
  const errors: ImportError[] = [];

  try {
    // Parse sheet data
    const { transactions: parsedTransactions, errors: parseErrors } =
      parseSheetData(sheetData);

    errors.push(
      ...parseErrors.map((e) => ({
        row: e.row,
        message: e.message,
      }))
    );

    if (parsedTransactions.length === 0) {
      return {
        success: true,
        totalRows: sheetData.length - 1,
        imported: 0,
        skipped: 0,
        errors,
      };
    }

    // Ensure categories exist
    const monzoCategories = parsedTransactions.map((t) => t.category);
    const categoryMap = await ensureCategoriesExist(userId, monzoCategories);

    // Ensure Monzo account exists
    const accountId = await ensureMonzoAccountExists(userId);

    // Import transactions
    const result = await importTransactions(
      userId,
      accountId,
      parsedTransactions,
      categoryMap
    );

    errors.push(...result.errors);

    // Log the import
    await logImport(
      userId,
      `monzo_sheets:${sheetName}`,
      parsedTransactions.length,
      result.imported,
      errors.length > 0 ? "completed" : "completed"
    );

    return {
      success: true,
      totalRows: sheetData.length - 1,
      imported: result.imported,
      skipped: result.skipped,
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await logImport(userId, "monzo_sheets", 0, 0, "failed", errorMessage);

    return {
      success: false,
      totalRows: sheetData.length - 1,
      imported: 0,
      skipped: 0,
      errors: [{ row: 0, message: errorMessage }],
    };
  }
}
