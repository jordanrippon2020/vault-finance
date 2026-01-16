import type {
  MonzoSheetRow,
  ParsedTransaction,
  MonzoTransactionType,
} from "./types";

/**
 * Parse a raw sheet row (array of strings) into a structured MonzoSheetRow
 */
export function parseSheetRow(row: string[]): MonzoSheetRow {
  return {
    transactionId: row[0] || "",
    date: row[1] || "",
    time: row[2] || "",
    type: row[3] || "",
    name: row[4] || "",
    emoji: row[5] || "",
    category: row[6] || "",
    amount: row[7] || "",
    currency: row[8] || "",
    localAmount: row[9] || "",
    localCurrency: row[10] || "",
    notesAndTags: row[11] || "",
    address: row[12] || "",
    receipt: row[13] || "",
    description: row[14] || "",
    categorySplit: row[15] || "",
  };
}

/**
 * Parse DD/MM/YYYY and HH:MM:SS into a Date object
 */
export function parseMonzoDateTime(date: string, time: string): Date {
  // Date format: DD/MM/YYYY
  const [day, month, year] = date.split("/").map(Number);

  // Time format: HH:MM:SS
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Parse amount string to number (handles both positive and negative)
 */
export function parseAmount(amount: string): number {
  // Remove any currency symbols and whitespace
  const cleaned = amount.replace(/[£$€\s,]/g, "");
  return parseFloat(cleaned) || 0;
}

/**
 * Map Monzo transaction type string to our enum
 */
export function parseTransactionType(type: string): MonzoTransactionType {
  const normalized = type.toLowerCase().replace(/[\s-]/g, "_");

  if (normalized.includes("card_payment")) return "card_payment";
  if (normalized.includes("pot_transfer")) return "pot_transfer";
  if (normalized.includes("faster_payment")) return "faster_payment";
  if (normalized.includes("monzo_paid")) return "monzo_paid";
  if (normalized.includes("monzo_to_monzo")) return "monzo_to_monzo";
  if (normalized.includes("direct_debit")) return "direct_debit";
  if (normalized.includes("standing_order")) return "standing_order";

  return "other";
}

/**
 * Convert a MonzoSheetRow to a ParsedTransaction
 */
export function parseTransaction(row: MonzoSheetRow): ParsedTransaction | null {
  // Skip empty rows or header row
  if (
    !row.transactionId ||
    row.transactionId === "Transaction ID" ||
    !row.date
  ) {
    return null;
  }

  // Parse date and time
  const date = parseMonzoDateTime(row.date, row.time || "00:00:00");

  // Parse amount
  const amount = parseAmount(row.amount);

  // Build description - prefer Name, fall back to Description
  const description = row.name || row.description || "Unknown transaction";

  // Build notes - combine original notes with address if present
  let notes: string | null = null;
  const noteParts: string[] = [];
  if (row.notesAndTags) noteParts.push(row.notesAndTags);
  if (row.address) noteParts.push(`Location: ${row.address}`);
  if (noteParts.length > 0) {
    notes = noteParts.join(" | ");
  }

  return {
    externalId: row.transactionId,
    date,
    amount,
    description,
    merchant: row.name || null!,
    category: row.category || "General",
    notes,
    type: parseTransactionType(row.type),
  };
}

/**
 * Parse multiple sheet rows into transactions
 */
export function parseSheetData(
  rows: string[][]
): { transactions: ParsedTransaction[]; errors: { row: number; message: string }[] } {
  const transactions: ParsedTransaction[] = [];
  const errors: { row: number; message: string }[] = [];

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    try {
      const sheetRow = parseSheetRow(rows[i]);
      const transaction = parseTransaction(sheetRow);

      if (transaction) {
        transactions.push(transaction);
      }
    } catch (error) {
      errors.push({
        row: i + 1, // 1-indexed for user display
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { transactions, errors };
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(
  transactions: ParsedTransaction[],
  startDate?: Date,
  endDate?: Date
): ParsedTransaction[] {
  return transactions.filter((t) => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });
}

/**
 * Get unique external IDs from transactions
 */
export function getExternalIds(transactions: ParsedTransaction[]): string[] {
  return transactions.map((t) => t.externalId);
}
