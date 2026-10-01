import { Suspense } from "react";
import { LocalizedMessage } from "@/lib/i18n";
import { WorkoutPlayer } from "@/components/workout/WorkoutPlayer";

export default function MovePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <LocalizedMessage messageKey="movementReady" className="text-ink-subtle" />
        </main>
      }
    >
      <WorkoutPlayer />
    </Suspense>
  );
}
