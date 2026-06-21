"use client";

import { useState } from "react";

/**
 * Maps the dataset's company display names to a domain (for logo lookup)
 * and a stable fallback color.
 *
 * The favicon endpoint is intentionally lightweight and more reliable than
 * the previous logo service for the brands in this dataset.
 */
const COMPANY_META: Record<string, { domain: string; color: string }> = {
  Amazon: { domain: "amazon.com", color: "#FF9900" },
  Microsoft: { domain: "microsoft.com", color: "#00A4EF" },
  Google: { domain: "google.com", color: "#4285F4" },
  Meta: { domain: "meta.com", color: "#0866FF" },
  Adobe: { domain: "adobe.com", color: "#FF0000" },
  Apple: { domain: "apple.com", color: "#A3AAAE" },
  Bloomberg: { domain: "bloomberg.com", color: "#000000" },
  "Goldman Sachs": { domain: "goldmansachs.com", color: "#7399C6" },
  LinkedIn: { domain: "linkedin.com", color: "#0A66C2" },
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Small circular company badge. Tries to load a brand favicon from a public
 * endpoint and falls back to a colored initials badge if the image fails.
 */
export function CompanyBadge({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const meta = COMPANY_META[name];
  const [imgFailed, setImgFailed] = useState(!meta);

  const dimension = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  const textSize = size === "sm" ? "text-[8px]" : "text-[10px]";

  if (imgFailed || !meta) {
    return (
      <span
        title={name}
        className={`${dimension} ${textSize} shrink-0 rounded-full grid place-items-center font-bold text-white`}
        style={{ backgroundColor: meta?.color ?? "#52525B" }}
      >
        {initialsFor(name)}
      </span>
    );
  }

  return (
    // Using a plain <img> keeps this badge fast and avoids any image
    // optimization constraints for a tiny remote favicon.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${meta.domain}&sz=64`}
      alt={name}
      title={name}
      width={size === "sm" ? 20 : 28}
      height={size === "sm" ? 20 : 28}
      className={`${dimension} shrink-0 rounded-full bg-white object-contain p-0.5`}
      onError={() => setImgFailed(true)}
    />
  );
}

/** Row of company badges, capped with a "+N" overflow indicator. */
export function CompanyBadgeRow({
  companies,
  max = 3,
}: {
  companies: string[];
  max?: number;
}) {
  if (companies.length === 0) return null;
  const visible = companies.slice(0, max);
  const overflow = companies.length - visible.length;

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((c) => (
        <div key={c} className="ring-2 ring-bg-surface rounded-full">
          <CompanyBadge name={c} />
        </div>
      ))}
      {overflow > 0 && (
        <span className="w-5 h-5 text-[8px] shrink-0 rounded-full grid place-items-center font-bold bg-bg-elevated text-text-tertiary ring-2 ring-bg-surface">
          +{overflow}
        </span>
      )}
    </div>
  );
}
