"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  Car,
  PiggyBank,
  CreditCard,
  Home,
  LineChart,
  MoreHorizontal,
  Edit3,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Coins,
  Receipt,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Asset/Liability categories
const assetCategories = [
  { name: "Cash", icon: Wallet, color: "oklch(0.72 0.19 160)" },
  { name: "Investments", icon: LineChart, color: "oklch(0.7 0.18 250)" },
  { name: "Property", icon: Home, color: "oklch(0.78 0.15 85)" },
  { name: "Vehicles", icon: Car, color: "oklch(0.65 0.15 290)" },
  { name: "Savings", icon: PiggyBank, color: "oklch(0.8 0.17 90)" },
  { name: "Crypto", icon: Coins, color: "oklch(0.68 0.18 30)" },
  { name: "Other Assets", icon: Landmark, color: "oklch(0.6 0.12 200)" },
];

const liabilityCategories = [
  { name: "Credit Cards", icon: CreditCard, color: "oklch(0.68 0.18 15)" },
  { name: "Loans", icon: Receipt, color: "oklch(0.6 0.15 340)" },
  { name: "Mortgage", icon: Building2, color: "oklch(0.55 0.12 250)" },
  { name: "Other Debts", icon: Receipt, color: "oklch(0.5 0.1 200)" },
];

// Mock data for assets and liabilities
const mockAssets = [
  { id: 1, name: "Monzo Current Account", category: "Cash", balance: 2450.00, lastUpdated: "2026-01-16" },
  { id: 2, name: "Emergency Fund (Marcus)", category: "Savings", balance: 5000.00, lastUpdated: "2026-01-15" },
  { id: 3, name: "Stocks & Shares ISA", category: "Investments", balance: 12500.00, lastUpdated: "2026-01-14" },
  { id: 4, name: "Workplace Pension", category: "Investments", balance: 28000.00, lastUpdated: "2026-01-01" },
  { id: 5, name: "Car (Est. Value)", category: "Vehicles", balance: 8500.00, lastUpdated: "2026-01-01" },
];

const mockLiabilities = [
  { id: 1, name: "Credit Card", category: "Credit Cards", balance: 3250.00, lastUpdated: "2026-01-16" },
  { id: 2, name: "Personal Loan", category: "Loans", balance: 8500.00, lastUpdated: "2026-01-16" },
  { id: 3, name: "Car Finance", category: "Loans", balance: 4200.00, lastUpdated: "2026-01-16" },
  { id: 4, name: "Overdraft", category: "Other Debts", balance: 750.00, lastUpdated: "2026-01-16" },
];

// Mock historical net worth data
const mockHistory = [
  { month: "Aug '25", assets: 48500, liabilities: 22000, netWorth: 26500 },
  { month: "Sep '25", assets: 50200, liabilities: 21200, netWorth: 29000 },
  { month: "Oct '25", assets: 51800, liabilities: 20500, netWorth: 31300 },
  { month: "Nov '25", assets: 53500, liabilities: 19800, netWorth: 33700 },
  { month: "Dec '25", assets: 55200, liabilities: 18200, netWorth: 37000 },
  { month: "Jan '26", assets: 56450, liabilities: 16700, netWorth: 39750 },
];

