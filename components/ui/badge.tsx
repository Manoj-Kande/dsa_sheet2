import { Difficulty, Frequency } from "@/lib/data/dataset";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-easy bg-[var(--color-easy-bg)]",
  Medium: "text-medium bg-[var(--color-medium-bg)]",
  Hard: "text-hard bg-[var(--color-hard-bg)]",
};

const DIFFICULTY_OUTLINE_STYLES: Record<Difficulty, string> = {
  Easy: "text-easy border-easy/40",
  Medium: "text-medium border-medium/40",
  Hard: "text-hard border-hard/40",
};

export function DifficultyBadge({
  difficulty,
  variant = "filled",
}: {
  difficulty: Difficulty;
  variant?: "filled" | "outline";
}) {
  if (variant === "outline") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${DIFFICULTY_OUTLINE_STYLES[difficulty]}`}
      >
        {difficulty}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mono font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

const FREQUENCY_STYLES: Record<string, string> = {
  "Very High": "text-hard bg-hard/10",
  High: "text-orange-400 bg-orange-400/10",
  Medium: "text-medium bg-medium/10",
  Low: "text-text-tertiary bg-text-tertiary/10",
};

export function FrequencyBadge({ frequency }: { frequency: Frequency | string | null }) {
  if (!frequency) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        FREQUENCY_STYLES[frequency] || "text-text-secondary bg-bg-subtle"
      }`}
    >
      {frequency} frequency
    </span>
  );
}

export function NeutralBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-text-secondary bg-bg-subtle">
      {children}
    </span>
  );
}

export function TagChip({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  const className =
    "inline-flex items-center rounded-full border border-border-default bg-bg-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent";
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <span className={className}>{children}</span>;
}
