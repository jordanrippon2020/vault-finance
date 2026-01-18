import { getBudgets, getCategories } from "./actions";
import { BudgetsClient } from "./budgets-client";

export default async function BudgetsPage() {
  // Fetch initial data on the server
  const [budgetsData, categories] = await Promise.all([
    getBudgets("monthly"),
    getCategories(),
  ]);

  return (
    <BudgetsClient
      initialBudgets={budgetsData.budgets}
      initialSummary={budgetsData.summary}
      categories={categories}
    />
  );
}