const getCategoryInfo = (categoryName: string, type: "asset" | "liability") => {
  const categories = type === "asset" ? assetCategories : liabilityCategories;
  return (
    categories.find((c) => c.name === categoryName) || {
      name: categoryName,
      icon: Wallet,
      color: "oklch(0.6 0.02 260)",
    }
  );
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

export default function NetWorthPage() {
  const [assets, setAssets] = useState(mockAssets);
  const [liabilities, setLiabilities] = useState(mockLiabilities);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"asset" | "liability">("asset");
  const [newItem, setNewItem] = useState({ name: "", category: "", balance: "" });

  // Calculate totals
  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Calculate month-over-month change
  const previousNetWorth = mockHistory[mockHistory.length - 2]?.netWorth || netWorth;
  const monthChange = netWorth - previousNetWorth;
  const monthChangePercent = ((monthChange / previousNetWorth) * 100).toFixed(1);

  // Group assets by category for pie chart
  const assetsByCategory = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    assets.forEach((a) => {
      grouped[a.category] = (grouped[a.category] || 0) + a.balance;
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
      color: getCategoryInfo(name, "asset").color,
    }));
  }, [assets]);

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.balance) {
      const balance = parseFloat(newItem.balance);
      const newEntry = {
        id: Date.now(),
        name: newItem.name,
        category: newItem.category,
        balance,
        lastUpdated: new Date().toISOString().split("T")[0],
      };

      if (addType === "asset") {
        setAssets([...assets, newEntry]);
      } else {
        setLiabilities([...liabilities, newEntry]);
      }

      setNewItem({ name: "", category: "", balance: "" });
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteAsset = (id: number) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleDeleteLiability = (id: number) => {
    setLiabilities(liabilities.filter((l) => l.id !== id));
  };

  const formatCurrency = (value: number) =>
    `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;

  const formatCompactCurrency = (value: number) =>
    value >= 1000
      ? `£${(value / 1000).toFixed(1)}k`
      : `£${value.toFixed(0)}`;

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
          <h1 className="text-2xl font-bold">Net Worth</h1>
          <p className="text-muted-foreground">
            Track your wealth and watch it grow over time
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {addType === "asset" ? "Asset" : "Liability"}</DialogTitle>
              <DialogDescription>
                Enter the details to track in your net worth
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Type Toggle */}
              <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
                <Button
                  variant={addType === "asset" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setAddType("asset");
                    setNewItem({ ...newItem, category: "" });
                  }}
                  className={`flex-1 ${
                    addType === "asset"
                      ? "bg-[oklch(0.72_0.19_160)] hover:bg-[oklch(0.67_0.19_160)]"
                      : ""
                  }`}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Asset
                </Button>
                <Button
                  variant={addType === "liability" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setAddType("liability");
                    setNewItem({ ...newItem, category: "" });
                  }}
                  className={`flex-1 ${
                    addType === "liability"
                      ? "bg-[oklch(0.68_0.18_15)] hover:bg-[oklch(0.63_0.18_15)]"
                      : ""
                  }`}
                >
                  <ArrowDownRight className="mr-2 h-4 w-4" />
                  Liability
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder={addType === "asset" ? "e.g., Savings Account" : "e.g., Car Loan"}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(addType === "asset" ? assetCategories : liabilityCategories).map(
                      (cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          <span className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                            <span>{cat.name}</span>
                          </span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Value (£)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newItem.balance}
                  onChange={(e) => setNewItem({ ...newItem, balance: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                className={
                  addType === "asset"
                    ? "bg-[oklch(0.72_0.19_160)] hover:bg-[oklch(0.67_0.19_160)]"
                    : "bg-[oklch(0.68_0.18_15)] hover:bg-[oklch(0.63_0.18_15)]"
                }
              >
                Add {addType === "asset" ? "Asset" : "Liability"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div variants={item} className="md:col-span-2">
          <Card className="relative overflow-hidden border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.7_0.18_250_/_0.1)] to-transparent" />
            <CardContent className="relative pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Worth</p>
                  <p
                    className={`mt-1 font-mono text-4xl font-bold ${
                      netWorth >= 0
                        ? "text-[oklch(0.72_0.19_160)]"
                        : "text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    {formatCurrency(Math.abs(netWorth))}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {monthChange >= 0 ? (
                      <Badge className="bg-[oklch(0.72_0.19_160_/_0.15)] text-[oklch(0.72_0.19_160)]">
                        <TrendingUp className="mr-1 h-3 w-3" />+
                        {formatCurrency(monthChange)} ({monthChangePercent}%)
                      </Badge>
                    ) : (
                      <Badge className="bg-[oklch(0.68_0.18_15_/_0.15)] text-[oklch(0.68_0.18_15)]">
                        <TrendingDown className="mr-1 h-3 w-3" />
                        {formatCurrency(monthChange)} ({monthChangePercent}%)
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-4">
                  <LineChart className="h-8 w-8 text-[oklch(0.7_0.18_250)]" />
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
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.72_0.19_160)]">
                    {formatCurrency(totalAssets)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {assets.length} accounts
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
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[oklch(0.68_0.18_15)]">
                    {formatCurrency(totalLiabilities)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {liabilities.length} debts
                  </p>
                </div>
                <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-3">
                  <ArrowDownRight className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Net Worth Trend */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Net Worth Trend</CardTitle>
              <CardDescription>Your wealth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockHistory}>
                    <defs>
                      <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.72 0.19 160)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                      axisLine={{ stroke: "oklch(0.3 0.02 260)" }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 12 }}
                      axisLine={{ stroke: "oklch(0.3 0.02 260)" }}
                      tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.15 0.02 260)",
                        borderColor: "oklch(0.25 0.02 260)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="assets"
                      stroke="oklch(0.7 0.18 250)"
                      fill="url(#assetsGradient)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Assets"
                    />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      stroke="oklch(0.72 0.19 160)"
                      fill="url(#netWorthGradient)"
                      strokeWidth={3}
                      name="Net Worth"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Asset Breakdown Pie */}
        <motion.div variants={item}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Asset Breakdown</CardTitle>
              <CardDescription>Where your money is</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetsByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.15 0.02 260)",
                        borderColor: "oklch(0.25 0.02 260)",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [formatCurrency(typeof value === 'number' ? value : 0), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {assetsByCategory.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-mono">{formatCompactCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Assets Section */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
                  Assets
                </CardTitle>
                <CardDescription>What you own</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">
                {formatCurrency(totalAssets)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {assets.map((asset) => {
                  const categoryInfo = getCategoryInfo(asset.category, "asset");
                  const Icon = categoryInfo.icon;

                  return (
                    <motion.div
                      key={asset.id}
                      layout
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${categoryInfo.color} / 0.15` }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: categoryInfo.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.category} • Updated {asset.lastUpdated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-lg font-semibold text-[oklch(0.72_0.19_160)]">
                          {formatCurrency(asset.balance)}
                        </p>
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
                              Update Value
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[oklch(0.68_0.18_15)]"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liabilities Section */}
      <motion.div variants={item}>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
                  Liabilities
                </CardTitle>
                <CardDescription>What you owe</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[oklch(0.68_0.18_15)]">
                {formatCurrency(totalLiabilities)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {liabilities.map((liability) => {
                  const categoryInfo = getCategoryInfo(liability.category, "liability");
                  const Icon = categoryInfo.icon;

                  return (
                    <motion.div
                      key={liability.id}
                      layout
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${categoryInfo.color} / 0.15` }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: categoryInfo.color }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{liability.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {liability.category} • Updated {liability.lastUpdated}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-mono text-lg font-semibold text-[oklch(0.68_0.18_15)]">
                          -{formatCurrency(liability.balance)}
                        </p>
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
                              Update Value
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-[oklch(0.68_0.18_15)]"
                              onClick={() => handleDeleteLiability(liability.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
