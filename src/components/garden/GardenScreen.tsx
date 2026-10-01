"use client";

import { Flower2, Leaf, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PlantGrowth } from "@/components/plant/PlantGrowth";
import { useI18n } from "@/lib/i18n";
import { MAX_PLANT_STAGE } from "@/lib/utils";

interface Achievement { id: string; name: string; description: string; unlockedAt: string; }
interface Progress { stage: number; careDays: number; minutes: number; completedSessions: number; growthPercent: number; achievements: Achievement[]; }

export function GardenScreen() {
  const { t } = useI18n();
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => { fetch("/api/plant").then((r) => r.json()).then(setProgress).catch(() => undefined); }, []);

  const stage = progress?.stage ?? 0;
  const nextTarget = useMemo(() => Math.min(MAX_PLANT_STAGE, stage + (stage < 3 ? 3 : stage < 6 ? 3 : 4)), [stage]);
  const nextNeed = Math.max(0, nextTarget - stage);

  if (!progress) return <main className="py-12 text-center text-sm text-ink-muted">{t("gardenLoading")}</main>;

  return <main className="space-y-6 py-5 pb-28">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">{t("gardenEyebrow")}</p>
      <h1 className="mt-1 font-serif text-4xl text-ink">{t("gardenTitle")}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("gardenSubtitle")}</p>
    </header>

    <section className="relative overflow-hidden rounded-[36px] bg-primary-soft px-4 py-6 text-center">
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/25 blur-2xl" />
      <PlantGrowth stage={stage} large />
      <div className="relative mt-2"><span className="rounded-full bg-surface/80 px-3 py-1 text-xs font-semibold text-primary-deep">{t("gardenStage", { stage: stage + 1, max: MAX_PLANT_STAGE + 1 })}</span><h2 className="mt-3 font-serif text-2xl text-ink">{t(stage >= 10 ? "gardenBlooming" : stage >= 6 ? "gardenGrowing" : stage >= 3 ? "gardenSprouting" : "gardenBeginning")}</h2></div>
    </section>

    <section className="grid grid-cols-3 gap-2">
      <Stat icon={<Leaf className="h-4 w-4" aria-hidden />} label={t("careDays")} value={progress.careDays} />
      <Stat icon={<Flower2 className="h-4 w-4" aria-hidden />} label={t("sessionsCount")} value={progress.completedSessions} />
      <Stat icon={<Sparkles className="h-4 w-4" aria-hidden />} label={t("minutes")} value={progress.minutes} />
    </section>

    <section className="rounded-[32px] bg-surface-muted p-5">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-ink">{t("achievementsTitle")}</h2><span className="text-xs font-semibold text-primary-deep">{progress.achievements.length}/4</span></div>
      <div className="mt-4 grid gap-2">
        {progress.achievements.length === 0 ? <p className="text-sm text-ink-muted">{t("achievementsEmpty")}</p> : progress.achievements.slice(0, 4).map((achievement) => <div key={achievement.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><Sparkles className="h-4 w-4" aria-hidden /></div><div><p className="text-sm font-medium text-ink">{achievement.name}</p><p className="text-xs text-ink-muted">{achievement.description}</p></div></div>)}
      </div>
    </section>

    <section className="rounded-[32px] bg-surface-muted p-5">
      <div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-ink">{t("nextBloom")}</h2><span className="text-xs font-semibold text-primary-deep">{progress.growthPercent}%</span></div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress.growthPercent}%` }} /></div>
      <p className="mt-3 text-sm text-ink-muted">{nextNeed ? t("nextBloomHint", { count: nextNeed }) : t("gardenComplete")}</p>
    </section>
  </main>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl bg-surface-muted p-3"><div className="text-primary-deep">{icon}</div><p className="mt-3 text-[11px] text-ink-muted">{label}</p><p className="mt-1 font-serif text-xl text-ink">{value}</p></div>;
}
