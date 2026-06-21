"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FileUp, ListChecks, Sparkles, Upload } from "lucide-react";
import { useProblemModal } from "./problem-modal-provider";
import {
  DATASET,
  getProblemById,
  getProblemBySlug,
  Problem,
} from "@/lib/data/dataset";
import {
  DifficultyBadge,
  FrequencyBadge,
  NeutralBadge,
  TagChip,
} from "@/components/ui/badge";
import { QuickLinks } from "@/components/ui/quick-links";

type DailyTargetSource = "manual" | "imported";

type ImportedTarget = {
  slug: string;
  date?: string;
  note?: string;
};

type ImportedPlan = {
  title: string;
  targets: ImportedTarget[];
};

const STORAGE_KEYS = {
  manualSlug: "daily-target.manual-slug",
  manualNote: "daily-target.manual-note",
  source: "daily-target.source",
  importedPlan: "daily-target.imported-plan",
  importedIndex: "daily-target.imported-index",
} as const;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resolveProblem(ref: string | undefined) {
  if (!ref) return null;
  return getProblemBySlug(ref) ?? getProblemById(ref) ?? null;
}

function normalizeTarget(value: unknown): ImportedTarget | null {
  if (typeof value === "string") {
    return value.trim() ? { slug: value.trim() } : null;
  }

  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const slug =
    (typeof item.slug === "string" && item.slug.trim()) ||
    (typeof item.problemSlug === "string" && item.problemSlug.trim()) ||
    (typeof item.id === "string" && item.id.trim()) ||
    "";

  if (!slug) return null;

  return {
    slug,
    date: typeof item.date === "string" ? item.date : undefined,
    note: typeof item.note === "string" ? item.note : undefined,
  };
}

