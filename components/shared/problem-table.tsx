"use client";

import Link from "next/link";
import { Problem } from "@/lib/data/dataset";
import { DifficultyBadge, FrequencyBadge } from "@/components/ui/badge";
import { StatusIcon } from "@/components/ui/status-icon";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { CompanyBadgeRow } from "@/components/ui/company-badge";
import { QuickLinks } from "@/components/ui/quick-links";
import { useProblemModal } from "./problem-modal-provider";

export function ProblemRow({
  problem,
  showTopic = false,
  showFrequency = false,
  showCompanies = true,
}: {
  problem: Problem;
  showTopic?: boolean;
  showFrequency?: boolean;
  showCompanies?: boolean;
}) {
  const { openProblem } = useProblemModal();

  return (
    <div
      onClick={() => openProblem(problem.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProblem(problem.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${problem.title}`}
      className="group flex items-center gap-4 px-4 py-3.5 border-b border-border-default last:border-none cursor-pointer transition-colors hover:bg-bg-elevated focus-visible:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-[-2px]"
    >
      <div className="shrink-0">
        <StatusIcon slug={problem.slug} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-primary truncate">
            {problem.title}
          </span>
          {showTopic && (
            <Link
              href={`/topics/${problem.topic_slug}`}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
              className="text-xs text-text-tertiary hover:text-accent whitespace-nowrap"
            >
              · {problem.topic}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {showCompanies && problem.companies.length > 0 && (
            <CompanyBadgeRow companies={problem.companies} />
          )}
          {problem.tags.length > 0 && (
            <span className="text-xs text-text-tertiary truncate">
              {problem.tags.slice(0, 3).join(" · ")}
            </span>
          )}
        </div>
      </div>

      {showFrequency && (
        <div className="hidden lg:block shrink-0">
          <FrequencyBadge frequency={problem.frequency} />
        </div>
      )}

      <div className="hidden sm:block shrink-0 w-22 text-right">
        <DifficultyBadge difficulty={problem.difficulty} variant="outline" />
      </div>

      <div className="hidden md:block shrink-0 w-16 text-right text-text-tertiary font-mono text-xs">
        {problem.estimated_time_minutes ?? "—"}m
      </div>

      <div
        className="shrink-0 flex items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <QuickLinks problem={problem} />
        <BookmarkButton slug={problem.slug} />
      </div>
    </div>
  );
}

export function ProblemTable({
  problems,
  showTopic = false,
  showFrequency = false,
  showCompanies = true,
  bare = false,
}: {
  problems: Problem[];
  showTopic?: boolean;
  showFrequency?: boolean;
  showCompanies?: boolean;
  /** Skip the outer border/background — use when already nested inside another bordered container (e.g. CollapsibleGroup). */
  bare?: boolean;
}) {
  const rows = problems.map((p) => (
    <ProblemRow
      key={p.id}
      problem={p}
      showTopic={showTopic}
      showFrequency={showFrequency}
      showCompanies={showCompanies}
    />
  ));

  if (bare) return <div>{rows}</div>;

  return (
    <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
      {rows}
    </div>
  );
}
