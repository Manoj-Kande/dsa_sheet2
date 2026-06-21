import { DATASET } from "@/lib/data/dataset";
import { AppShell } from "@/components/shared/app-shell";
import { CompanyCard } from "@/components/shared/cards";

export default function CompaniesPage() {
  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="font-mono text-xs uppercase tracking-wide text-accent mb-2">Targeted Prep</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Companies</h1>
          <p className="text-text-secondary max-w-[640px]">
            Problems tagged by the companies that ask them most, with frequency data to help you prioritize.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATASET.companies.map((c) => (
            <CompanyCard key={c.slug} company={c} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
