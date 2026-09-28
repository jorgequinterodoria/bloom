"use client";

import { MOODS, WEEKEND_ICON } from "@/lib/constants";

interface Props {
  weekend: boolean;
  onSelect: (mood: string) => void;
  onRide: () => void;
  disabled?: boolean;
}

export function MoodButtons({ weekend, onSelect, onRide, disabled }: Props) {
  if (weekend) {
    const Bike = WEEKEND_ICON;
    return (
      <section className="space-y-4 rounded-3xl bg-accent-soft p-6">
        <div className="flex items-center gap-3">
          <Bike className="h-6 w-6 text-bloom" aria-hidden />
          <h2 className="font-serif text-xl text-ink">Fin de semana</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          Un paseo al aire libre también hace crecer tu planta.
        </p>
        <button
          type="button"
          onClick={onRide}
          disabled={disabled}
          className="min-h-12 w-full rounded-2xl bg-primary px-6 font-medium text-surface disabled:opacity-60"
        >
          Registrar paseo del fin de semana
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Registro de ánimo" className="grid grid-cols-2 gap-3">
      {MOODS.map((mood) => {
        const Icon = mood.icon;
        return (
          <button
            key={mood.name}
            type="button"
            onClick={() => onSelect(mood.name)}
            disabled={disabled}
            className="flex min-h-24 flex-col items-start justify-between rounded-3xl bg-primary-soft p-4 text-left text-ink transition hover:bg-sage-300 disabled:opacity-60"
          >
            <Icon className="h-6 w-6 text-primary-deep" aria-hidden />
            <span>
              <span className="block font-medium">{mood.label}</span>
              <span className="block text-xs text-ink-muted">{mood.hint}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
