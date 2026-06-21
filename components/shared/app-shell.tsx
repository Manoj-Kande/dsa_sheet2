import { TopNav } from "./top-nav";
import { ProblemModalProvider } from "./problem-modal-provider";
import { DATASET } from "@/lib/data/dataset";
import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProblemModalProvider>
      <TopNav />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border-default py-8 mt-16">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm text-text-tertiary">
            InterviewOS — {DATASET.stats.total_problems} problems · {DATASET.stats.total_topics} topics
          </span>
          <div className="flex gap-4">
            <Link href="/" className="text-sm text-text-tertiary hover:text-text-primary">
              Dashboard
            </Link>
            <Link href="/problems" className="text-sm text-text-tertiary hover:text-text-primary">
              All Problems
            </Link>
            <Link href="/topics" className="text-sm text-text-tertiary hover:text-text-primary">
              Roadmap
            </Link>
          </div>
        </div>
      </footer>
    </ProblemModalProvider>
  );
}
