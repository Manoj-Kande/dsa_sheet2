"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getCompanyBySlug, getProblemsByCompany } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { ProblemTable } from "@/components/shared/problem-table";
import { useUserData } from "@/lib/hooks/use-user-data";

const FREQ_ORDER: Record<string, number> = { "Very High": 0, High: 1, Medium: 2, Low: 3 };

export default function CompanyDetailPage() {
  const params = useParams<{ slug: string }>();
  const company = getCompanyBySlug(params.slug);
  const { progress, isSignedIn } = useUserData();

  const [frequencyFilter, setFrequencyFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const companyProblems = useMemo(() => {
    if (!company) return [];
    return getProblemsByCompany(company.name).sort(
      (a, b) => (FREQ_ORDER[a.frequency || ""] ?? 9) - (FREQ_ORDER[b.frequency || ""] ?? 9)
    );
  }, [company]);

  const filtered = useMemo(() => {
    return companyProblems.filter((p) => {
      if (frequencyFilter && p.frequency !== frequencyFilter) return false;
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [companyProblems, frequencyFilter, difficultyFilter]);

  if (!company) {
    return (
      <AppShell>
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex flex-col items-center text-center gap-4 text-text-secondary">
            <Inbox className="w-10 h-10 text-text-tertiary" />
            <div className="text-lg font-semibold text-text-primary">Company not found</div>
            <Link href="/companies" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md">
              Back to Companies
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const solved = isSignedIn ? companyProblems.filter((p) => progress[p.slug] === "SOLVED").length : 0;
  const pct = companyProblems.length ? Math.round((solved / companyProblems.length) * 100) : 0;

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
          <Link href="/companies" className="text-text-secondary hover:text-accent">
            Companies
          </Link>
          <span className="opacity-50">/</span>
          <span>{company.name}</span>
        </div>

        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">
            {company.problem_count} problems tagged
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{company.name}</h1>
          <p className="text-text-secondary max-w-[640px]">
            Problems frequently asked in {company.name} technical interviews, sorted by frequency.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard value={companyProblems.length} label="Total problems" />
          <StatCard value={solved} label="Solved" colorClass="text-solved" />
          <StatCard value={company.frequency_breakdown["Very High"] || 0} label="Very High freq." colorClass="text-hard" />
          <StatCard value={`${pct}%`} label="Completion" />
        </div>

        <div className="flex gap-2 mb-4">
          <select aria-label="Filter by frequency" value={frequencyFilter} onChange={(e) => setFrequencyFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="">All Frequencies</option>
            <option value="Very High">Very High</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select aria-label="Filter by difficulty" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className={selectClass} style={selectStyle}>
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <ProblemTable problems={filtered} showTopic showFrequency />
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
