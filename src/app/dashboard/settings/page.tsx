"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  CreditCard,
  Link2,
  Download,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  Snowflake,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Trash2,
  Mail,
  LogOut,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

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

// Mock connected accounts
const connectedAccounts = [
  {
    id: "monzo",
    name: "Monzo",
    icon: "🏦",
    status: "connected",
    email: "jordanrippon@googlemail.com",
    lastSync: "2026-01-16T10:30:00",
    color: "oklch(0.68 0.18 15)",
  },
  {
    id: "google",
    name: "Google Sheets",
    icon: "📊",
    status: "connected",
    email: "jordanrippon@googlemail.com",
    lastSync: "2026-01-16T09:15:00",
    color: "oklch(0.72 0.19 160)",
  },
];

export default function SettingsPage() {
  // Profile settings
  const [name, setName] = useState("Jordan Rippon");
  const [email, setEmail] = useState("jordanrippon@googlemail.com");

  // Finance settings
  const [currency, setCurrency] = useState("GBP");
  const [debtStrategy, setDebtStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [monthlyDebtPayment, setMonthlyDebtPayment] = useState("250");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [syncNotifications, setSyncNotifications] = useState(true);

  // Appearance settings
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  // Sync handler
  const handleSync = useCallback(async (sheetName?: string) => {
    setIsSyncing(true);
    setSyncStatus({ type: "idle" });

    try {
      const response = await fetch("/api/sync/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "temp-user-id", // TODO: Replace with actual user ID from auth
          sheetName: sheetName || "Personal Account Transactions",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSyncStatus({
          type: "success",
          message: data.message || `Imported ${data.data?.imported || 0} transactions`,
        });
      } else {
        setSyncStatus({
          type: "error",
          message: data.error || data.message || "Sync failed",
        });
      }
    } catch (error) {
      setSyncStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const formatLastSync = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and integrations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Section */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
                  Profile
                </CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="bg-[oklch(0.7_0.18_250)] hover:bg-[oklch(0.65_0.18_250)]">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Finance Settings */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[oklch(0.72_0.19_160)]" />
                  Finance Preferences
                </CardTitle>
                <CardDescription>
                  Customize how your finances are calculated and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Currency */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Currency</Label>
                    <p className="text-sm text-muted-foreground">
                      Display currency for all amounts
                    </p>
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Debt Strategy */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Debt Payoff Strategy</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose how to prioritize debt payments
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <button
                      onClick={() => setDebtStrategy("avalanche")}
                      className={`relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                        debtStrategy === "avalanche"
                          ? "border-[oklch(0.68_0.18_15)] bg-[oklch(0.68_0.18_15_/_0.05)]"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      {debtStrategy === "avalanche" && (
                        <div className="absolute right-3 top-3">
                          <Check className="h-4 w-4 text-[oklch(0.68_0.18_15)]" />
                        </div>
                      )}
                      <div className="rounded-full bg-[oklch(0.68_0.18_15_/_0.15)] p-2">
                        <Zap className="h-5 w-5 text-[oklch(0.68_0.18_15)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Avalanche</h4>
                        <p className="text-sm text-muted-foreground">
                          Pay highest APR first. Saves the most money.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setDebtStrategy("snowball")}
                      className={`relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                        debtStrategy === "snowball"
                          ? "border-[oklch(0.7_0.18_250)] bg-[oklch(0.7_0.18_250_/_0.05)]"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      {debtStrategy === "snowball" && (
                        <div className="absolute right-3 top-3">
                          <Check className="h-4 w-4 text-[oklch(0.7_0.18_250)]" />
                        </div>
                      )}
                      <div className="rounded-full bg-[oklch(0.7_0.18_250_/_0.15)] p-2">
                        <Snowflake className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Snowball</h4>
                        <p className="text-sm text-muted-foreground">
                          Pay smallest balance first. Quick wins.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Monthly Debt Payment */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Monthly Debt Budget</Label>
                    <p className="text-sm text-muted-foreground">
                      Amount allocated to debt payments each month
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">£</span>
                    <Input
                      type="number"
                      value={monthlyDebtPayment}
                      onChange={(e) => setMonthlyDebtPayment(e.target.value)}
                      className="w-24 text-right font-mono"
                    />
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[oklch(0.8_0.17_90)]" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Choose what alerts you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching budget limits
                    </p>
                  </div>
                  <Switch
                    checked={budgetAlerts}
                    onCheckedChange={setBudgetAlerts}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of your finances each week
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Sync Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when bank data syncs
                    </p>
                  </div>
                  <Switch
                    checked={syncNotifications}
                    onCheckedChange={setSyncNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appearance */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[oklch(0.65_0.15_290)]" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select
                    value={theme}
                    onValueChange={(v) => setTheme(v as typeof theme)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-[oklch(0.55_0.15_200)]" />
                  Data Management
                </CardTitle>
                <CardDescription>Export or delete your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Download all your financial data
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      JSON
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[oklch(0.68_0.18_15)]">
                      Delete Account
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[oklch(0.68_0.18_15_/_0.5)] text-[oklch(0.68_0.18_15)] hover:bg-[oklch(0.68_0.18_15_/_0.1)]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-[oklch(0.68_0.18_15)] hover:bg-[oklch(0.63_0.18_15)]">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Connected Accounts */}
        <div className="space-y-6">
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-[oklch(0.7_0.18_250)]" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Manage your bank and data connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-start justify-between rounded-lg border border-border/50 bg-muted/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                        style={{ backgroundColor: `${account.color} / 0.15` }}
                      >
                        {account.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{account.name}</h4>
                          <Badge
                            variant="outline"
                            className="border-[oklch(0.72_0.19_160_/_0.5)] bg-[oklch(0.72_0.19_160_/_0.1)] text-[oklch(0.72_0.19_160)]"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {account.email}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last sync: {formatLastSync(account.lastSync)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSync(
                        account.id === "google" ? "Personal Account Transactions" : undefined
                      )}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}

                {/* Sync Status Message */}
                {syncStatus.type !== "idle" && (
                  <div
                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                      syncStatus.type === "success"
                        ? "bg-[oklch(0.72_0.19_160_/_0.1)] text-[oklch(0.72_0.19_160)]"
                        : "bg-[oklch(0.68_0.18_15_/_0.1)] text-[oklch(0.68_0.18_15)]"
                    }`}
                  >
                    {syncStatus.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {syncStatus.message}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleSync()}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-3 h-4 w-4" />
                  )}
                  {isSyncing ? "Syncing..." : "Force Sync All"}
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="mr-3 h-4 w-4" />
                  Privacy Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Mail className="mr-3 h-4 w-4" />
                  Email Preferences
                </Button>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[oklch(0.68_0.18_15)]"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* App Info */}
          <motion.div variants={item}>
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.18_250)] to-[oklch(0.6_0.18_280)]">
                    <span className="text-xl font-bold text-white">V</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Vault</h4>
                    <p className="text-xs text-muted-foreground">
                      Personal Finance Manager
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">Version 0.1.0</p>
                  <div className="flex justify-center gap-4 pt-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Privacy Policy
                    </Button>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      Terms of Service
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Plus(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
