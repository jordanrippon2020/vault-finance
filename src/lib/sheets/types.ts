/**
 * Monzo Google Sheets Auto-Export Types
 *
 * Column structure (A-P):
 * A: Transaction ID (tx_0000...)
 * B: Date (DD/MM/YYYY)
 * C: Time (HH:MM:SS)
 * D: Type (Card payment, Pot transfer, etc.)
 * E: Name (Merchant name)
 * F: Emoji
 * G: Category
 * H: Amount
 * I: Currency
 * J: Local amount
 * K: Local currency
 * L: Notes and #tags
 * M: Address
 * N: Receipt
 * O: Description
 * P: Category split
 */

export interface MonzoSheetRow {
  transactionId: string;      // A
  date: string;               // B (DD/MM/YYYY)
  time: string;               // C (HH:MM:SS)
  type: string;               // D
  name: string;               // E
  emoji: string;              // F
  category: string;           // G
  amount: string;             // H
  currency: string;           // I
  localAmount: string;        // J
  localCurrency: string;      // K
  notesAndTags: string;       // L
  address: string;            // M
  receipt: string;            // N
  description: string;        // O
  categorySplit: string;      // P
}

export interface ParsedTransaction {
  externalId: string;
  date: Date;
  amount: number;
  description: string;
  merchant: string;
  category: string;
  notes: string | null;
  type: MonzoTransactionType;
}

export type MonzoTransactionType =
  | "card_payment"
  | "pot_transfer"
  | "faster_payment"
  | "monzo_paid"
  | "monzo_to_monzo"
  | "direct_debit"
  | "standing_order"
  | "other";

export interface ImportResult {
  success: boolean;
  totalRows: number;
  imported: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  transactionId?: string;
  message: string;
}

// Monzo categories to map
export const MONZO_CATEGORIES = [
  "Bills",
  "Charity",
  "Eating out",
  "Entertainment",
  "Expenses",
  "Family",
  "Finances",
  "General",
  "Gifts",
  "Groceries",
  "Holidays",
  "Personal care",
  "Shopping",
  "Transport",
  "Transfers",
] as const;

export type MonzoCategory = typeof MONZO_CATEGORIES[number];
