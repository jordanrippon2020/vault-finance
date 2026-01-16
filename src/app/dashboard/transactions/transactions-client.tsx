"use client";

import { useState, useMemo, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { getTransactions, type TransactionWithCategory, type TransactionStats } from "./actions";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

interface TransactionsClientProps {
  initialTransactions: TransactionWithCategory[];
  initialStats: TransactionStats;
  initialTotal: number;
  categories: Category[];
}

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

export function TransactionsClient({
  initialTransactions,
  initialStats,
  initialTotal,
  categories,
}: TransactionsClientProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [stats, setStats] = useState(initialStats);
  const [total, setTotal] = useState(initialTotal);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 10;

  const totalPages = Math.ceil(total / itemsPerPage);

  // Fetch transactions when filters change
  const fetchTransactions = async (page: number, search: string, category: string) => {
    startTransition(async () => {
      const result = await getTransactions({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        category: category !== "All" ? category : undefined,
      });
      setTransactions(result.transactions);
      setStats(result.stats);
      setTotal(result.total);
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    fetchTransactions(1, value, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchTransactions(1, searchQuery, category);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTransactions(page, searchQuery, selectedCategory);
  };

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: TransactionWithCategory[] } = {};
    transactions.forEach((tx) => {
      const dateKey = new Date(tx.date).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });
    return groups;
  }, [transactions]);

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

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return num.toLocaleString("en-GB", { minimumFractionDigits: 2 });
  };

  // Build category list for filters
  const categoryFilters = [
    { name: "All", color: "oklch(0.6 0.02 260)" },
    ...categories.map((c) => ({ name: c.name, color: c.color })),
  ];

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
                    +£{formatCurrency(stats.totalIncome)}
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
                    -£{formatCurrency(stats.totalExpenses)}
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
                      stats.netChange >= 0
                        ? "text-[oklch(0.72_0.19_160)]"
                        : "text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    {stats.netChange >= 0 ? "+" : "-"}£
                    {formatCurrency(Math.abs(stats.netChange))}
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
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categoryFilters.slice(0, 6).map((cat) => (
                  <Button
                    key={cat.name}
                    variant={selectedCategory === cat.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(cat.name)}
                    className={
                      selectedCategory === cat.name
                        ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                        : ""
                    }
                  >
                    {cat.name}
                  </Button>
                ))}
                {categoryFilters.length > 6 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {categoryFilters.slice(6).map((cat) => (
                        <DropdownMenuItem
                          key={cat.name}
                          onClick={() => handleCategoryChange(cat.name)}
                        >
                          {cat.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button variant="outline" size="sm" className="ml-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardContent className="p-0">
            {isPending ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 bg-card/95 px-6 py-3 backdrop-blur-sm">
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatDate(date)}
                      </p>
                    </div>

                    {/* Transactions for this date */}
                    {txs.map((tx) => {
                      const amount = parseFloat(tx.amount);
                      const isIncome = amount > 0;

                      return (
                        <div
                          key={tx.id}
                          className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent/5"
                        >
                          <div className="flex items-center gap-4">
                            {/* Category indicator */}
                            <div
                              className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                              style={{
                                backgroundColor: `${tx.category?.color || "#6366f1"}20`,
                              }}
                            >
                              {tx.merchant?.[0]?.toUpperCase() || tx.description[0]?.toUpperCase() || "?"}
                            </div>

                            <div>
                              <p className="font-medium">{tx.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {tx.category && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                      backgroundColor: `${tx.category.color}20`,
                                      color: tx.category.color,
                                    }}
                                  >
                                    {tx.category.name}
                                  </Badge>
                                )}
                                {tx.merchant && (
                                  <span className="text-xs text-muted-foreground">
                                    {tx.merchant}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <p
                              className={`font-mono font-medium ${
                                isIncome
                                  ? "text-[oklch(0.72_0.19_160)]"
                                  : "text-foreground"
                              }`}
                            >
                              {isIncome ? "+" : "-"}£{formatCurrency(Math.abs(amount))}
                            </p>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Category</DropdownMenuItem>
                                <DropdownMenuItem>Add Note</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Split Transaction</DropdownMenuItem>
                                <DropdownMenuItem>Exclude from Budget</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={item} className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, total)} of {total} transactions
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="px-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
