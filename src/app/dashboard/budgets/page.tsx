"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Trash2,
  PieChart,
  Calendar,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Category definitions with colors
const categoryOptions = [
  { name: "Groceries", color: "oklch(0.72 0.19 160)", icon: "🛒" },
  { name: "Entertainment", color: "oklch(0.7 0.18 250)", icon: "🎬" },
  { name: "Transport", color: "oklch(0.78 0.15 85)", icon: "🚗" },
  { name: "Shopping", color: "oklch(0.65 0.15 290)", icon: "🛍️" },
  { name: "Eating Out", color: "oklch(0.68 0.18 15)", icon: "🍽️" },
  { name: "Housing", color: "oklch(0.55 0.15 200)", icon: "🏠" },
  { name: "Health", color: "oklch(0.6 0.18 340)", icon: "💊" },
  { name: "Bills", color: "oklch(0.55 0.1 260)", icon: "📄" },
  { name: "Personal", color: "oklch(0.65 0.12 30)", icon: "👤" },
  { name: "Savings", color: "oklch(0.8 0.17 90)", icon: "💰" },
];

// Mock budget data - will be replaced with real data
const mockBudgets = [
  { id: 1, category: "Groceries", budgeted: 400, spent: 312.50, period: "monthly" },
  { id: 2, category: "Entertainment", budgeted: 100, spent: 115.99, period: "monthly" },
  { id: 3, category: "Transport", budgeted: 150, spent: 89.50, period: "monthly" },
  { id: 4, category: "Shopping", budgeted: 200, spent: 185.00, period: "monthly" },
  { id: 5, category: "Eating Out", budgeted: 150, spent: 178.25, period: "monthly" },
  { id: 6, category: "Bills", budgeted: 350, spent: 350.00, period: "monthly" },
  { id: 7, category: "Health", budgeted: 50, spent: 35.00, period: "monthly" },
  { id: 8, category: "Personal", budgeted: 100, spent: 42.00, period: "monthly" },
];

const getCategoryInfo = (categoryName: string) => {
  return categoryOptions.find((c) => c.name === categoryName) || {
    name: categoryName,
    color: "oklch(0.6 0.02 260)",
    icon: "📦",
  };
};

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

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "", amount: "" });

  // Calculate totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  // Count categories by status
  const overBudgetCount = budgets.filter((b) => b.spent > b.budgeted).length;
  const onTrackCount = budgets.filter(
    (b) => b.spent <= b.budgeted && b.spent / b.budgeted >= 0.75
  ).length;
  const underBudgetCount = budgets.filter(
    (b) => b.spent / b.budgeted < 0.75
  ).length;

  const handleAddBudget = () => {
    if (newBudget.category && newBudget.amount) {
      setBudgets([
        ...budgets,
        {
          id: budgets.length + 1,
          category: newBudget.category,
          budgeted: parseFloat(newBudget.amount),
          spent: 0,
          period: period,
        },
      ]);
      setNewBudget({ category: "", amount: "" });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteBudget = (id: number) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    const ratio = spent / budgeted;
    if (ratio >= 1) return "oklch(0.68 0.18 15)"; // Over budget - coral
    if (ratio >= 0.85) return "oklch(0.8 0.17 90)"; // Warning - gold
    return "oklch(0.72 0.19 160)"; // Good - green
  };

  const getStatusBadge = (spent: number, budgeted: number) => {
    const ratio = spent / budgeted;
    if (ratio >= 1) {
      return (
        <Badge className="bg-[oklch(0.68_0.18_15_/_0.15)] text-[oklch(0.68_0.18_15)] hover:bg-[oklch(0.68_0.18_15_/_0.2)]">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Over Budget
        </Badge>
      );
    }
    if (ratio >= 0.85) {
      return (
        <Badge className="bg-[oklch(0.8_0.17_90_/_0.15)] text-[oklch(0.8_0.17_90)] hover:bg-[oklch(0.8_0.17_90_/_0.2)]">
          <TrendingUp className="mr-1 h-3 w-3" />
          Almost There
        </Badge>
      );
    }
    return (
      <Badge className="bg-[oklch(0.72_0.19_160_/_0.15)] text-[oklch(0.72_0.19_160)] hover:bg-[oklch(0.72_0.19_160_/_0.2)]">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        On Track
      </Badge>
    );
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Track your spending against monthly targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            <Button
              variant={period === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod("monthly")}
              className={
                period === "monthly"
                  ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                  : ""
              }
            >
              <Calendar className="mr-2 h-4 w-4" />
              Monthly
            </Button>
            <Button
              variant={period === "weekly" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod("weekly")}
              className={
                period === "weekly"
                  ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                  : ""
              }
            >
              Weekly
            </Button>
          </div>

          {/* Add Budget Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]">
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) =>
                      setNewBudget({ ...newBudget, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions
                        .filter(
                          (cat) =>
                            !budgets.some((b) => b.category === cat.name)
                        )
                        .map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount (£)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, amount: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBudget}
                  className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                >
                  Create Budget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    £{totalBudgeted.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-3">
                  <Target className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
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
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    £{totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {((totalSpent / totalBudgeted) * 100).toFixed(0)}% of budget
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-3">
                  <TrendingDown className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
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
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p
                    className={`mt-1 font-mono text-2xl font-bold ${
                      totalRemaining >= 0
                        ? "text-[oklch(0.72_0.19_160)]"
                        : "text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    £{Math.abs(totalRemaining).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalRemaining >= 0 ? "left to spend" : "over budget"}
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.72_0.19_160_/_0.15)] p-3">
                  <PieChart className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Budget Status</p>
                <div className="flex gap-3">
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[oklch(0.68_0.18_15)]">
                      {overBudgetCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Over</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[oklch(0.8_0.17_90)]">
                      {onTrackCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Close</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[oklch(0.72_0.19_160)]">
                      {underBudgetCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Good</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overall Progress */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Spending</span>
                <span className="font-mono text-sm">
                  £{totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })} / £
                  {totalBudgeted.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${getProgressColor(
                      totalSpent,
                      totalBudgeted
                    )}, ${getProgressColor(totalSpent, totalBudgeted)})`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {budgets.map((budget) => {
            const categoryInfo = getCategoryInfo(budget.category);
            const spent = budget.spent;
            const budgeted = budget.budgeted;
            const remaining = budgeted - spent;
            const progress = Math.min((spent / budgeted) * 100, 100);

            return (
              <motion.div
                key={budget.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="group relative border-border/50 transition-all hover:border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                          style={{
                            backgroundColor: `${categoryInfo.color} / 0.15`,
                          }}
                        >
                          {categoryInfo.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {budget.category}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground capitalize">
                            {budget.period}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(spent, budgeted)}
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
                              Edit Budget
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[oklch(0.68_0.18_15)]"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{
                            backgroundColor: getProgressColor(spent, budgeted),
                          }}
                        />
                      </div>

                      {/* Amount Details */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="font-mono text-lg font-bold">
                            £{spent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of £{budgeted.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-mono text-lg font-bold ${
                              remaining >= 0
                                ? "text-[oklch(0.72_0.19_160)]"
                                : "text-[oklch(0.68_0.18_15)]"
                            }`}
                          >
                            {remaining >= 0 ? "" : "-"}£
                            {Math.abs(remaining).toLocaleString("en-GB", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {remaining >= 0 ? "remaining" : "over"}
                          </p>
                        </div>
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
      {budgets.length === 0 && (
        <motion.div variants={item}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4">
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No budgets yet</h3>
              <p className="mt-2 text-center text-muted-foreground">
                Create your first budget to start tracking spending
              </p>
              <Button
                className="mt-4 bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