function normalizeImportedPlan(parsed: unknown): ImportedPlan | null {
  if (Array.isArray(parsed)) {
    const targets = parsed
      .map(normalizeTarget)
      .filter(Boolean) as ImportedTarget[];
    return targets.length ? { title: "Imported daily targets", targets } : null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const value = parsed as Record<string, unknown>;
  const rawTargets =
    (Array.isArray(value.targets) && value.targets) ||
    (Array.isArray(value.items) && value.items) ||
    (Array.isArray(value.problems) && value.problems) ||
    null;

  if (rawTargets) {
    const targets = rawTargets
      .map(normalizeTarget)
      .filter(Boolean) as ImportedTarget[];
    return targets.length
      ? {
          title:
            (typeof value.title === "string" && value.title.trim()) ||
            (typeof value.name === "string" && value.name.trim()) ||
            "Imported daily targets",
          targets,
        }
      : null;
  }

  const single = normalizeTarget(parsed);
  if (single) {
    return { title: "Imported daily targets", targets: [single] };
  }

  return null;
}

function ProblemPill({
  problem,
  onClick,
}: {
  problem: Problem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-border-default bg-bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-border-focus hover:bg-bg-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text-primary">
            {problem.title}
          </div>
          <div className="mt-1 text-xs text-text-tertiary">
            {problem.topic} · {problem.subtopic}
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <DifficultyBadge difficulty={problem.difficulty} variant="outline" />
        {problem.frequency && <FrequencyBadge frequency={problem.frequency} />}
        <NeutralBadge>{problem.estimated_time_minutes ?? "—"}m</NeutralBadge>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <QuickLinks problem={problem} />
      </div>
    </button>
  );
}

export function DailyTargetStudio() {
  const { openProblem } = useProblemModal();
  const fileRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [source, setSource] = useState<DailyTargetSource>("manual");
  const [manualSlug, setManualSlug] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [importedPlan, setImportedPlan] = useState<ImportedPlan | null>(null);
  const [importedIndex, setImportedIndex] = useState(0);
  const [jsonText, setJsonText] = useState("");
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedSource = window.localStorage.getItem(
        STORAGE_KEYS.source,
      ) as DailyTargetSource | null;
      const savedManualSlug =
        window.localStorage.getItem(STORAGE_KEYS.manualSlug) || "";
      const savedManualNote =
        window.localStorage.getItem(STORAGE_KEYS.manualNote) || "";
      const savedImportedPlan = window.localStorage.getItem(
        STORAGE_KEYS.importedPlan,
      );
      const savedImportedIndex = window.localStorage.getItem(
        STORAGE_KEYS.importedIndex,
      );

      if (savedSource === "manual" || savedSource === "imported") {
        setSource(savedSource);
      }
      setManualSlug(savedManualSlug);
      setManualNote(savedManualNote);

      if (savedImportedPlan) {
        const parsedPlan = normalizeImportedPlan(JSON.parse(savedImportedPlan));
        if (parsedPlan) setImportedPlan(parsedPlan);
      }

      if (savedImportedIndex) {
        const idx = Number(savedImportedIndex);
        if (!Number.isNaN(idx)) setImportedIndex(idx);
      }
    } catch {
      // Ignore stale localStorage data and start fresh.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.source, source);
    window.localStorage.setItem(STORAGE_KEYS.manualSlug, manualSlug);
    window.localStorage.setItem(STORAGE_KEYS.manualNote, manualNote);
    window.localStorage.setItem(
      STORAGE_KEYS.importedIndex,
      String(importedIndex),
    );
    if (importedPlan) {
      window.localStorage.setItem(
        STORAGE_KEYS.importedPlan,
        JSON.stringify(importedPlan),
      );
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.importedPlan);
    }
  }, [hydrated, source, manualSlug, manualNote, importedPlan, importedIndex]);

  const filteredProblems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const problems = DATASET.problems;
    if (!q) return problems.slice(0, 24);

    return problems
      .filter((problem) => {
        const haystack = [
          problem.title,
          problem.slug,
          problem.topic,
          problem.subtopic,
          ...problem.tags,
          ...problem.companies,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 24);
  }, [query]);

  const manualProblem = resolveProblem(manualSlug);
  const importedTargets = importedPlan?.targets ?? [];
  const importedTodayIndex = importedTargets.findIndex(
    (entry) => entry.date === todayKey(),
  );
  const activeImportedIndex =
    importedTodayIndex >= 0
      ? importedTodayIndex
      : Math.min(importedIndex, Math.max(importedTargets.length - 1, 0));
  const activeImportedTarget = importedTargets[activeImportedIndex] ?? null;
  const activeImportedProblem = resolveProblem(activeImportedTarget?.slug);
  const activeProblem =
    source === "imported" ? activeImportedProblem : manualProblem;

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    handleJsonLoad(text);
  }

  function handleJsonLoad(text: string) {
    try {
      const parsed = JSON.parse(text);
      const plan = normalizeImportedPlan(parsed);
      if (!plan) {
        setStatusMessage("JSON did not contain any usable target entries.");
        return;
      }

      setImportedPlan(plan);
      setImportedIndex(0);
      setSource("imported");
      setStatusMessage(
        `Loaded ${plan.targets.length} target${plan.targets.length === 1 ? "" : "s"}.`,
      );
    } catch {
      setStatusMessage(
        "Invalid JSON. Use an array of slugs or an object with targets/items/problems.",
      );
    }
  }

  function selectManualProblem(problem: Problem) {
    setManualSlug(problem.slug);
    setSource("manual");
    setStatusMessage(`Selected ${problem.title} as the manual daily target.`);
  }

  function selectImportedIndex(index: number) {
    setImportedIndex(index);
    setSource("imported");
    setStatusMessage(`Previewing imported target ${index + 1}.`);
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border-default bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-base p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.65)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(110,110,247,0.2)_0%,transparent_70%)]" />
        <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.1)_0%,transparent_70%)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-muted bg-accent-subtle px-3 py-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Daily Target
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Pick one problem for today or import a full target plan.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
              Use the manual picker for a single focus problem, or drop in a
              JSON file to load a structured daily-target plan. Everything is
              stored locally in your browser for now.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSource("manual")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  source === "manual"
                    ? "border-accent bg-accent text-white"
                    : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
                }`}
              >
                Manual pick
              </button>
              <button
                type="button"
                onClick={() => setSource("imported")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  source === "imported"
                    ? "border-accent bg-accent text-white"
                    : "border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary"
                }`}
              >
                Imported plan
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Problems", DATASET.stats.total_problems],
                ["Topics", DATASET.stats.total_topics],
                ["Sheets", DATASET.stats.total_sheets],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border-default bg-bg-base/80 p-4"
                >
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    {value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-text-tertiary">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl border border-border-default bg-bg-base/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-text-tertiary">
                  Active target
                </div>
                <div className="mt-1 text-lg font-semibold text-text-primary">
                  {activeProblem ? activeProblem.title : "No target selected"}
                </div>
              </div>
              <div className="rounded-full border border-border-default bg-bg-surface px-3 py-1 text-xs font-medium text-text-tertiary">
                {source === "manual" ? "Manual" : "Imported"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border-default bg-bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <ListChecks className="h-3.5 w-3.5" />
                {source === "manual"
                  ? "One target"
                  : `${importedTargets.length} imported targets`}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border-default bg-bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <FileUp className="h-3.5 w-3.5" />
                JSON import enabled
              </div>
            </div>

            {activeProblem ? (
              <div className="mt-5 rounded-2xl border border-border-default bg-bg-elevated p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <DifficultyBadge difficulty={activeProblem.difficulty} />
                      <NeutralBadge>
                        {activeProblem.estimated_time_minutes ?? "—"} min
                      </NeutralBadge>
                      {activeProblem.frequency && (
                        <FrequencyBadge frequency={activeProblem.frequency} />
                      )}
                    </div>
                    <div className="mt-3 text-sm text-text-secondary">
                      {activeProblem.topic} · {activeProblem.subtopic}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openProblem(activeProblem.id)}
                    className="rounded-full border border-border-default bg-bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong"
                  >
                    Open details
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeProblem.tags.slice(0, 4).map((tag) => (
                    <TagChip key={tag}>{tag}</TagChip>
                  ))}
                </div>

                {manualNote && source === "manual" && (
                  <p className="mt-4 rounded-2xl border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-secondary">
                    {manualNote}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border-default bg-bg-surface p-4 text-sm text-text-tertiary">
                Pick a problem from the list or load a JSON plan to activate
                today&apos;s target.
              </div>
            )}
          </div>
        </div>
      </section>

      {statusMessage && (
        <div className="rounded-2xl border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-secondary">
          {statusMessage}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border-default bg-bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">
                Manual picker
              </div>
              <h2 className="mt-1 text-xl font-semibold text-text-primary">
                Choose one problem
              </h2>
            </div>
            <Link
              href="/problems"
              className="text-sm text-accent hover:text-accent-hover"
            >
              Browse all problems →
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-border-default bg-bg-base p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems, topics, companies, tags..."
              className="w-full rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-border-focus"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredProblems.map((problem) => (
              <ProblemPill
                key={problem.id}
                problem={problem}
                onClick={() => selectManualProblem(problem)}
              />
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-border-default bg-bg-base p-4">
            <label className="text-xs uppercase tracking-wide text-text-tertiary">
              Manual note
            </label>
            <textarea
              value={manualNote}
              onChange={(e) => {
                setManualNote(e.target.value);
                setSource("manual");
              }}
              placeholder="Add a short reminder for today's target..."
              className="mt-3 w-full min-h-28 rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-border-focus"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border-default bg-bg-surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-text-tertiary">
                JSON import
              </div>
              <h2 className="mt-1 text-xl font-semibold text-text-primary">
                Load a daily target plan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-border-default bg-bg-base px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-border-strong"
            >
              <Upload className="mr-1.5 inline-block h-3.5 w-3.5" />
              Upload JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                void handleFileUpload(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-border-default bg-bg-base p-4">
            <label className="text-xs uppercase tracking-wide text-text-tertiary">
              Paste JSON
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[
  "two-sum",
  { "slug": "binary-search", "date": "2026-06-21", "note": "Binary search warmup" }
]`}
              className="mt-3 w-full min-h-44 rounded-xl border border-border-default bg-bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-border-focus"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJsonText("")}
                className="rounded-full border border-border-default px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleJsonLoad(jsonText)}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Import targets
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Imported preview
              </h3>
              {importedPlan && (
                <span className="text-xs text-text-tertiary">
                  {importedPlan.title} · {importedPlan.targets.length} items
                </span>
              )}
            </div>

            {importedPlan ? (
              <div className="mt-3 space-y-3">
                {importedPlan.targets.map((entry, index) => {
                  const problem = resolveProblem(entry.slug);
                  const isActive =
                    index === activeImportedIndex && source === "imported";
                  return (
                    <button
                      key={`${entry.slug}-${index}`}
                      type="button"
                      onClick={() => selectImportedIndex(index)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                        isActive
                          ? "border-accent bg-accent-subtle shadow-[0_12px_28px_-18px_rgba(110,110,247,0.55)]"
                          : "border-border-default bg-bg-base hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-wide text-text-tertiary">
                            {entry.date || `Target ${index + 1}`}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-text-primary">
                            {problem?.title || entry.slug}
                          </div>
                          {entry.note && (
                            <div className="mt-1 text-xs text-text-secondary">
                              {entry.note}
                            </div>
                          )}
                        </div>
                        <span className="rounded-full border border-border-default bg-bg-surface px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
                          {problem ? problem.difficulty : "Unknown"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-border-default bg-bg-base p-4 text-sm text-text-tertiary">
                Import an array of slugs, or an object with{" "}
                <span className="font-mono">targets</span>,{" "}
                <span className="font-mono">items</span>, or{" "}
                <span className="font-mono">problems</span>.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
