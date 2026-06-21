"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getTopicBySlug, DATASET } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { ProblemTable } from "@/components/shared/problem-table";
import { CollapsibleGroup } from "@/components/shared/collapsible-group";
import { useUserData } from "@/lib/hooks/use-user-data";
import { Inbox } from "lucide-react";

export default function TopicDetailPage() {
  const params = useParams<{ slug: string }>();
  const topic = getTopicBySlug(params.slug);
  const { progress, isSignedIn } = useUserData();

  if (!topic) {
    return (
      <AppShell>
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="flex flex-col items-center text-center gap-4 text-text-secondary">
            <Inbox className="w-10 h-10 text-text-tertiary" />
            <div className="text-lg font-semibold text-text-primary">Topic not found</div>
            <Link href="/topics" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md">
              Back to Roadmap
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const allProblems = DATASET.problems.filter((p) => p.topic_slug === topic.slug);
  const solved = isSignedIn ? allProblems.filter((p) => progress[p.slug] === "SOLVED").length : 0;
  const attempted = isSignedIn ? allProblems.filter((p) => progress[p.slug] === "ATTEMPTED").length : 0;
  const pct = topic.problem_count ? Math.round((solved / topic.problem_count) * 100) : 0;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-text-tertiary mb-4">
          <Link href="/topics" className="text-text-secondary hover:text-accent">
            Roadmap
          </Link>
          <span className="opacity-50">/</span>
          <span>{topic.topic}</span>
        </div>

        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">
            {topic.subtopic_count} subtopics · {topic.problem_count} problems
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{topic.topic}</h1>
          <p className="text-text-secondary max-w-[640px]">
            Work through {topic.subtopic_count} subtopics covering {topic.problem_count} problems, ordered from
            foundational to advanced.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard value={topic.problem_count} label="Total problems" />
          <StatCard value={solved} label="Solved" colorClass="text-solved" />
          <StatCard value={attempted} label="Attempted" colorClass="text-attempted" />
          <StatCard value={`${pct}%`} label="Completion" />
        </div>

        <div className="flex flex-col gap-4">
          {topic.subtopics.map((st) => {
            const subProblems = DATASET.problems.filter(
              (p) => p.topic_slug === topic.slug && p.subtopic_slug === st.slug
            );
            const subSolved = isSignedIn
              ? subProblems.filter((p) => progress[p.slug] === "SOLVED").length
              : undefined;
            return (
              <CollapsibleGroup
                key={st.slug}
                title={st.name}
                total={subProblems.length}
                solved={subSolved}
              >
                <ProblemTable problems={subProblems} bare />
              </CollapsibleGroup>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  value,
  label,
  colorClass,
}: {
  value: string | number;
  label: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col gap-1">
      <span className={`font-mono text-3xl font-bold tracking-tight ${colorClass || ""}`}>{value}</span>
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}
