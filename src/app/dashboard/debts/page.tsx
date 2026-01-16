"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  TrendingDown,
  Calendar,
  Percent,
  CreditCard,
  Target,
  Zap,
  Snowflake,
  ChevronRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calculator,
  Banknote,
  Trophy,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock debt data - will be replaced with real data
const mockDebts = [
  {
    id: 1,
    name: "Credit Card",
    balance: 3250.00,
    originalBalance: 5000.00,
    apr: 19.9,
    minimumPayment: 65.00,
    type: "credit_card",
    color: "oklch(0.68 0.18 15)",
  },
  {
    id: 2,
    name: "Personal Loan",
    balance: 8500.00,
    originalBalance: 12000.00,
    apr: 8.9,
    minimumPayment: 250.00,
    type: "loan",
    color: "oklch(0.7 0.18 250)",
  },
  {
    id: 3,
    name: "Car Finance",
    balance: 4200.00,
    originalBalance: 8000.00,
    apr: 6.5,
    minimumPayment: 180.00,
    type: "loan",
    color: "oklch(0.78 0.15 85)",
  },
  {
    id: 4,
    name: "Overdraft",
    balance: 750.00,
    originalBalance: 1000.00,
    apr: 15.0,
    minimumPayment: 0,
    type: "overdraft",
    color: "oklch(0.65 0.15 290)",
  },
];

// User's monthly debt payment budget from their workbook
const MONTHLY_PAYMENT_BUDGET = 250;

