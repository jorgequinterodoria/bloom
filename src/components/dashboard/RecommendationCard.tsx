"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Recommendation = {
  titleKey: "recommendRelease" | "recommendMinimum" | "recommendEnergy" | "recommendBalance";
  descriptionKey: "recommendReleaseDesc" | "recommendMinimumDesc" | "recommendEnergyDesc" | "recommendBalanceDesc";
  reasonKey: "reasonStressTrend" | "reasonStress" | "reasonEnergyTrend" | "reasonEnergy" | "reasonGoodEnergy" | "reasonBalance";
  duration: number;
  intensity: "gentle" | "moderate" | "activating";
  mood: string;
};

export function RecommendationCard({ recommendation, onStart }: { recommendation: Recommendation; onStart: () => void }) {
  const { t } = useI18n();
  return (
    <section className="overflow-hidden rounded-[32px] bg-ink px-5 py-5 text-surface shadow-[0_24px_60px_-30px_rgba(20,25,20,.65)]">
      <div className="flex items-center gap-2 text-primary-soft">
        <Sparkles className="h-4 w-4" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{t("todayRecommendation")}</span>
      </div>
      <div className="mt-4">
        <h2 className="font-serif text-3xl leading-tight">{t(recommendation.titleKey)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-surface/75">{t(recommendation.descriptionKey)}</p>
      </div>
      <div className="mt-4 rounded-2xl bg-white/8 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-surface/55">{t("whyToday")}</p>
        <p className="mt-1 text-sm text-surface/90">{t(recommendation.reasonKey)}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-surface/70">
          <span>{recommendation.duration} {t("minutes")}</span>
          <span aria-hidden>•</span>
          <span>{t(`intensity${recommendation.intensity.charAt(0).toUpperCase()}${recommendation.intensity.slice(1)}`)}</span>
        </div>
        <button type="button" onClick={onStart} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-surface px-5 text-sm font-semibold text-ink transition hover:-translate-y-0.5">
          {t("startSession")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
}
