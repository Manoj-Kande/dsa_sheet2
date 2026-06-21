"use client";

import type { ComponentType } from "react";
import {
  SiCodingninjas,
  SiGeeksforgeeks,
  SiHackerrank,
  SiLeetcode,
} from "react-icons/si";
import { Problem } from "@/lib/data/dataset";

const LINK_CONFIG: {
  key: keyof Problem["links"];
  label: string;
  Icon: ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  {
    key: "leetcode",
    label: "Solve on LeetCode",
    Icon: SiLeetcode,
    accent: "#FFA116",
  },
  {
    key: "geeksforgeeks",
    label: "Solve on GeeksforGeeks",
    Icon: SiGeeksforgeeks,
    accent: "#2F8D46",
  },
  {
    key: "codingninjas",
    label: "Solve on Coding Ninjas",
    Icon: SiCodingninjas,
    accent: "#FF3E6C",
  },
  {
    key: "hackerrank",
    label: "Solve on HackerRank",
    Icon: SiHackerrank,
    accent: "#2EC866",
  },
];

/**
 * Inline row of platform link icons for a problem — lets users jump
 * straight to LeetCode/GfG/etc. from the table without opening the modal.
 * Only renders icons for links that actually exist on this problem.
 */
export function QuickLinks({ problem }: { problem: Problem }) {
  const available = LINK_CONFIG.filter((cfg) => problem.links?.[cfg.key]);
  if (available.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {available.map(({ key, label, Icon, accent }) => (
        <a
          key={key}
          href={problem.links[key]!}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={label}
          title={label}
          className="grid place-items-center w-8 h-8 rounded-lg border border-border-default bg-bg-surface text-text-tertiary shadow-sm transition-all hover:-translate-y-px hover:border-border-focus hover:bg-bg-elevated"
          style={{ color: accent }}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}

export type PlatformLinkMeta = (typeof LINK_CONFIG)[number];

export const PLATFORM_LINKS = LINK_CONFIG;
