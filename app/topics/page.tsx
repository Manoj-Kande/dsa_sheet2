"use client";

import { DATASET, getProblemsByTopic } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { TopicCard } from "@/components/shared/cards";
import { useUserData } from "@/lib/hooks/use-user-data";

export default function TopicsPage() {
  const { progress, isSignedIn } = useUserData();

  function topicSolved(slug: string) {
    if (!isSignedIn) return 0;
    return getProblemsByTopic(slug).filter((p) => progress[p.slug] === "SOLVED").length;
  }

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Learning Graph</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Roadmap</h1>
          <p className="text-text-secondary max-w-[640px]">
            All {DATASET.stats.total_topics} topics in suggested order. Each topic breaks down into subtopics,
            building from fundamentals toward advanced patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATASET.topics.map((t, i) => (
            <TopicCard key={t.slug} topic={t} solved={topicSolved(t.slug)} index={i} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
