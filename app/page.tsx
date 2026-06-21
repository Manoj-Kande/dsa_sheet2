"use client";

import Link from "next/link";
import { DATASET, getProblemsByTopic, getProblemsBySheet } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { TopicCard, CompanyCard, SheetCard } from "@/components/shared/cards";
import { useUserData } from "@/lib/hooks/use-user-data";
import { Flame } from "lucide-react";
import { Show, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  const { progress, isSignedIn, streak } = useUserData();

  const totalSolved = Object.values(progress).filter((s) => s === "SOLVED").length;
  const totalAttempted = Object.values(progress).filter((s) => s === "ATTEMPTED").length;
  const totalRevisit = Object.values(progress).filter((s) => s === "REVISIT").length;
  const total = DATASET.stats.total_problems;
  const pct = total ? Math.round((totalSolved / total) * 100) : 0;

  function topicSolved(slug: string) {
    return getProblemsByTopic(slug).filter((p) => progress[p.slug] === "SOLVED").length;
  }
  function sheetSolved(name: string) {
    return getProblemsBySheet(name).filter((p) => progress[p.slug] === "SOLVED").length;
  }

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Hero */}
        <section className="pt-16 pb-12 relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(110,110,247,0.18)_0%,transparent_65%)] pointer-events-none -z-10" />
          <div className="absolute -top-10 right-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.08)_0%,transparent_70%)] pointer-events-none -z-10" />
          <div
            className="absolute inset-0 -z-20 opacity-[0.4] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-border-default) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-default) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "linear-gradient(to bottom, black, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />
          <span className="inline-flex items-center gap-2 font-mono text-xs text-accent bg-accent-subtle border border-accent-muted px-3 py-1.5 rounded-full mb-6 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-easy shadow-[0_0_8px_var(--color-easy)]" />
            {DATASET.stats.total_problems} problems · {DATASET.stats.total_topics} topics · real accounts, synced everywhere
          </span>
          <h1 className="text-5xl leading-[1.05] font-bold tracking-tight max-w-[760px] mb-6">
            Prepare for technical interviews like you&apos;re{" "}
            <span className="text-accent">operating a system</span>, not studying for an exam.
          </h1>
          <p className="text-lg leading-relaxed text-text-secondary max-w-[560px] mb-8">
            A structured DSA learning graph — topics, prerequisites, company frequency, and proven sheets —
            with progress that syncs across every device you sign in on.
          </p>
          <div className="flex gap-3 items-center flex-wrap">
            <Link href="/topics" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors shadow-[0_4px_16px_-4px_rgba(110,110,247,0.5)]">
              Start the Roadmap
            </Link>
            <Link href="/problems" className="px-4 py-2 bg-bg-elevated border border-border-default hover:border-border-strong text-text-primary text-sm font-semibold rounded-md transition-colors">
              Browse All Problems
            </Link>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-transparent text-text-secondary hover:text-text-primary text-sm font-semibold rounded-md transition-colors">
                  Sign in to track progress →
                </button>
              </SignInButton>
            </Show>
          </div>
          <div className="flex gap-8 mt-12 flex-wrap">
            {[
              ["Problems", DATASET.stats.total_problems],
              ["Topics", DATASET.stats.total_topics],
              ["Companies", DATASET.stats.total_companies],
              ["Sheets", DATASET.stats.total_sheets],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-mono text-2xl font-bold tracking-tight">{value}</span>
                <span className="text-xs text-text-tertiary uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Show when="signed-in">
          {/* Dashboard widgets */}
          <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-12">
            <div className="relative overflow-hidden bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-default rounded-xl p-6 flex flex-col justify-between gap-4">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[radial-gradient(circle,rgba(110,110,247,0.12)_0%,transparent_70%)] pointer-events-none" />
              <div>
                <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Your Progress</div>
                <h2 className="text-xl font-semibold mb-2">Pick up where you left off</h2>
                <p className="text-sm text-text-secondary">
                  {totalSolved === 0
                    ? "You haven't marked any problems yet. Open any problem and click the status circle to start tracking."
                    : `${totalSolved} of ${total} problems solved (${pct}%). ${totalAttempted} attempted, ${totalRevisit} marked for revisit.`}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>Overall completion</span>
                  <span className="font-mono">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col gap-3">
              {streak.currentStreak >= 7 && (
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[radial-gradient(circle,rgba(251,191,36,0.15)_0%,transparent_70%)] pointer-events-none" />
              )}
              <div className="font-mono text-xs uppercase tracking-wide text-text-tertiary">Streak</div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold">{streak.currentStreak}</span>
                <span className="text-sm text-text-tertiary">days</span>
                {streak.currentStreak >= 7 && <Flame className="w-5 h-5 text-medium fill-medium" />}
              </div>
              <p className="text-xs text-text-tertiary">
                Longest: <span className="font-mono">{streak.longestStreak}</span> days
              </p>
            </div>
          </section>
        </Show>

        {/* Topics preview */}
        <section className="mb-12">
          <div className="flex justify-between items-baseline mb-4 gap-4">
            <h2 className="text-xl font-semibold">Continue the Roadmap</h2>
            <Link href="/topics" className="text-sm text-accent hover:text-accent-hover font-medium">
              View all topics →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATASET.topics.slice(0, 6).map((t, i) => (
              <TopicCard key={t.slug} topic={t} solved={isSignedIn ? topicSolved(t.slug) : 0} index={i} />
            ))}
          </div>
        </section>

        {/* Companies preview */}
        <section className="mb-12">
          <div className="flex justify-between items-baseline mb-4 gap-4">
            <h2 className="text-xl font-semibold">Prep by Company</h2>
            <Link href="/companies" className="text-sm text-accent hover:text-accent-hover font-medium">
              View all companies →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATASET.companies.slice(0, 6).map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        </section>

        {/* Sheets preview */}
        <section className="mb-12">
          <div className="flex justify-between items-baseline mb-4 gap-4">
            <h2 className="text-xl font-semibold">Curated Sheets</h2>
            <Link href="/sheets" className="text-sm text-accent hover:text-accent-hover font-medium">
              View all sheets →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATASET.sheets.map((s) => (
              <SheetCard key={s.slug} sheet={s} solved={isSignedIn ? sheetSolved(s.name) : 0} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-accent-subtle to-bg-surface border border-accent-muted rounded-2xl p-12 text-center flex flex-col items-center gap-4 mb-16">
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[radial-gradient(circle,rgba(110,110,247,0.15)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="text-2xl font-bold max-w-[480px]">Every problem, organized as a learning graph.</h2>
          <p className="text-text-secondary max-w-[480px]">
            Prerequisites tell you what to learn first. Similar problems reinforce patterns. Company tags tell you
            what matters most for your target role.
          </p>
          <Link href="/problems" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md transition-colors shadow-[0_4px_16px_-4px_rgba(110,110,247,0.5)]">
            Explore the full problem list
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
