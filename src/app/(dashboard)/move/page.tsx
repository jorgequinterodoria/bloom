import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkoutPlayer } from "@/components/workout/WorkoutPlayer";

export const metadata: Metadata = {
  title: "Movimiento suave",
  description: "Un flujo corto y tranquilo para tu ánimo de hoy.",
};

export default function MovePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-ink-subtle">Preparando tu movimiento…</p>
        </main>
      }
    >
      <WorkoutPlayer />
    </Suspense>
  );
}
