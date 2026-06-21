import { AppShell } from "@/components/shared/app-shell";
import { DailyTargetStudio } from "@/components/shared/daily-target-studio";

export default function DailyTargetPage() {
  return (
    <AppShell>
      <div className="max-w-350 mx-auto px-6 py-8">
        <DailyTargetStudio />
      </div>
    </AppShell>
  );
}
