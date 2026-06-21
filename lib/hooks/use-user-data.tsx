"use client";

// ============================================
// UserDataProvider — client-side cache of the signed-in user's
// progress / bookmarks / notes, backed by our API routes.
// Mirrors the old localStorage `Store` shape so component logic
// stays familiar, but now syncs across devices.
// ============================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

export type ProblemStatus = "ATTEMPTED" | "SOLVED" | "REVISIT";

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalSolved: number;
}

interface UserDataState {
  isSignedIn: boolean;
  isLoaded: boolean;
  progress: Record<string, ProblemStatus>;
  bookmarks: Set<string>;
  notes: Record<string, string>;
  streak: Streak;
  getStatus: (slug: string) => ProblemStatus | null;
  cycleStatus: (slug: string) => Promise<void>;
  isBookmarked: (slug: string) => boolean;
  toggleBookmark: (slug: string) => Promise<void>;
  getNote: (slug: string) => string;
  saveNote: (slug: string, content: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const UserDataContext = createContext<UserDataState | null>(null);

const STATUS_CYCLE: (ProblemStatus | null)[] = [null, "SOLVED", "ATTEMPTED", "REVISIT"];

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || "Request failed");
  }
  return json.data as T;
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProblemStatus>>({});
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [streak, setStreak] = useState<Streak>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalSolved: 0,
  });

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const [progressData, bookmarksData, notesData] = await Promise.all([
        fetchJson<Record<string, ProblemStatus>>("/api/progress"),
        fetchJson<string[]>("/api/bookmarks"),
        fetchJson<Record<string, string>>("/api/notes"),
      ]);
      setProgress(progressData);
      setBookmarks(new Set(bookmarksData));
      setNotes(notesData);
    } catch (err) {
      console.error("Failed to load user data", err);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Fetching user data when auth state resolves to signed-in — the
      // canonical "sync with external system" effect use case. This rule
      // currently has false positives for exactly this pattern, see
      // https://github.com/facebook/react/issues/34743
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refresh();
    }
  }, [isLoaded, isSignedIn, refresh]);

  const getStatus = useCallback((slug: string) => progress[slug] ?? null, [progress]);

  const cycleStatus = useCallback(
    async (slug: string) => {
      if (!isSignedIn) return;
      const current = progress[slug] ?? null;
      const idx = STATUS_CYCLE.indexOf(current);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];

      // optimistic update
      setProgress((prev) => {
        const copy = { ...prev };
        if (next === null) delete copy[slug];
        else copy[slug] = next;
        return copy;
      });

      try {
        await fetchJson("/api/progress", {
          method: "POST",
          body: JSON.stringify({ problemSlug: slug, status: next }),
        });
        if (next === "SOLVED") {
          setStreak((s) => ({ ...s, totalSolved: s.totalSolved + 1 }));
        }
      } catch (err) {
        console.error("Failed to update status", err);
        // revert on failure
        setProgress((prev) => {
          const copy = { ...prev };
          if (current === null) delete copy[slug];
          else copy[slug] = current;
          return copy;
        });
      }
    },
    [isSignedIn, progress]
  );

  const isBookmarked = useCallback((slug: string) => bookmarks.has(slug), [bookmarks]);

  const toggleBookmark = useCallback(
    async (slug: string) => {
      if (!isSignedIn) return;
      const wasBookmarked = bookmarks.has(slug);

      setBookmarks((prev) => {
        const copy = new Set(prev);
        if (wasBookmarked) copy.delete(slug);
        else copy.add(slug);
        return copy;
      });

      try {
        await fetchJson("/api/bookmarks", {
          method: "POST",
          body: JSON.stringify({ problemSlug: slug }),
        });
      } catch (err) {
        console.error("Failed to toggle bookmark", err);
        setBookmarks((prev) => {
          const copy = new Set(prev);
          if (wasBookmarked) copy.add(slug);
          else copy.delete(slug);
          return copy;
        });
      }
    },
    [isSignedIn, bookmarks]
  );

  const getNote = useCallback((slug: string) => notes[slug] ?? "", [notes]);

  const saveNote = useCallback(
    async (slug: string, content: string) => {
      if (!isSignedIn) return;
      setNotes((prev) => ({ ...prev, [slug]: content }));
      try {
        await fetchJson("/api/notes", {
          method: "POST",
          body: JSON.stringify({ problemSlug: slug, content }),
        });
      } catch (err) {
        console.error("Failed to save note", err);
      }
    },
    [isSignedIn]
  );

  const value = useMemo<UserDataState>(
    () => ({
      isSignedIn: !!isSignedIn,
      isLoaded,
      progress,
      bookmarks,
      notes,
      streak,
      getStatus,
      cycleStatus,
      isBookmarked,
      toggleBookmark,
      getNote,
      saveNote,
      refresh,
    }),
    [
      isSignedIn,
      isLoaded,
      progress,
      bookmarks,
      notes,
      streak,
      getStatus,
      cycleStatus,
      isBookmarked,
      toggleBookmark,
      getNote,
      saveNote,
      refresh,
    ]
  );

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return ctx;
}
