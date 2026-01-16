import { NextRequest, NextResponse } from "next/server";
import { importFromSheetData } from "@/lib/sheets";
import { createClient } from "@/lib/supabase/server";

// Monzo Transactions spreadsheet ID
const SPREADSHEET_ID = "1m9Qi53V2fZwU-Fj9In4QSyiecx-qhdcW5BcLKtPKVM4";

// Google Sheets API base URL
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

interface SyncRequest {
  sheetName?: string;
}

/**
 * Fetch data from Google Sheets using API key or OAuth
 */
async function fetchSheetData(
  sheetName: string,
  apiKey?: string,
  accessToken?: string
): Promise<string[][]> {
  const range = `${sheetName}!A:P`;
  const url = `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

  const headers: Record<string, string> = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const queryParams = new URLSearchParams();
  if (apiKey) {
    queryParams.set("key", apiKey);
  }

  const response = await fetch(`${url}?${queryParams.toString()}`, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch sheet data: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * POST /api/sync/sheets
 * Sync transactions from Monzo Google Sheets
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body: SyncRequest = await request.json();
    const { sheetName = "Personal Account Transactions" } = body;

    // Get API key from environment
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!apiKey && !accessToken) {
      return NextResponse.json(
        { error: "Google Sheets API key or access token required" },
        { status: 500 }
      );
    }

    // Fetch sheet data
    const sheetData = await fetchSheetData(sheetName, apiKey, accessToken);

    if (sheetData.length === 0) {
      return NextResponse.json(
        { error: "No data found in sheet" },
        { status: 404 }
      );
    }

    // Import transactions
    const result = await importFromSheetData(userId, sheetData, sheetName);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Imported ${result.imported} transactions (${result.skipped} skipped)`
        : "Import failed",
      data: {
        totalRows: result.totalRows,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/sheets
 * Get sync status / test connection
 */
export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

    if (!apiKey && !accessToken) {
      return NextResponse.json({
        status: "not_configured",
        message: "Google Sheets API credentials not configured",
      });
    }

    // Test connection by fetching first row
    const sheetData = await fetchSheetData(
      "Personal Account Transactions",
      apiKey,
      accessToken
    );

    return NextResponse.json({
      status: "connected",
      spreadsheetId: SPREADSHEET_ID,
      rowCount: sheetData.length,
      headers: sheetData[0] || [],
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Connection failed",
    });
  }
}
