"use client";

import { Bookmark } from "lucide-react";
import { useUserData } from "@/lib/hooks/use-user-data";

export function BookmarkButton({ slug }: { slug: string }) {
  const { isBookmarked, toggleBookmark, isSignedIn } = useUserData();
  const active = isBookmarked(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!isSignedIn) {
          window.location.href = "/sign-in";
          return;
        }
        toggleBookmark(slug);
      }}
      aria-label={active ? "Remove bookmark" : "Add bookmark"}
      title={isSignedIn ? (active ? "Remove bookmark" : "Bookmark") : "Sign in to bookmark"}
      className={`grid place-items-center rounded p-1 transition-colors ${
        active ? "text-accent" : "text-text-tertiary hover:text-text-primary"
      }`}
    >
      <Bookmark className="w-4 h-4" fill={active ? "currentColor" : "none"} />
    </button>
  );
}
