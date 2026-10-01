"use client";

import { MOODS, WEEKEND_ICON, type MoodName } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

interface Props {
  weekend: boolean;
  onSelect: (mood: MoodName) => void;
  onRide: () => void;
  disabled?: boolean;
}

export function MoodButtons({ weekend, onSelect, onRide, disabled }: Props) {
  const { t } = useI18n();
  if (weekend) {
    const Bike = WEEKEND_ICON;
    const ideas = [
      { label: t("shortWalk"), detail: t("freshAir") },
      { label: t("easyBike"), detail: t("steadyMovement") },
      { label: t("activeRest"), detail: t("unhurriedWalk") },
    ];

    return (
      <section aria-label={t("weekendAria")} className="space-y-4 rounded-3xl bg-accent-soft p-6">
        <div className="flex items-center gap-3">
          <Bike className="h-6 w-6 text-bloom" aria-hidden />
          <h2 className="font-serif text-xl text-ink">{t("weekend")}</h2>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">
          {t("weekendIntro")}
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
          {t("recordRide")}
        </button>
      </section>
    );
  }

  return (
    <section aria-label={t("moodAria")} className="grid grid-cols-2 gap-3">
      {MOODS.map((mood) => {
        const Icon = mood.icon;
        const moodText = mood.name === "Estresada" ? [t("moodStressed"), t("moodStressedHint")]
          : mood.name === "Ansiosa" ? [t("moodAnxious"), t("moodAnxiousHint")]
            : mood.name === "Energética" ? [t("moodEnergetic"), t("moodEnergeticHint")]
              : [t("moodUnmotivated"), t("moodUnmotivatedHint")];
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
              <span className="block font-medium">{moodText[0]}</span>
              <span className="block text-xs text-ink">{moodText[1]}</span>
            </span>
          </button>
        );
      })}
    </section>
  );
}
