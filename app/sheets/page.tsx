"use client";

import { DATASET, getProblemsBySheet } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { SheetCard } from "@/components/shared/cards";
import { useUserData } from "@/lib/hooks/use-user-data";

export default function SheetsPage() {
  const { progress, isSignedIn } = useUserData();

  function sheetSolved(name: string) {
    if (!isSignedIn) return 0;
    return getProblemsBySheet(name).filter((p) => progress[p.slug] === "SOLVED").length;
  }

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Curated Lists</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Sheets</h1>
          <p className="text-text-secondary max-w-[640px]">
            Battle-tested problem sets from the community — pick one and follow it end-to-end.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATASET.sheets.map((s) => (
            <SheetCard key={s.slug} sheet={s} solved={sheetSolved(s.name)} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
