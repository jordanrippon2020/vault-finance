"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample transactions data - will be replaced with real data from Google Sheets
const mockTransactions = [
  { id: 1, date: "2026-01-16", name: "Tesco Express", category: "Groceries", amount: -45.82, merchant: "Tesco" },
  { id: 2, date: "2026-01-15", name: "Salary - Acme Corp", category: "Income", amount: 2850.00, merchant: null },
  { id: 3, date: "2026-01-15", name: "Netflix", category: "Entertainment", amount: -15.99, merchant: "Netflix" },
  { id: 4, date: "2026-01-14", name: "TfL", category: "Transport", amount: -8.50, merchant: "TfL" },
  { id: 5, date: "2026-01-14", name: "Amazon", category: "Shopping", amount: -34.99, merchant: "Amazon" },
  { id: 6, date: "2026-01-13", name: "Pret A Manger", category: "Eating Out", amount: -7.25, merchant: "Pret" },
  { id: 7, date: "2026-01-13", name: "Spotify", category: "Entertainment", amount: -10.99, merchant: "Spotify" },
  { id: 8, date: "2026-01-12", name: "Sainsbury's", category: "Groceries", amount: -62.34, merchant: "Sainsbury's" },
  { id: 9, date: "2026-01-12", name: "Shell", category: "Transport", amount: -55.00, merchant: "Shell" },
  { id: 10, date: "2026-01-11", name: "Costa Coffee", category: "Eating Out", amount: -4.50, merchant: "Costa" },
  { id: 11, date: "2026-01-11", name: "Rent Transfer", category: "Housing", amount: -850.00, merchant: null },
  { id: 12, date: "2026-01-10", name: "Gym Membership", category: "Health", amount: -35.00, merchant: "PureGym" },
  { id: 13, date: "2026-01-10", name: "Water Bill", category: "Bills", amount: -28.50, merchant: "Thames Water" },
  { id: 14, date: "2026-01-09", name: "Freelance Payment", category: "Income", amount: 450.00, merchant: null },
  { id: 15, date: "2026-01-08", name: "Deliveroo", category: "Eating Out", amount: -22.50, merchant: "Deliveroo" },
];

const categories = [
  { name: "All", color: "oklch(0.6 0.02 260)" },
  { name: "Groceries", color: "oklch(0.72 0.19 160)" },
  { name: "Income", color: "oklch(0.72 0.19 160)" },
  { name: "Entertainment", color: "oklch(0.7 0.18 250)" },
  { name: "Transport", color: "oklch(0.78 0.15 85)" },
  { name: "Shopping", color: "oklch(0.65 0.15 290)" },
  { name: "Eating Out", color: "oklch(0.68 0.18 15)" },
  { name: "Housing", color: "oklch(0.55 0.15 200)" },
  { name: "Health", color: "oklch(0.6 0.18 340)" },
  { name: "Bills", color: "oklch(0.55 0.1 260)" },
];

const getCategoryColor = (category: string) => {
  return categories.find((c) => c.name === category)?.color || "oklch(0.6 0.02 260)";
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((tx) => {
      const matchesSearch =
        tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || tx.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof mockTransactions } = {};
    paginatedTransactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    return groups;
  }, [paginatedTransactions]);

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.72_0.19_160)]">
                    +£{totalIncome.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.72_0.19_160_/_0.15)] p-3">
                  <ArrowUpRight className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.68_0.18_15)]">
                    -£{totalExpenses.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-3">
                  <ArrowDownRight className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Change</p>
                  <p
                    className={`mt-1 font-mono text-2xl font-bold ${
                      totalIncome - totalExpenses >= 0
                        ? "text-[oklch(0.72_0.19_160)]"
                        : "text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    {totalIncome - totalExpenses >= 0 ? "+" : "-"}£
                    {Math.abs(totalIncome - totalExpenses).toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-3">
                  <Calendar className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory === cat.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={
                      selectedCategory === cat.name
                        ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                        : ""
                    }
                  >
                    {cat.name}
                  </Button>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.slice(6).map((cat) => (
                      <DropdownMenuItem
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Export */}
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filteredTransactions.length} Transaction
                {filteredTransactions.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {formatDate(date)}
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Transactions */}
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          {/* Icon/Avatar */}
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${getCategoryColor(tx.category)} / 0.15`,
                              color: getCategoryColor(tx.category),
                            }}
                          >
                            {tx.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Details */}
                          <div>
                            <div className="font-medium">{tx.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge
                                variant="secondary"
                                className="px-2 py-0 text-xs"
                                style={{
                                  backgroundColor: `${getCategoryColor(tx.category)} / 0.1`,
                                  color: getCategoryColor(tx.category),
                                }}
                              >
                                <Tag className="mr-1 h-3 w-3" />
                                {tx.category}
                              </Badge>
                              {tx.merchant && (
                                <span className="text-muted-foreground">
                                  {tx.merchant}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount and Actions */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`font-mono text-base font-semibold ${
                              tx.amount > 0
                                ? "text-[oklch(0.72_0.19_160)]"
                                : "text-foreground"
                            }`}
                          >
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount.toLocaleString("en-GB", {
                              style: "currency",
                              currency: "GBP",
                            })}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Category</DropdownMenuItem>
                              <DropdownMenuItem>Add Note</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Split Transaction</DropdownMenuItem>
                              <DropdownMenuItem className="text-muted-foreground">
                                Exclude from Budget
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No transactions found matching your filters.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
