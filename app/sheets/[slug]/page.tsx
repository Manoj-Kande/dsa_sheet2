"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getSheetBySlug, getProblemsBySheet } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { ProblemTable } from "@/components/shared/problem-table";
import { useUserData } from "@/lib/hooks/use-user-data";

export default function SheetDetailPage() {
  const params = useParams<{ slug: string }>();
  const sheet = getSheetBySlug(params.slug);
  const { progress, isSignedIn } = useUserData();

  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const sheetProblems = useMemo(() => (sheet ? getProblemsBySheet(sheet.name) : []), [sheet]);

  const filtered = useMemo(() => {
    return sheetProblems.filter((p) => {
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false;
      if (statusFilter) {
        const st = progress[p.slug];
        if (statusFilter === "unseen" && st) return false;
        if (statusFilter !== "unseen" && st !== statusFilter.toUpperCase()) return false;
      }
      return true;
    });
  }, [sheetProblems, difficultyFilter, statusFilter, progress]);

  if (!sheet) {
    return (
      <AppShell>
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex flex-col items-center text-center gap-4 text-text-secondary">
            <Inbox className="w-10 h-10 text-text-tertiary" />
            <div className="text-lg font-semibold text-text-primary">Sheet not found</div>
            <Link href="/sheets" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md">
              Back to Sheets
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const solved = isSignedIn ? sheetProblems.filter((p) => progress[p.slug] === "SOLVED").length : 0;
  const pct = sheetProblems.length ? Math.round((solved / sheetProblems.length) * 100) : 0;

  const selectClass =
    "appearance-none bg-bg-surface border border-border-default text-text-primary px-3 py-2 pr-8 rounded-md text-sm cursor-pointer hover:border-border-strong focus-visible:border-border-focus outline-none bg-no-repeat bg-[right_12px_center]";
  const selectStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A0A0B0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
          <Link href="/sheets" className="text-text-secondary hover:text-accent">
            Sheets
          </Link>
          <span className="opacity-50">/</span>
          <span>{sheet.name}</span>
        </div>

        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">{sheet.problem_count} problems</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{sheet.name}</h1>
          <p className="text-text-secondary max-w-[640px]">
            Follow the {sheet.name} sheet end-to-end — a proven, ordered set of problems.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard value={sheetProblems.length} label="Total problems" />
          <StatCard value={solved} label="Solved" colorClass="text-solved" />
          <StatCard value={`${pct}%`} label="Completion" />
          <StatCard
            value={`${sheet.difficulty_breakdown.Easy || 0}/${sheet.difficulty_breakdown.Medium || 0}/${sheet.difficulty_breakdown.Hard || 0}`}
            label="Easy/Med/Hard"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          {isSignedIn && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass} style={selectStyle}>
              <option value="">Any Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unseen">Unseen</option>
            </select>
          )}
        </div>

        <ProblemTable problems={filtered} showTopic />
      </div>
    </AppShell>
  );
}

function StatCard({ value, label, colorClass }: { value: string | number; label: string; colorClass?: string }) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col gap-1">
      <span className={`font-mono text-3xl font-bold tracking-tight ${colorClass || ""}`}>{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}
