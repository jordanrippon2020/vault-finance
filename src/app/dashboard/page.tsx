"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  PiggyBank,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Sample data - would come from API/database
const netWorthData = [
  { month: "Jul", value: 18500 },
  { month: "Aug", value: 19200 },
  { month: "Sep", value: 20100 },
  { month: "Oct", value: 21400 },
  { month: "Nov", value: 23100 },
  { month: "Dec", value: 24831 },
];

const spendingByCategory = [
  { category: "Housing", amount: 850, color: "oklch(0.7 0.18 250)" },
  { category: "Groceries", amount: 420, color: "oklch(0.72 0.19 160)" },
  { category: "Transport", amount: 180, color: "oklch(0.78 0.15 85)" },
  { category: "Entertainment", amount: 150, color: "oklch(0.68 0.18 15)" },
  { category: "Utilities", amount: 120, color: "oklch(0.65 0.15 290)" },
  { category: "Other", amount: 127, color: "oklch(0.55 0.1 260)" },
];

const recentTransactions = [
  {
    id: 1,
    name: "Tesco Express",
    category: "Groceries",
    amount: -45.82,
    date: "Today",
    icon: "🛒",
  },
  {
    id: 2,
    name: "Salary - Acme Corp",
    category: "Income",
    amount: 2850.0,
    date: "Yesterday",
    icon: "💼",
  },
  {
    id: 3,
    name: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    date: "Yesterday",
    icon: "🎬",
  },
  {
    id: 4,
    name: "TfL",
    category: "Transport",
    amount: -8.5,
    date: "2 days ago",
    icon: "🚇",
  },
  {
    id: 5,
    name: "Amazon",
    category: "Shopping",
    amount: -34.99,
    date: "3 days ago",
    icon: "📦",
  },
];

const debts = [
  { name: "Student Loan", balance: 5200, apr: 6.3, minimum: 85 },
  { name: "Credit Card", balance: 2420, apr: 19.9, minimum: 65 },
  { name: "Car Finance", balance: 800, apr: 8.9, minimum: 100 },
];

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

export default function DashboardPage() {
  const totalDebt = debts.reduce((acc, debt) => acc + debt.balance, 0);
  const totalSpent = spendingByCategory.reduce((acc, cat) => acc + cat.amount, 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <motion.div variants={item}>
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[oklch(0.7_0.18_250_/_0.1)] blur-2xl" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Net Worth
                <div className="rounded-full bg-[oklch(0.72_0.19_160_/_0.15)] p-1.5">
                  <TrendingUp className="h-4 w-4 text-[oklch(0.72_0.19_160)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight">
                £24,831
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="flex items-center gap-0.5 text-[oklch(0.72_0.19_160)]">
                  <ArrowUpRight className="h-4 w-4" />
                  +5.4%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month Spending */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Spent This Month
                <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-1.5">
                  <Wallet className="h-4 w-4 text-[oklch(0.7_0.18_250)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight">
                £{totalSpent.toLocaleString()}
              </div>
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    of £2,700 budget
                  </span>
                  <span className="font-medium">
                    {Math.round((totalSpent / 2700) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(totalSpent / 2700) * 100}
                  className="h-2 bg-muted"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Debt */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Total Debt
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-1.5">
                  <CreditCard className="h-4 w-4 text-[oklch(0.68_0.18_15)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight">
                £{totalDebt.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="flex items-center gap-0.5 text-[oklch(0.72_0.19_160)]">
                  <ArrowDownRight className="h-4 w-4" />
                  -£250
                </span>
                <span className="text-muted-foreground">this month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Savings */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                Savings
                <div className="rounded-full bg-[oklch(0.78_0.15_85_/_0.15)] p-1.5">
                  <PiggyBank className="h-4 w-4 text-[oklch(0.78_0.15_85)]" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl font-bold tracking-tight">
                £8,540
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <span className="flex items-center gap-0.5 text-[oklch(0.72_0.19_160)]">
                  <ArrowUpRight className="h-4 w-4" />
                  +£320
                </span>
                <span className="text-muted-foreground">this month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Net Worth Chart */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Net Worth Trend</span>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={netWorthData}>
                    <defs>
                      <linearGradient
                        id="netWorthGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="oklch(0.72 0.19 160)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="oklch(0.72 0.19 160)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                      tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.01 260)",
                        border: "1px solid oklch(0.25 0.015 260)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px oklch(0 0 0 / 0.3)",
                      }}
                      labelStyle={{ color: "oklch(0.6 0.02 260)" }}
                      formatter={(value: number) => [
                        `£${value.toLocaleString()}`,
                        "Net Worth",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="oklch(0.72 0.19 160)"
                      strokeWidth={2}
                      fill="url(#netWorthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
                      formatter={(value: number) => [
                        `£${value.toLocaleString()}`,
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
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Transactions</span>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg">
                        {tx.icon}
                      </div>
                      <div>
                        <div className="font-medium">{tx.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.category} · {tx.date}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-mono font-medium ${
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Debt Overview */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Debt Breakdown</span>
                <Button variant="ghost" size="sm" className="text-sm">
                  Manage
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {debts.map((debt, i) => {
                  const maxDebt = Math.max(...debts.map((d) => d.balance));
                  const percentage = (debt.balance / maxDebt) * 100;

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{debt.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {debt.apr}% APR · £{debt.minimum}/mo minimum
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-medium">
                            £{debt.balance.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              i === 0
                                ? "oklch(0.7 0.18 250)"
                                : i === 1
                                ? "oklch(0.68 0.18 15)"
                                : "oklch(0.78 0.15 85)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-lg border border-[oklch(0.72_0.19_160_/_0.3)] bg-[oklch(0.72_0.19_160_/_0.05)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[oklch(0.72_0.19_160)]">
                        Debt-free projection
                      </div>
                      <div className="text-xs text-muted-foreground">
                        At current £250/mo payments
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-[oklch(0.72_0.19_160)]">
                        Dec 2027
                      </div>
                      <div className="text-xs text-muted-foreground">
                        23 months remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
