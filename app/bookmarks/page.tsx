"use client";

import Link from "next/link";
import { Bookmark, Inbox } from "lucide-react";
import { DATASET } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { ProblemTable } from "@/components/shared/problem-table";
import { useUserData } from "@/lib/hooks/use-user-data";
import { Show, SignInButton } from "@clerk/nextjs";

export default function BookmarksPage() {
  const { bookmarks } = useUserData();

  const seen = new Set<string>();
  const bookmarkedProblems = DATASET.problems.filter((p) => {
    if (!bookmarks.has(p.slug) || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Saved for later</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bookmarks</h1>
          <p className="text-text-secondary max-w-[640px]">
            Problems you&apos;ve bookmarked. Synced to your account across every device you sign in on.
          </p>
        </div>

        <Show when="signed-out">
          <div className="flex flex-col items-center text-center gap-4 py-16 text-text-secondary">
            <Bookmark className="w-10 h-10 text-text-tertiary" />
            <div className="text-lg font-semibold text-text-primary">Sign in to see your bookmarks</div>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md">
                Sign in
              </button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          {bookmarkedProblems.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 py-16 text-text-secondary">
              <Inbox className="w-10 h-10 text-text-tertiary" />
              <div className="text-lg font-semibold text-text-primary">No bookmarks yet</div>
              <div className="text-sm max-w-[360px]">
                Click the bookmark icon on any problem to save it here for later.
              </div>
              <Link href="/problems" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-md">
                Browse Problems
              </Link>
            </div>
          ) : (
            <ProblemTable problems={bookmarkedProblems} showTopic />
          )}
        </Show>
      </div>
    </AppShell>
  );
}