// Calculate debt payoff using avalanche or snowball method
function calculatePayoffSchedule(
  debts: typeof mockDebts,
  monthlyBudget: number,
  strategy: "avalanche" | "snowball"
) {
  // Clone debts and sort by strategy
  const sortedDebts = [...debts].sort((a, b) => {
    if (strategy === "avalanche") {
      return b.apr - a.apr; // Highest APR first
    } else {
      return a.balance - b.balance; // Lowest balance first
    }
  });

  const schedule: Array<{
    month: number;
    label: string;
    totalDebt: number;
    [key: string]: number | string;
  }> = [];

  // Create working copies
  const workingDebts = sortedDebts.map((d) => ({
    ...d,
    currentBalance: d.balance,
    paidOff: false,
  }));

  let month = 0;
  let totalInterestPaid = 0;
  const maxMonths = 120; // 10 year cap

  while (
    workingDebts.some((d) => d.currentBalance > 0 && !d.paidOff) &&
    month < maxMonths
  ) {
    month++;
    const monthLabel = month <= 12
      ? `M${month}`
      : `Y${Math.ceil(month / 12)}`;

    let remainingBudget = monthlyBudget;
    const monthData: { month: number; label: string; totalDebt: number; [key: string]: number | string } = {
      month,
      label: monthLabel,
      totalDebt: 0,
    };

    // First, make minimum payments on all debts
    workingDebts.forEach((debt) => {
      if (debt.currentBalance > 0 && !debt.paidOff) {
        // Calculate monthly interest
        const monthlyInterest = (debt.currentBalance * (debt.apr / 100)) / 12;
        debt.currentBalance += monthlyInterest;
        totalInterestPaid += monthlyInterest;

        // Make minimum payment
        const minPayment = Math.min(debt.minimumPayment, debt.currentBalance);
        debt.currentBalance -= minPayment;
        remainingBudget -= minPayment;

        if (debt.currentBalance <= 0) {
          debt.paidOff = true;
          debt.currentBalance = 0;
        }
      }
    });

    // Then apply extra payments according to strategy
    for (const debt of workingDebts) {
      if (debt.currentBalance > 0 && !debt.paidOff && remainingBudget > 0) {
        const extraPayment = Math.min(remainingBudget, debt.currentBalance);
        debt.currentBalance -= extraPayment;
        remainingBudget -= extraPayment;

        if (debt.currentBalance <= 0) {
          debt.paidOff = true;
          debt.currentBalance = 0;
        }
      }
    }

    // Record balances for chart
    let total = 0;
    workingDebts.forEach((debt) => {
      monthData[debt.name] = Math.max(0, debt.currentBalance);
      total += Math.max(0, debt.currentBalance);
    });
    monthData.totalDebt = total;

    // Only record every few months for cleaner chart
    if (month <= 12 || month % 3 === 0) {
      schedule.push(monthData);
    }
  }

  return {
    schedule,
    totalMonths: month,
    totalInterestPaid,
    debtFreeDate: new Date(
      new Date().setMonth(new Date().getMonth() + month)
    ),
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DebtsPage() {
  const [debts, setDebts] = useState(mockDebts);
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    name: "",
    balance: "",
    apr: "",
    minimumPayment: "",
  });

  // Calculate totals
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0);
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const averageApr =
    debts.reduce((sum, d) => sum + d.apr * d.balance, 0) / totalDebt || 0;

  // Calculate payoff schedules for both strategies
  const avalancheResult = useMemo(
    () => calculatePayoffSchedule(debts, MONTHLY_PAYMENT_BUDGET, "avalanche"),
    [debts]
  );
  const snowballResult = useMemo(
    () => calculatePayoffSchedule(debts, MONTHLY_PAYMENT_BUDGET, "snowball"),
    [debts]
  );

  const currentResult = strategy === "avalanche" ? avalancheResult : snowballResult;
  const interestSaved = snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid;

  const handleAddDebt = () => {
    if (newDebt.name && newDebt.balance && newDebt.apr) {
      const balance = parseFloat(newDebt.balance);
      setBudgets([
        ...debts,
        {
          id: debts.length + 1,
          name: newDebt.name,
          balance,
          originalBalance: balance,
          apr: parseFloat(newDebt.apr),
          minimumPayment: parseFloat(newDebt.minimumPayment) || 0,
          type: "loan",
          color: `oklch(0.${Math.floor(Math.random() * 3) + 6} 0.18 ${Math.floor(Math.random() * 360)})`,
        },
      ]);
      setNewDebt({ name: "", balance: "", apr: "", minimumPayment: "" });
      setIsAddDialogOpen(false);
    }
  };

  const setBudgets = setDebts; // Alias for the typo fix

  const handleDeleteDebt = (id: number) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const formatCurrency = (value: number) =>
    `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Debt Tracker</h1>
          <p className="text-muted-foreground">
            Pay off your debts faster with smart strategies
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]">
              <Plus className="mr-2 h-4 w-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
              <DialogDescription>
                Enter the details of your debt to track it
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., Credit Card"
                  value={newDebt.name}
                  onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Balance (£)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newDebt.balance}
                    onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>APR (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="19.9"
                    value={newDebt.apr}
                    onChange={(e) => setNewDebt({ ...newDebt, apr: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Payment (£)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newDebt.minimumPayment}
                  onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddDebt}
                className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
              >
                Add Debt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debt</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.68_0.18_15)]">
                    {formatCurrency(totalDebt)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {((1 - totalDebt / totalOriginal) * 100).toFixed(0)}% paid off
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-3">
                  <CreditCard className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
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
                  <p className="text-sm text-muted-foreground">Monthly Budget</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    {formatCurrency(MONTHLY_PAYMENT_BUDGET)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min: {formatCurrency(totalMinimumPayments)}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-3">
                  <Banknote className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
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
                  <p className="text-sm text-muted-foreground">Debt-Free Date</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.72_0.19_160)]">
                    {formatDate(currentResult.debtFreeDate)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentResult.totalMonths} months to go
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.72_0.19_160_/_0.15)] p-3">
                  <Trophy className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
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
                  <p className="text-sm text-muted-foreground">Avg. APR</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    {averageApr.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    weighted average
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.8_0.17_90_/_0.15)] p-3">
                  <Percent className="h-5 w-5 text-[oklch(0.8_0.17_90)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strategy Comparison */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payoff Strategy</CardTitle>
                <CardDescription>
                  Compare methods to find your fastest path to debt freedom
                </CardDescription>
              </div>
              <Tabs
                value={strategy}
                onValueChange={(v) => setStrategy(v as typeof strategy)}
              >
                <TabsList className="bg-muted/50">
                  <TabsTrigger
                    value="avalanche"
                    className="data-[state=active]:bg-[oklch(0.68_0.18_15)] data-[state=active]:text-white"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Avalanche
                  </TabsTrigger>
                  <TabsTrigger
                    value="snowball"
                    className="data-[state=active]:bg-[oklch(0.7_0.18_250)] data-[state=active]:text-white"
                  >
                    <Snowflake className="mr-2 h-4 w-4" />
                    Snowball
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {/* Strategy Comparison Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div
                className={`rounded-lg border p-4 transition-all ${
                  strategy === "avalanche"
                    ? "border-[oklch(0.68_0.18_15)] bg-[oklch(0.68_0.18_15_/_0.05)]"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-2">
                    <Zap className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Avalanche Method</h4>
                    <p className="text-xs text-muted-foreground">
                      Pay highest APR first - saves most money
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time to Freedom</p>
                    <p className="font-mono font-semibold">
                      {avalancheResult.totalMonths} months
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(avalancheResult.totalInterestPaid)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-lg border p-4 transition-all ${
                  strategy === "snowball"
                    ? "border-[oklch(0.7_0.18_250)] bg-[oklch(0.7_0.18_250_/_0.05)]"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-2">
                    <Snowflake className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Snowball Method</h4>
                    <p className="text-xs text-muted-foreground">
                      Pay smallest balance first - quick wins
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time to Freedom</p>
                    <p className="font-mono font-semibold">
                      {snowballResult.totalMonths} months
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="font-mono font-semibold">
                      {formatCurrency(snowballResult.totalInterestPaid)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interest Savings Banner */}
            {interestSaved > 0 && (
              <div className="mb-6 rounded-lg bg-[oklch(0.72_0.19_160_/_0.1)] p-4">
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
                  <div>
                    <p className="font-medium text-[oklch(0.72_0.19_160)]">
                      Avalanche saves you{" "}
                      <span className="font-mono font-bold">
                        {formatCurrency(interestSaved)}
                      </span>{" "}
                      in interest!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      That&apos;s {((interestSaved / snowballResult.totalInterestPaid) * 100).toFixed(0)}% less
                      interest paid over the life of your debts
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payoff Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentResult.schedule}>
                  <defs>
                    {debts.map((debt) => (
                      <linearGradient
                        key={debt.id}
                        id={`gradient-${debt.id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor={debt.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={debt.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.3 0.02 260)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                    axisLine={{ stroke: "oklch(0.3 0.02 260)" }}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                    axisLine={{ stroke: "oklch(0.3 0.02 260)" }}
                    tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.15 0.02 260)",
                      borderColor: "oklch(0.25 0.02 260)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                  <Legend />
                  {debts.map((debt) => (
                    <Area
                      key={debt.id}
                      type="monotone"
                      dataKey={debt.name}
                      stackId="1"
                      stroke={debt.color}
                      fill={`url(#gradient-${debt.id})`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Debt Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {debts
            .sort((a, b) =>
              strategy === "avalanche" ? b.apr - a.apr : a.balance - b.balance
            )
            .map((debt, index) => {
              const progress =
                ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100;

              return (
                <motion.div
                  key={debt.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group relative border-border/50 transition-all hover:border-border">
                    {/* Priority Badge */}
                    {index === 0 && (
                      <div className="absolute -top-2 left-4">
                        <Badge
                          className={`${
                            strategy === "avalanche"
                              ? "bg-[oklch(0.68_0.18_15)]"
                              : "bg-[oklch(0.7_0.18_250)]"
                          } text-white`}
                        >
                          <Target className="mr-1 h-3 w-3" />
                          Focus Here
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${debt.color} / 0.15` }}
                          >
                            <CreditCard
                              className="h-6 w-6"
                              style={{ color: debt.color }}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{debt.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {debt.apr}% APR
                              </Badge>
                              <span>•</span>
                              <span>Min: {formatCurrency(debt.minimumPayment)}/mo</span>
                            </div>
                          </div>
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
                            <DropdownMenuItem>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit Debt
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Banknote className="mr-2 h-4 w-4" />
                              Log Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[oklch(0.68_0.18_15)]"
                              onClick={() => handleDeleteDebt(debt.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Balance */}
                      <div className="mb-4 flex items-baseline justify-between">
                        <div>
                          <p className="font-mono text-3xl font-bold" style={{ color: debt.color }}>
                            {formatCurrency(debt.balance)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            of {formatCurrency(debt.originalBalance)} remaining
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg font-semibold text-[oklch(0.72_0.19_160)]">
                            {formatCurrency(debt.originalBalance - debt.balance)}
                          </p>
                          <p className="text-xs text-muted-foreground">paid off</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-mono">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{ backgroundColor: debt.color }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {debts.length === 0 && (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No debts tracked</h3>
              <p className="mt-2 text-center text-muted-foreground">
                Add your first debt to start your journey to financial freedom
              </p>
              <Button
                className="mt-4 bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Debt
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
