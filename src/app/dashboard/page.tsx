import { getDashboardSummary, getSpendingByCategory, getRecentTransactions } from "./actions";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // Fetch all dashboard data on the server
  const [summary, spendingByCategory, recentTransactions] = await Promise.all([
    getDashboardSummary(),
    getSpendingByCategory(),
    getRecentTransactions(5),
  ]);

  return (
    <DashboardClient
      summary={summary}
      spendingByCategory={spendingByCategory}
      recentTransactions={recentTransactions}
    />
  );
}
