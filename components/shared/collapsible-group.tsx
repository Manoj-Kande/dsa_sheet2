"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapsible section used to group problems under a subtopic heading
 * (chevron toggle + title + optional description + progress bar/count).
 * Defaults to open; collapsing is purely a display preference, no problems
 * are unmounted from the DOM tree's data — just visually hidden.
 */
export function CollapsibleGroup({
  title,
  description,
  solved,
  total,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  solved?: number;
  total: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = total > 0 && solved !== undefined ? Math.round((solved / total) * 100) : 0;
  const showProgress = solved !== undefined;

  return (
    <div className="border border-border-default rounded-xl overflow-hidden bg-bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-elevated transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-text-tertiary transition-transform duration-200 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">{title}</span>
          </div>
          {description && (
            <p className="text-xs text-text-tertiary mt-0.5 truncate">{description}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs font-mono text-text-tertiary whitespace-nowrap">
            {showProgress ? `${solved}/${total}` : `${total} problems`}
          </span>
          {showProgress && (
            <div className="hidden sm:block w-24 h-1.5 rounded-full bg-bg-subtle overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </button>
      {open && <div className="border-t border-border-default">{children}</div>}
    </div>
  );
}
