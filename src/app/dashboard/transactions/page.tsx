import { getTransactions, getCategories } from "./actions";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage() {
  // Fetch initial data on the server
  const [transactionsData, categories] = await Promise.all([
    getTransactions({ page: 1, pageSize: 10 }),
    getCategories(),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactionsData.transactions}
      initialStats={transactionsData.stats}
      initialTotal={transactionsData.total}
      categories={categories}
    />
  );
}
