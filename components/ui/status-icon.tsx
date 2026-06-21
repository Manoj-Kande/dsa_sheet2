"use client";

import { Check, Minus, RotateCcw } from "lucide-react";
import { useUserData } from "@/lib/hooks/use-user-data";

const STATUS_CONFIG = {
  SOLVED: { icon: Check, className: "bg-solved border-solved text-bg-base" },
  ATTEMPTED: { icon: Minus, className: "bg-transparent border-attempted text-attempted" },
  REVISIT: { icon: RotateCcw, className: "bg-transparent border-revisit text-revisit" },
};

export function StatusIcon({ slug, size = "md" }: { slug: string; size?: "sm" | "md" }) {
  const { getStatus, cycleStatus, isSignedIn } = useUserData();
  const status = getStatus(slug);
  const config = status ? STATUS_CONFIG[status] : null;
  const Icon = config?.icon;

  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!isSignedIn) {
          window.location.href = "/sign-in";
          return;
        }
        cycleStatus(slug);
      }}
      aria-label={status ? `Status: ${status.toLowerCase()} — click to change` : "Mark progress"}
      title={
        isSignedIn
          ? status
            ? `${status[0]}${status.slice(1).toLowerCase()} — click to cycle`
            : "Unseen — click to cycle"
          : "Sign in to track progress"
      }
      className={`grid place-items-center rounded-full border-[1.5px] transition-colors flex-shrink-0 ${sizeClasses} ${
        config ? config.className : "border-border-strong hover:border-accent bg-transparent"
      }`}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={3} />}
    </button>
  );
}
