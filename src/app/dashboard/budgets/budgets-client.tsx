"use client";

import { useState, useTransition } from "react";
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
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type BudgetWithSpending,
  type BudgetSummary,
  type CategoryOption,
} from "./actions";

// Category icon mapping
const categoryIcons: Record<string, string> = {
  groceries: "🛒",
  entertainment: "🎬",
  transport: "🚗",
  shopping: "🛍️",
  "eating out": "🍽️",
  housing: "🏠",
  health: "💊",
  bills: "📄",
  personal: "👤",
  savings: "💰",
  general: "📦",
  expenses: "💸",
  finances: "💳",
  family: "👨‍👩‍👧",
  holidays: "✈️",
  charity: "❤️",
};

const getCategoryIcon = (categoryName: string): string => {
  const key = categoryName.toLowerCase();
  return categoryIcons[key] || "📦";
};

interface BudgetsClientProps {
  initialBudgets: BudgetWithSpending[];
  initialSummary: BudgetSummary;
  categories: CategoryOption[];
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

export function BudgetsClient({
  initialBudgets,
  initialSummary,
  categories,
}: BudgetsClientProps) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [summary, setSummary] = useState(initialSummary);
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);
  const [newBudget, setNewBudget] = useState({ categoryId: "", amount: "" });
  const [editAmount, setEditAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  // Get categories that don't have a budget yet
  const availableCategories = categories.filter(
    (cat) => !budgets.some((b) => b.categoryId === cat.id)
  );

  const handlePeriodChange = async (newPeriod: "weekly" | "monthly" | "yearly") => {
    setPeriod(newPeriod);
    startTransition(async () => {
      const result = await getBudgets(newPeriod);
      setBudgets(result.budgets);
      setSummary(result.summary);
    });
  };

  const handleAddBudget = async () => {
    if (!newBudget.categoryId || !newBudget.amount) return;

    startTransition(async () => {
      const result = await createBudget({
        categoryId: newBudget.categoryId,
        amount: parseFloat(newBudget.amount),
        period,
      });

      if (result.success) {
        toast.success("Budget created successfully");
        setNewBudget({ categoryId: "", amount: "" });
        setIsAddDialogOpen(false);
        // Refresh budgets
        const refreshed = await getBudgets(period);
        setBudgets(refreshed.budgets);
        setSummary(refreshed.summary);
      } else {
        toast.error(result.error || "Failed to create budget");
      }
    });
  };

  const handleEditBudget = async () => {
    if (!editingBudget || !editAmount) return;

    startTransition(async () => {
      const result = await updateBudget(editingBudget.id, {
        amount: parseFloat(editAmount),
      });

      if (result.success) {
        toast.success("Budget updated successfully");
        setIsEditDialogOpen(false);
        setEditingBudget(null);
        setEditAmount("");
        // Refresh budgets
        const refreshed = await getBudgets(period);
        setBudgets(refreshed.budgets);
        setSummary(refreshed.summary);
      } else {
        toast.error(result.error || "Failed to update budget");
      }
    });
  };

  const handleDeleteBudget = async (budgetId: string) => {
    startTransition(async () => {
      const result = await deleteBudget(budgetId);

      if (result.success) {
        toast.success("Budget deleted");
        // Refresh budgets
        const refreshed = await getBudgets(period);
        setBudgets(refreshed.budgets);
        setSummary(refreshed.summary);
      } else {
        toast.error(result.error || "Failed to delete budget");
      }
    });
  };

  const openEditDialog = (budget: BudgetWithSpending) => {
    setEditingBudget(budget);
    setEditAmount(budget.amount.toString());
    setIsEditDialogOpen(true);
  };

  const getProgressColor = (spent: number, budgeted: number) => {
    if (budgeted === 0) return "oklch(0.6 0.02 260)";
    const ratio = spent / budgeted;
    if (ratio >= 1) return "oklch(0.68 0.18 15)"; // Over budget - coral
    if (ratio >= 0.85) return "oklch(0.8 0.17 90)"; // Warning - gold
    return "oklch(0.72 0.19 160)"; // Good - green
  };

  const getStatusBadge = (spent: number, budgeted: number) => {
    if (budgeted === 0) return null;
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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-GB", { minimumFractionDigits: 2 });
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
            Track your spending against {period} targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
            <Button
              variant={period === "monthly" ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePeriodChange("monthly")}
              disabled={isPending}
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
              onClick={() => handlePeriodChange("weekly")}
              disabled={isPending}
              className={
                period === "weekly"
                  ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                  : ""
              }
            >
              Weekly
            </Button>
            <Button
              variant={period === "yearly" ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePeriodChange("yearly")}
              disabled={isPending}
              className={
                period === "yearly"
                  ? "bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                  : ""
              }
            >
              Yearly
            </Button>
          </div>

          {/* Add Budget Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                disabled={availableCategories.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a {period} spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newBudget.categoryId}
                    onValueChange={(value) =>
                      setNewBudget({ ...newBudget, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span>{getCategoryIcon(cat.name)}</span>
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
                    min="0"
                    step="0.01"
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
                  disabled={isPending || !newBudget.categoryId || !newBudget.amount}
                  className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Budget
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Budget Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogDescription>
                  Update the budget amount for {editingBudget?.categoryName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Budget Amount (£)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditBudget}
                  disabled={isPending || !editAmount}
                  className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    £{formatCurrency(summary.totalBudgeted)}
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
                    £{formatCurrency(summary.totalSpent)}
                  </p>
                  {summary.totalBudgeted > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {((summary.totalSpent / summary.totalBudgeted) * 100).toFixed(0)}% of budget
                    </p>
                  )}
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
                      summary.totalRemaining >= 0
                        ? "text-[oklch(0.72_0.19_160)]"
                        : "text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    £{formatCurrency(Math.abs(summary.totalRemaining))}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {summary.totalRemaining >= 0 ? "left to spend" : "over budget"}
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
                      {summary.overBudgetCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Over</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[oklch(0.8_0.17_90)]">
                      {summary.onTrackCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Close</p>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="text-center">
                    <p className="font-mono text-lg font-bold text-[oklch(0.72_0.19_160)]">
                      {summary.underBudgetCount}
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
      {summary.totalBudgeted > 0 && (
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Spending</span>
                  <span className="font-mono text-sm">
                    £{formatCurrency(summary.totalSpent)} / £{formatCurrency(summary.totalBudgeted)}
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((summary.totalSpent / summary.totalBudgeted) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      background: getProgressColor(summary.totalSpent, summary.totalBudgeted),
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {budgets.map((budget) => {
            const spent = budget.spent;
            const budgeted = budget.amount;
            const remaining = budgeted - spent;
            const progress = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;

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
                            backgroundColor: `color-mix(in oklch, ${budget.categoryColor} 15%, transparent)`,
                          }}
                        >
                          {getCategoryIcon(budget.categoryName)}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {budget.categoryName}
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
                            <DropdownMenuItem onClick={() => openEditDialog(budget)}>
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
                            £{formatCurrency(spent)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of £{formatCurrency(budgeted)}
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
                            {remaining >= 0 ? "" : "-"}£{formatCurrency(Math.abs(remaining))}
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
      {budgets.length === 0 && !isPending && (
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
              {availableCategories.length > 0 ? (
                <Button
                  className="mt-4 bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No categories available. Import transactions first.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
