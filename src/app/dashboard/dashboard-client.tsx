"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardSummary, SpendingByCategory, RecentTransaction } from "./actions";

interface DashboardClientProps {
  summary: DashboardSummary;
  spendingByCategory: SpendingByCategory[];
  recentTransactions: RecentTransaction[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardClient({
  summary,
  spendingByCategory,
  recentTransactions,
}: DashboardClientProps) {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-GB", { minimumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Income */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[oklch(0.72_0.19_160_/_0.1)] blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Income This Month
                <div className="rounded-full bg-[oklch(0.72_0.19_160_/_0.15)] p-1.5">
                  <TrendingUp className="h-4 w-4 text-[oklch(0.72_0.19_160)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight text-[oklch(0.72_0.19_160)]">
                +£{formatCurrency(summary.totalIncome)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">
                  {summary.transactionCount} transactions
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Expenses */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Spent This Month
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-1.5">
                  <Wallet className="h-4 w-4 text-[oklch(0.68_0.18_15)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight">
                £{formatCurrency(summary.totalExpenses)}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="flex items-center gap-0.5 text-[oklch(0.68_0.18_15)]">
                  <ArrowDownRight className="h-4 w-4" />
                </span>
                <span className="text-muted-foreground">expenses</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Net Change */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Net This Month
                <div className={`rounded-full p-1.5 ${
                  summary.netChange >= 0
                    ? "bg-[oklch(0.72_0.19_160_/_0.15)]"
                    : "bg-[oklch(0.68_0.18_15_/_0.15)]"
                }`}>
                  {summary.netChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-[oklch(0.72_0.19_160)]" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-[oklch(0.68_0.18_15)]" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`font-mono text-3xl font-bold tracking-tight ${
                summary.netChange >= 0
                  ? "text-[oklch(0.72_0.19_160)]"
                  : "text-[oklch(0.68_0.18_15)]"
              }`}>
                {summary.netChange >= 0 ? "+" : "-"}£{formatCurrency(Math.abs(summary.netChange))}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">
                  {summary.netChange >= 0 ? "saved" : "overspent"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by Category */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Spending by Category</span>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spendingByCategory.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                  No spending data this month
                </div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={spendingByCategory}
                      layout="vertical"
                      margin={{ left: 80 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                        tickFormatter={(value) => `£${value}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "oklch(0.85 0.01 260)", fontSize: 12 }}
                        width={70}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.16 0.01 260)",
                          border: "1px solid oklch(0.25 0.015 260)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px oklch(0 0 0 / 0.3)",
                        }}
                        formatter={(value) => [
                          `£${(typeof value === 'number' ? value : 0).toLocaleString()}`,
                          "Spent",
                        ]}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[0, 4, 4, 0]}
                        fill="oklch(0.7 0.18 250)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Transactions</span>
                <Button variant="ghost" size="sm" className="text-sm" asChild>
                  <a href="/dashboard/transactions">View All</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => {
                    const amount = parseFloat(tx.amount);
                    const isIncome = amount > 0;

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                            style={{
                              backgroundColor: tx.category?.color
                                ? `${tx.category.color}20`
                                : "oklch(0.6 0.02 260 / 0.2)",
                            }}
                          >
                            {tx.merchant?.[0]?.toUpperCase() || tx.description[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-medium">{tx.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {tx.category?.name || "Uncategorized"} · {formatDate(tx.date)}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`font-mono font-medium ${
                            isIncome
                              ? "text-[oklch(0.72_0.19_160)]"
                              : "text-foreground"
                          }`}
                        >
                          {isIncome ? "+" : ""}
                          {amount.toLocaleString("en-GB", {
                            style: "currency",
                            currency: "GBP",
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
