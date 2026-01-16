"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  PiggyBank,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        {/* Gradient orbs */}
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[oklch(0.7_0.18_250_/_0.08)] blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[oklch(0.72_0.19_160_/_0.06)] blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.78_0.15_85_/_0.04)] blur-[100px]" />

        {/* Grid overlay */}
        <div className="bg-grid absolute inset-0 opacity-40" />

        {/* Noise texture */}
        <div className="bg-noise absolute inset-0" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.18_250)] to-[oklch(0.55_0.2_250)] shadow-lg shadow-[oklch(0.7_0.18_250_/_0.25)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-white"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">Vault</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/dashboard">
            <Button
              variant="secondary"
              className="group gap-2 rounded-full px-6 font-medium transition-all hover:bg-secondary/80"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 md:pt-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          {/* Badge */}
          <motion.div variants={item} className="mb-8 inline-block">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.72_0.19_160)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.72_0.19_160)]" />
              </span>
              <span className="text-muted-foreground">
                Connected to{" "}
                <span className="font-medium text-foreground">Monzo</span>
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={item}
            className="mx-auto max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
          >
            Your money,{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-[oklch(0.7_0.18_250)] via-[oklch(0.72_0.19_160)] to-[oklch(0.78_0.15_85)] bg-clip-text text-transparent">
                crystal clear
              </span>
              <span className="absolute -inset-x-4 -inset-y-2 -z-10 block -rotate-1 rounded-lg bg-[oklch(0.7_0.18_250_/_0.1)]" />
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={item}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Track every pound, crush your debt, and build wealth with a personal
            finance dashboard that actually makes sense. Connected directly to your
            bank.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 gap-3 rounded-full bg-gradient-to-r from-[oklch(0.7_0.18_250)] to-[oklch(0.55_0.2_250)] px-8 text-base font-semibold shadow-xl shadow-[oklch(0.7_0.18_250_/_0.25)] transition-all hover:shadow-2xl hover:shadow-[oklch(0.7_0.18_250_/_0.35)]"
              >
                Get Started Free
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-14 gap-2 rounded-full border-border/50 px-8 text-base font-medium backdrop-blur-sm hover:bg-card/50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="mx-auto mt-20 grid max-w-3xl grid-cols-3 gap-8"
          >
            {[
              { value: "£0", label: "Monthly fee", sublabel: "Forever free" },
              { value: "256-bit", label: "Encryption", sublabel: "Bank-grade" },
              { value: "< 1min", label: "Setup time", sublabel: "Quick start" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground/70">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32"
        >
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to{" "}
              <span className="text-[oklch(0.72_0.19_160)]">
                master your money
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              A complete toolkit designed for real financial clarity, not
              vanity metrics.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Transaction Tracking",
                description:
                  "See exactly where every pound goes with automatic categorization and real-time sync from your bank.",
                color: "oklch(0.7 0.18 250)",
              },
              {
                icon: PiggyBank,
                title: "Smart Budgets",
                description:
                  "Set realistic budgets that adapt to your lifestyle. Get alerts before you overspend, not after.",
                color: "oklch(0.72 0.19 160)",
              },
              {
                icon: CreditCard,
                title: "Debt Destroyer",
                description:
                  "Avalanche or snowball - pick your strategy. Watch your debt melt away with visual payoff timelines.",
                color: "oklch(0.68 0.18 15)",
              },
              {
                icon: TrendingUp,
                title: "Net Worth Tracker",
                description:
                  "Track your complete financial picture. Assets, debts, and everything in between in one view.",
                color: "oklch(0.78 0.15 85)",
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description:
                  "Your data is encrypted at rest and in transit. We use the same security standards as banks.",
                color: "oklch(0.65 0.15 290)",
              },
              {
                icon: Zap,
                title: "Instant Sync",
                description:
                  "Transactions appear in seconds, not days. Connected directly to your Monzo account.",
                color: "oklch(0.7 0.18 250)",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/30 p-8 backdrop-blur-sm transition-colors hover:border-border hover:bg-card/50"
              >
                {/* Gradient highlight on hover */}
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: `${feature.color} / 0.15` }}
                />

                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${feature.color} / 0.15` }}
                >
                  <feature.icon
                    className="h-6 w-6"
                    style={{ color: feature.color }}
                  />
                </div>

                <h3 className="mb-2 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative mt-32"
        >
          <motion.div
            animate={floatingAnimation}
            className="relative mx-auto max-w-5xl"
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[oklch(0.7_0.18_250_/_0.2)] via-[oklch(0.72_0.19_160_/_0.15)] to-[oklch(0.78_0.15_85_/_0.2)] opacity-50 blur-3xl" />

            {/* Dashboard mockup */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border/50 bg-sidebar/50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[oklch(0.68_0.18_15)]" />
                  <div className="h-3 w-3 rounded-full bg-[oklch(0.78_0.15_85)]" />
                  <div className="h-3 w-3 rounded-full bg-[oklch(0.72_0.19_160)]" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-background/50 px-4 py-1.5 text-xs text-muted-foreground">
                  vault.finance/dashboard
                </div>
              </div>

              {/* Dashboard content preview */}
              <div className="grid gap-6 p-6 md:grid-cols-4">
                {/* Net Worth Card */}
                <div className="col-span-2 rounded-xl bg-gradient-to-br from-[oklch(0.14_0.008_260)] to-[oklch(0.12_0.005_260)] p-6">
                  <div className="text-sm text-muted-foreground">Net Worth</div>
                  <div className="mt-2 font-mono text-4xl font-bold tracking-tight">
                    £24,831
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1 text-[oklch(0.72_0.19_160)]">
                      <TrendingUp className="h-4 w-4" />
                      +£1,249
                    </span>
                    <span className="text-muted-foreground">this month</span>
                  </div>
                </div>

                {/* Spending Card */}
                <div className="rounded-xl bg-[oklch(0.14_0.008_260)] p-6">
                  <div className="text-sm text-muted-foreground">
                    Spent this month
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold">
                    £1,847
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[oklch(0.7_0.18_250)]"
                      style={{ width: "68%" }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    68% of £2,700 budget
                  </div>
                </div>

                {/* Debt Card */}
                <div className="rounded-xl bg-[oklch(0.14_0.008_260)] p-6">
                  <div className="text-sm text-muted-foreground">
                    Total Debt
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold">
                    £8,420
                  </div>
                  <div className="mt-2 text-xs text-[oklch(0.72_0.19_160)]">
                    Debt-free by Dec 2027
                  </div>
                </div>

                {/* Mini transaction list */}
                <div className="col-span-4 space-y-3 rounded-xl bg-[oklch(0.14_0.008_260)] p-6">
                  <div className="text-sm font-medium">Recent Transactions</div>
                  {[
                    { name: "Tesco", amount: -45.82, category: "Groceries" },
                    { name: "Salary", amount: 2850.0, category: "Income" },
                    { name: "Netflix", amount: -15.99, category: "Entertainment" },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-background/30 px-4 py-3"
                    >
                      <div>
                        <div className="font-medium">{tx.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.category}
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
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to take control?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Join thousands of people who&apos;ve transformed their relationship
            with money using Vault.
          </p>
          <div className="mt-8">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group h-14 gap-3 rounded-full bg-gradient-to-r from-[oklch(0.7_0.18_250)] to-[oklch(0.55_0.2_250)] px-10 text-base font-semibold shadow-xl shadow-[oklch(0.7_0.18_250_/_0.25)] transition-all hover:shadow-2xl hover:shadow-[oklch(0.7_0.18_250_/_0.35)]"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>
            Built with care for your financial future.
            <span className="mx-2">·</span>
            Your data never leaves your control.
          </p>
        </div>
      </footer>
    </div>
  );
}
