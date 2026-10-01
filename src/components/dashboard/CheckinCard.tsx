"use client";

import { HeartPulse } from "lucide-react";
import { MoodButtons } from "@/components/mood/MoodButtons";
import { useI18n } from "@/lib/i18n";
import type { MoodName } from "@/lib/constants";

export function CheckinCard({ energy, stress, note, busy, onEnergy, onStress, onNote, onMood }: {
  energy: number;
  stress: number;
  note: string;
  busy: boolean;
  onEnergy: (value: number) => void;
  onStress: (value: number) => void;
  onNote: (value: string) => void;
  onMood: (mood: MoodName) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="space-y-5 rounded-[32px] bg-surface-muted p-5 ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
          <HeartPulse className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">{t("checkinLabel")}</p>
          <h2 className="font-serif text-2xl text-ink">{t("checkinQuestion")}</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          [t("energy"), energy, onEnergy],
          [t("stress"), stress, onStress],
        ].map(([label, value, setter]) => (
          <label key={String(label)} className="rounded-2xl bg-surface p-3">
            <span className="flex items-center justify-between text-xs font-medium text-ink-muted">
              <span>{String(label)}</span>
              <span className="text-ink">{String(value)}/5</span>
            </span>
            <input className="mt-3 w-full accent-[var(--color-primary)]" type="range" min={1} max={5} value={Number(value)} onChange={(event) => (setter as (n: number) => void)(Number(event.target.value))} />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="text-xs font-medium text-ink-muted">{t("journalPrompt")}</span>
        <textarea value={note} onChange={(event) => onNote(event.target.value)} rows={2} maxLength={500} placeholder={t("notePlaceholder")} className="mt-2 w-full rounded-2xl border-0 bg-surface p-3 text-sm text-ink outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary" />
      </label>

      <MoodButtons weekend={false} onSelect={onMood} onRide={() => undefined} disabled={busy} />
    </section>
  );
}
