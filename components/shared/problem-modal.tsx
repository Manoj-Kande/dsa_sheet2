"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { getProblemById, DATASET } from "@/lib/data/dataset";
import {
  DifficultyBadge,
  FrequencyBadge,
  NeutralBadge,
  TagChip,
} from "@/components/ui/badge";
import { StatusIcon } from "@/components/ui/status-icon";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { useUserData } from "@/lib/hooks/use-user-data";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useProblemModal } from "./problem-modal-provider";
import { PLATFORM_LINKS } from "@/components/ui/quick-links";

export function ProblemModal({
  problemId,
  onClose,
}: {
  problemId: string;
  onClose: () => void;
}) {
  const problem = getProblemById(problemId);
  const { getNote, saveNote, isSignedIn, getStatus } = useUserData();
  const { openProblem } = useProblemModal();
  const titleId = useId();
  // The parent mounts this component with `key={problemId}`, so React fully
  // remounts it per problem — the useState initializer below always picks up
  // the right note for the current problem with no sync effect needed.
  const [noteValue, setNoteValue] = useState(
    problem ? getNote(problem.slug) : "",
  );
  const [savedFlash, setSavedFlash] = useState(false);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!problem) return null;

  const links = problem.links || {};
  const hasLinks = PLATFORM_LINKS.some((cfg) => links[cfg.key]);
  const status = getStatus(problem.slug);

  const similar = (problem.similar_problems || []).map((title) => ({
    title,
    match: DATASET.problems.find((p) => p.title === title),
  }));
  const prereqs = (problem.prerequisites || []).map((title) => ({
    title,
    match: DATASET.problems.find((p) => p.title === title),
  }));

  function handleSaveNote() {
    saveNote(problem!.slug, noteValue);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-200 bg-bg-base/70 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-170 bg-bg-elevated border border-border-strong rounded-xl shadow-2xl flex flex-col max-h-[84vh]"
      >
        <div className="flex justify-between items-start gap-4 p-6 pb-4 border-b border-border-default shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex gap-2 items-center mb-3 flex-wrap">
              <DifficultyBadge difficulty={problem.difficulty} />
              <NeutralBadge>
                {problem.estimated_time_minutes ?? "—"} min
              </NeutralBadge>
              {problem.frequency && (
                <FrequencyBadge frequency={problem.frequency} />
              )}
            </div>
            <h2
              id={titleId}
              className="text-2xl font-bold tracking-tight text-text-primary"
            >
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 grid place-items-center rounded-md bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          <div className="rounded-2xl border border-border-default bg-bg-surface/80 px-4 py-3 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <StatusIcon slug={problem.slug} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-primary">
                  {status
                    ? `${status[0]}${status.slice(1).toLowerCase()}`
                    : "Mark progress"}
                </div>
                <div className="text-xs text-text-tertiary">
                  {isSignedIn
                    ? "Click the icon to cycle status"
                    : "Sign in to track progress"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="rounded-full border border-border-default bg-bg-elevated p-1.5 shadow-sm">
                  <BookmarkButton slug={problem.slug} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide font-semibold text-text-tertiary">
                Topic
              </span>
              <Link
                href={`/topics/${problem.topic_slug}`}
                className="text-sm font-mono text-accent hover:underline"
              >
                {problem.topic}
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide font-semibold text-text-tertiary">
                Subtopic
              </span>
              <span className="text-sm font-mono text-text-primary">
                {problem.subtopic}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Tags
            </div>
            <div className="flex gap-2 flex-wrap">
              {problem.tags.length ? (
                problem.tags.map((t) => <TagChip key={t}>{t}</TagChip>)
              ) : (
                <TagChip>—</TagChip>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Companies
            </div>
            <div className="flex gap-2 flex-wrap">
              {problem.companies.length ? (
                problem.companies.map((c) => (
                  <TagChip
                    key={c}
                    href={`/companies/${c.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {c}
                  </TagChip>
                ))
              ) : (
                <TagChip>—</TagChip>
              )}
            </div>
          </div>

          {problem.sheets.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Appears in Sheets
              </div>
              <div className="flex gap-2 flex-wrap">
                {problem.sheets.map((s) => (
                  <TagChip key={s} href={`/sheets/${s.toLowerCase()}`}>
                    {s}
                  </TagChip>
                ))}
              </div>
            </div>
          )}

          {prereqs.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Prerequisites
              </div>
              <div className="flex flex-col gap-1">
                {prereqs.map((pr) => (
                  <div
                    key={pr.title}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-bg-subtle"
                  >
                    <span>{pr.title}</span>
                    {pr.match && (
                      <button
                        onClick={() => openProblem(pr.match!.id)}
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        View →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Similar Problems
              </div>
              <div className="flex flex-col gap-1">
                {similar.map((sp) => (
                  <div
                    key={sp.title}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-bg-subtle"
                  >
                    <span>{sp.title}</span>
                    {sp.match && (
                      <button
                        onClick={() => openProblem(sp.match!.id)}
                        className="text-xs text-text-secondary hover:text-text-primary"
                      >
                        View →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasLinks && (
            <div>
              <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                Solve On
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORM_LINKS.map(({ key, label, Icon, accent }) => {
                  const url = links[key];
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border-default bg-bg-surface px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-border-focus hover:shadow-[0_12px_28px_-18px_rgba(0,0,0,0.55)]"
                    >
                      <span
                        className="grid h-10 w-10 place-items-center rounded-full border border-border-default bg-bg-elevated"
                        style={{ color: accent }}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-text-primary">
                          {label}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          Open the official practice page
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              My Notes
            </div>
            {isSignedIn ? (
              <>
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Jot down your approach, gotchas, or things to remember…"
                  className="w-full min-h-25 bg-bg-surface border border-border-default rounded-md p-3 text-sm text-text-primary placeholder:text-text-tertiary resize-y focus-visible:border-border-focus outline-none"
                />
                <div className="flex justify-end items-center gap-2 mt-2">
                  <span className="text-xs text-text-tertiary">
                    {savedFlash ? "Saved ✓" : "Synced to your account"}
                  </span>
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    Save note
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-bg-surface border border-border-default rounded-md text-sm text-text-tertiary text-center">
                <Link href="/sign-in" className="text-accent hover:underline">
                  Sign in
                </Link>{" "}
                to write and save notes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
