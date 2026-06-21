import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TopicSummary, CompanySummary, SheetSummary, Difficulty } from "@/lib/data/dataset";
import { CompanyBadge } from "@/components/ui/company-badge";

/** Segmented stacked bar (Easy/Medium/Hard) — reads as a visual shape, not three competing numbers. */
function DifficultyBar({ breakdown }: { breakdown: Record<Difficulty, number> }) {
  const easy = breakdown.Easy || 0;
  const medium = breakdown.Medium || 0;
  const hard = breakdown.Hard || 0;
  const total = easy + medium + hard;
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 rounded-full overflow-hidden flex bg-bg-subtle">
        {easy > 0 && <div className="h-full bg-easy" style={{ width: `${(easy / total) * 100}%` }} />}
        {medium > 0 && <div className="h-full bg-medium" style={{ width: `${(medium / total) * 100}%` }} />}
        {hard > 0 && <div className="h-full bg-hard" style={{ width: `${(hard / total) * 100}%` }} />}
      </div>
      <div className="flex gap-3 text-[11px] font-mono text-text-tertiary">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-easy" /> {easy}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-medium" /> {medium}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-hard" /> {hard}
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
      <div
        className="h-full bg-accent rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Shared card shell: depth on hover (shadow + lift + border glow), not just a border-color swap. */
const CARD_BASE =
  "group relative bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 hover:border-accent-muted hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(110,110,247,0.25)]";

export function TopicCard({
  topic,
  solved,
  index,
}: {
  topic: TopicSummary;
  solved: number;
  index?: number;
}) {
  const pct = topic.problem_count ? Math.round((solved / topic.problem_count) * 100) : 0;
  return (
    <Link href={`/topics/${topic.slug}`} className={CARD_BASE}>
      <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start gap-3">
        <div>
          {index !== undefined && (
            <span className="font-mono text-xs text-accent block mb-1">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <span className="text-lg font-semibold pr-6">{topic.topic}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Progress</span>
          <span className="font-mono">
            {solved}/{topic.problem_count}
          </span>
        </div>
        <ProgressBar pct={pct} />
      </div>
      <DifficultyBar breakdown={topic.difficulty_breakdown} />
      <div className="text-xs text-text-tertiary mt-auto pt-1 border-t border-border-default">
        {topic.subtopic_count} subtopics
      </div>
    </Link>
  );
}

export function CompanyCard({ company }: { company: CompanySummary }) {
  return (
    <Link href={`/companies/${company.slug}`} className={CARD_BASE}>
      <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-3">
        <CompanyBadge name={company.name} size="md" />
        <div className="flex-1 min-w-0">
          <span className="text-lg font-semibold block truncate pr-6">{company.name}</span>
          <span className="text-xs font-mono text-text-tertiary">{company.problem_count} problems tagged</span>
        </div>
      </div>
      <DifficultyBar breakdown={company.difficulty_breakdown} />
    </Link>
  );
}

export function SheetCard({ sheet, solved }: { sheet: SheetSummary; solved: number }) {
  const pct = sheet.problem_count ? Math.round((solved / sheet.problem_count) * 100) : 0;
  return (
    <Link href={`/sheets/${sheet.slug}`} className={CARD_BASE}>
      <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="text-lg font-semibold pr-6">{sheet.name}</span>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>Progress</span>
          <span className="font-mono">
            {solved}/{sheet.problem_count}
          </span>
        </div>
        <ProgressBar pct={pct} />
      </div>
      <DifficultyBar breakdown={sheet.difficulty_breakdown} />
    </Link>
  );
}
