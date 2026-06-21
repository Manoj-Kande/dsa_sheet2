"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ListTree, Layers, Building2, FolderOpen } from "lucide-react";
import { DATASET, getUniqueProblems } from "@/lib/data/dataset";
import { DifficultyBadge } from "@/components/ui/badge";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useProblemModal } from "./problem-modal-provider";

type ResultItem =
  | { type: "problem"; title: string; sub: string; href: string; difficulty: string; problemId: string }
  | { type: "topic"; title: string; sub: string; href: string }
  | { type: "company"; title: string; sub: string; href: string }
  | { type: "sheet"; title: string; sub: string; href: string };

function buildIndex(): ResultItem[] {
  const items: ResultItem[] = [];
  getUniqueProblems().forEach((p) => {
    items.push({
      type: "problem",
      title: p.title,
      sub: `${p.topic} · ${p.difficulty}`,
      href: `/problems/${p.slug}`,
      difficulty: p.difficulty,
      problemId: p.id,
    });
  });
  DATASET.topics.forEach((t) => {
    items.push({ type: "topic", title: t.topic, sub: `${t.problem_count} problems`, href: `/topics/${t.slug}` });
  });
  DATASET.companies.forEach((c) => {
    items.push({ type: "company", title: c.name, sub: `${c.problem_count} problems`, href: `/companies/${c.slug}` });
  });
  DATASET.sheets.forEach((s) => {
    items.push({ type: "sheet", title: s.name, sub: `${s.problem_count} problems`, href: `/sheets/${s.slug}` });
  });
  return items;
}

const ICONS = {
  problem: ListTree,
  topic: Layers,
  company: Building2,
  sheet: FolderOpen,
};
const GROUP_LABELS = { problem: "Problems", topic: "Topics", company: "Companies", sheet: "Sheets" };

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { openProblem } = useProblemModal();
  const index = useMemo(() => buildIndex(), []);
  const listboxId = useId();
  const dialogRef = useFocusTrap<HTMLDivElement>(open, inputRef);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onOpenChange]);

  useEffect(() => {
    if (open) {
      // Resetting local UI state when the palette opens (not a derived-state
      // case) — eslint-plugin-react-hooks currently has false positives here,
      // see https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setSelectedIndex(0);
      // Initial focus is handled by useFocusTrap (focuses inputRef).
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered: ResultItem[];
    if (!q) {
      filtered = [
        ...index.filter((i) => i.type !== "problem").slice(0, 8),
        ...index.filter((i) => i.type === "problem").slice(0, 6),
      ];
    } else {
      filtered = index.filter(
        (i) => i.title.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, 40);
  }, [query, index]);

  const grouped = useMemo(() => {
    const groups: Record<string, ResultItem[]> = { problem: [], topic: [], company: [], sheet: [] };
    results.forEach((r) => groups[r.type].push(r));
    return groups;
  }, [results]);

  const flatResults = useMemo(
    () => [...grouped.problem, ...grouped.topic, ...grouped.company, ...grouped.sheet],
    [grouped]
  );

  function selectItem(item: ResultItem) {
    onOpenChange(false);
    if (item.type === "problem") {
      openProblem(item.problemId);
    } else {
      router.push(item.href);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[selectedIndex]) selectItem(flatResults[selectedIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[200] bg-bg-base/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search problems, topics, companies, sheets"
        className="w-full max-w-[560px] bg-bg-elevated border border-border-strong rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
      >
        <div className="flex items-center gap-3 p-4 border-b border-border-default flex-shrink-0">
          <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={
              flatResults[selectedIndex] ? `${listboxId}-${selectedIndex}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search problems, topics, companies, sheets…"
            autoComplete="off"
            className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary"
          />
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="w-7 h-7 grid place-items-center rounded-md bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div role="listbox" id={listboxId} aria-label="Search results" className="overflow-y-auto p-2">
          {flatResults.length === 0 && (
            <div className="py-8 px-4 text-center text-text-tertiary text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {(["problem", "topic", "company", "sheet"] as const).map((type) => {
            if (grouped[type].length === 0) return null;
            const Icon = ICONS[type];
            return (
              <div key={type}>
                <div className="text-xs font-semibold uppercase tracking-wide text-text-tertiary px-3 py-2">
                  {GROUP_LABELS[type]}
                </div>
                {grouped[type].map((item) => {
                  flatIdx++;
                  const idx = flatIdx;
                  return (
                    <div
                      key={item.href + item.title}
                      id={`${listboxId}-${idx}`}
                      role="option"
                      aria-selected={idx === selectedIndex}
                      onClick={() => selectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                        idx === selectedIndex ? "bg-bg-subtle" : ""
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-bg-surface grid place-items-center text-text-tertiary flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-text-primary truncate">{item.title}</div>
                        <div className="text-xs text-text-tertiary">{item.sub}</div>
                      </div>
                      {item.type === "problem" && (
                        <DifficultyBadge difficulty={item.difficulty as "Easy" | "Medium" | "Hard"} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 px-4 py-2 border-t border-border-default flex-shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <kbd className="font-mono px-1.5 py-0.5 bg-bg-surface border border-border-default rounded">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <kbd className="font-mono px-1.5 py-0.5 bg-bg-surface border border-border-default rounded">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
            <kbd className="font-mono px-1.5 py-0.5 bg-bg-surface border border-border-default rounded">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
