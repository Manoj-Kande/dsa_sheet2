"use client";

import { useMemo, useState } from "react";
import { Search, X, Inbox } from "lucide-react";
import { DATASET, getUniqueProblems, Problem } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { ProblemTable } from "@/components/shared/problem-table";
import { CollapsibleGroup } from "@/components/shared/collapsible-group";
import { useUserData } from "@/lib/hooks/use-user-data";

const PAGE_SIZE = 50;

export default function ProblemsPage() {
  const { progress, isSignedIn } = useUserData();
  const allProblems = useMemo(() => getUniqueProblems(), []);

  const [query, setQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [sheetFilter, setSheetFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    return allProblems.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (topicFilter && p.topic_slug !== topicFilter) return false;
      if (difficultyFilter && p.difficulty !== difficultyFilter) return false;
      if (companyFilter && !p.companies.includes(companyFilter)) return false;
      if (sheetFilter && !p.sheets.includes(sheetFilter)) return false;
      if (statusFilter) {
        const st = progress[p.slug];
        if (statusFilter === "unseen" && st) return false;
        if (statusFilter !== "unseen" && st !== statusFilter.toUpperCase()) return false;
      }
      return true;
    });
  }, [allProblems, query, topicFilter, difficultyFilter, companyFilter, sheetFilter, statusFilter, progress]);

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (query) activeFilters.push({ key: "q", label: `"${query}"`, clear: () => setQuery("") });
  if (topicFilter)
    activeFilters.push({
      key: "topic",
      label: DATASET.topics.find((t) => t.slug === topicFilter)?.topic || topicFilter,
      clear: () => setTopicFilter(""),
    });
  if (difficultyFilter)
    activeFilters.push({ key: "difficulty", label: difficultyFilter, clear: () => setDifficultyFilter("") });
  if (companyFilter) activeFilters.push({ key: "company", label: companyFilter, clear: () => setCompanyFilter("") });
  if (sheetFilter) activeFilters.push({ key: "sheet", label: sheetFilter, clear: () => setSheetFilter("") });
  if (statusFilter)
    activeFilters.push({
      key: "status",
      label: statusFilter[0].toUpperCase() + statusFilter.slice(1),
      clear: () => setStatusFilter(""),
    });

  // With zero filters active, browsing 386 flat rows is overwhelming —
  // group by topic (collapsible) instead. Any filter/search collapses back
  // to a flat, paginated list since grouping a narrow filtered subset adds
  // more friction than it removes.
  const noFiltersActive = activeFilters.length === 0;

  const groupedByTopic = useMemo(() => {
    if (!noFiltersActive) return [];
    const byTopic = new Map<string, Problem[]>();
    for (const p of filtered) {
      const list = byTopic.get(p.topic_slug);
      if (list) list.push(p);
      else byTopic.set(p.topic_slug, [p]);
    }
    // Preserve the dataset's topic ordering rather than Map insertion order.
    return DATASET.topics
      .map((t) => ({ topic: t, problems: byTopic.get(t.slug) || [] }))
      .filter((g) => g.problems.length > 0);
  }, [filtered, noFiltersActive]);

  const selectClass =
    "appearance-none bg-bg-surface border border-border-default text-text-primary px-3 py-2 pr-8 rounded-md text-sm cursor-pointer hover:border-border-strong focus-visible:border-border-focus outline-none bg-no-repeat bg-[right_12px_center]";
  const selectStyle = {
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23A0A0B0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Full Index</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">All Problems</h1>
          <p className="text-text-secondary max-w-[640px]">
            Search, filter, and track all {DATASET.stats.total_problems} problems across every topic.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <label htmlFor="problem-search" className="sr-only">
              Search problem titles
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            <input
              id="problem-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search problem titles…"
              autoComplete="off"
              className="w-full bg-bg-surface border border-border-default text-text-primary pl-9 pr-3 py-2 rounded-md text-sm placeholder:text-text-tertiary focus-visible:border-border-focus outline-none"
            />
          </div>
          <select
            aria-label="Filter by topic"
            value={topicFilter}
            onChange={(e) => {
              setTopicFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">All Topics</option>
            {DATASET.topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.topic}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by difficulty"
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            aria-label="Filter by company"
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">All Companies</option>
            {DATASET.companies.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by sheet"
            value={sheetFilter}
            onChange={(e) => {
              setSheetFilter(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            className={selectClass}
            style={selectStyle}
          >
            <option value="">All Sheets</option>
            {DATASET.sheets.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {isSignedIn && (
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">Any Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="revisit">Revisit</option>
              <option value="unseen">Unseen</option>
            </select>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-accent-subtle text-accent rounded-full text-xs font-medium"
              >
                {f.label}
                <button onClick={f.clear} aria-label="Clear filter" className="p-0.5 rounded-full hover:bg-accent-muted">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="text-sm text-text-tertiary mb-3">
          {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 py-16 text-text-secondary">
            <Inbox className="w-10 h-10 text-text-tertiary" />
            <div className="text-lg font-semibold text-text-primary">No problems match your filters</div>
            <div className="text-sm max-w-[360px]">Try clearing a filter or searching a different term.</div>
          </div>
        ) : noFiltersActive ? (
          <div className="flex flex-col gap-4">
            {groupedByTopic.map(({ topic, problems }) => {
              const topicSolved = isSignedIn
                ? problems.filter((p) => progress[p.slug] === "SOLVED").length
                : undefined;
              return (
                <CollapsibleGroup
                  key={topic.slug}
                  title={topic.topic}
                  total={problems.length}
                  solved={topicSolved}
                  defaultOpen={false}
                >
                  <ProblemTable problems={problems} showCompanies={false} bare />
                </CollapsibleGroup>
              );
            })}
          </div>
        ) : (
          <>
            <ProblemTable problems={filtered.slice(0, visibleCount)} showTopic />
            {filtered.length > visibleCount && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="px-4 py-2 bg-bg-elevated border border-border-default hover:border-border-strong text-text-primary text-sm font-semibold rounded-md transition-colors"
                >
                  Load 50 more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
