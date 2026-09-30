"use client";

import { MOODS, WEEKEND_ICON, type MoodName } from "@/lib/constants";

interface Props {
  weekend: boolean;
  onSelect: (mood: MoodName) => void;
  onRide: () => void;
  disabled?: boolean;
}

export function MoodButtons({ weekend, onSelect, onRide, disabled }: Props) {
  if (weekend) {
    const Bike = WEEKEND_ICON;
    const ideas = [
      { label: "Paseo corto", detail: "10–15 min con aire libre" },
      { label: "Bici suave", detail: "Movimiento tranquilo y constante" },
      { label: "Descanso activo", detail: "Caminar sin prisa y respirar" },
    ];

    return (
      <section aria-label="Fin de semana" className="space-y-4 rounded-3xl bg-accent-soft p-6">
        <div className="flex items-center gap-3">
          <Bike className="h-6 w-6 text-bloom" aria-hidden />
          <h2 className="font-serif text-xl text-ink">Fin de semana</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          Un paseo al aire libre también hace crecer tu planta. Elige la forma que mejor te siente.
        </p>

        <div className="space-y-2">
          {ideas.map((idea) => (
            <button
              key={idea.label}
              type="button"
              onClick={onRide}
              disabled={disabled}
              className="flex w-full items-center justify-between rounded-2xl bg-surface px-3 py-3 text-left text-sm text-ink disabled:opacity-60"
            >
              <div>
                <span className="block font-medium">{idea.label}</span>
                <span className="block text-xs text-ink-muted">{idea.detail}</span>
              </div>
              <span aria-hidden className="text-lg text-bloom">→</span>
            </button>
          ))}
        </div>

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
              <span className="block text-xs text-ink">{mood.hint}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
