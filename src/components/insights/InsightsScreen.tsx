"use client";

import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock3, HeartPulse, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { translatedMood, useI18n } from "@/lib/i18n";

interface UsageData { [key: string]: number; }

interface InsightData {
  periodDays: number;
  totals: { checkins: number; sessions: number; workoutMinutes: number };
  averages: { energy: number; stress: number };
  deltas: { energy: number; stress: number };
  patterns: { stressHighDays: number; favoriteMood: Record<string, number> };
  impact: { avgStressDelta: number; avgEnergyDelta: number; measuredSessions: number; helpedSessions: number };
  sessions: Array<{ id: string; dayKey: string; mood: string; durationSeconds: number; beforeStress: number; afterStress: number | null; beforeEnergy: number; afterEnergy: number | null }>;
  series: Array<{ dayKey: string; energy: number; stress: number }>;
}

export function InsightsScreen() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<InsightData | null>(null);
  const [range, setRange] = useState(30);
  const [goal, setGoal] = useState<{ type: string; target: number } | null>(null);
  const [goalBusy, setGoalBusy] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "insights_opened" }) }).catch(() => undefined);
    fetch(`/api/insights?days=${range}`).then((response) => response.json()).then(setData).catch(() => setData(null));
    fetch("/api/goals").then((response) => response.json()).then((value) => setGoal(value.goals?.[0] ?? null)).catch(() => undefined);
    fetch("/api/analytics").then((response) => response.json()).then((value) => setUsage(value.events ?? null)).catch(() => undefined);
  }, [range]);

  const favoriteMood = useMemo(() => {
    if (!data) return null;
    return Object.entries(data.patterns.favoriteMood).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [data]);

  if (!data) {
    return <main className="py-12 text-center text-sm text-ink-muted">{t("insightsLoading")}</main>;
  }

  const deltaCopy = (value: number, positive: boolean) => {
    if (!value) return t("insightsStable");
    const good = positive ? value > 0 : value < 0;
    return `${good ? "↑" : "↓"} ${Math.abs(value).toFixed(1)}`;
  };

  return (
    <main className="space-y-6 py-5 pb-28">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">{t("insightsEyebrow")}</p>
        <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{t("insightsTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("insightsSubtitle")}</p>
      </header>

      <div className="flex rounded-2xl bg-surface-muted p-1">
        {[7, 30, 90].map((value) => (
          <button key={value} type="button" onClick={() => setRange(value)} className={`min-h-11 flex-1 rounded-xl text-xs font-semibold ${range === value ? "bg-surface text-ink shadow-sm" : "text-ink-muted"}`}>{value} {t("days")}</button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-primary-soft p-4"><Clock3 className="h-5 w-5 text-primary-deep" aria-hidden /><p className="mt-4 text-xs text-ink-muted">{t("movementMinutes")}</p><p className="mt-1 font-serif text-3xl text-ink">{data.totals.workoutMinutes}</p></div>
        <div className="rounded-3xl bg-accent-soft p-4"><HeartPulse className="h-5 w-5 text-bloom" aria-hidden /><p className="mt-4 text-xs text-ink-muted">{t("sessionsCount")}</p><p className="mt-1 font-serif text-3xl text-ink">{data.totals.sessions}</p></div>
      </section>

      {usage && <section className="rounded-[30px] bg-surface-muted p-5">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary-deep" aria-hidden /><h2 className="font-serif text-2xl text-ink">{t("bloomRhythm")}</h2></div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface p-3"><p className="text-xs text-ink-muted">{t("completedSessions")}</p><p className="mt-1 font-serif text-2xl text-ink">{usage.session_completed ?? 0}</p></div>
          <div className="rounded-2xl bg-surface p-3"><p className="text-xs text-ink-muted">Coach</p><p className="mt-1 font-serif text-2xl text-ink">{usage.coach_message_sent ?? 0}</p></div>
          <div className="rounded-2xl bg-surface p-3"><p className="text-xs text-ink-muted">{t("soundscapesShort")}</p><p className="mt-1 font-serif text-2xl text-ink">{usage.soundscape_started ?? 0}</p></div>
        </div>
      </section>}

      <section className="rounded-[30px] bg-surface-muted p-5">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-bloom" aria-hidden /><h2 className="font-serif text-2xl text-ink">{t("impactTitle")}</h2></div>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("impactSubtitle")}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface p-3"><p className="text-xs text-ink-muted">{t("stressChange")}</p><p className={`mt-1 font-serif text-2xl ${data.impact.avgStressDelta < 0 ? "text-primary-deep" : "text-bloom"}`}>{data.impact.avgStressDelta > 0 ? "+" : ""}{data.impact.avgStressDelta.toFixed(1)}</p></div>
          <div className="rounded-2xl bg-surface p-3"><p className="text-xs text-ink-muted">{t("energyChange")}</p><p className={`mt-1 font-serif text-2xl ${data.impact.avgEnergyDelta > 0 ? "text-primary-deep" : "text-bloom"}`}>{data.impact.avgEnergyDelta > 0 ? "+" : ""}{data.impact.avgEnergyDelta.toFixed(1)}</p></div>
        </div>
        <p className="mt-3 text-xs text-ink-muted">{t("helpedSessions", { count: data.impact.helpedSessions, total: data.impact.measuredSessions })}</p>
      </section>

      <section className="rounded-[32px] bg-ink p-5 text-surface">
        <div className="flex items-center gap-2 text-primary-soft"><Sparkles className="h-4 w-4" aria-hidden /><span className="text-xs font-semibold uppercase tracking-[0.15em]">{t("patternsTitle")}</span></div>
        <h2 className="mt-3 font-serif text-2xl">{t("patternsHeadline")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-surface/70">
          {favoriteMood ? t("patternsFavoriteMood", { mood: translatedMood(favoriteMood, locale, t) }) : t("patternsNoMood")}
          {" "}{t("patternsHighStress", { count: data.patterns.stressHighDays })}
        </p>
      </section>

      <section className="rounded-[32px] bg-surface-muted p-5">
        <div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-ink">{t("signalsTitle")}</h2><CalendarDays className="h-5 w-5 text-primary-deep" aria-hidden /></div>
        <div className="mt-5 space-y-5">
          <InsightRow label={t("energy")} value={data.averages.energy} delta={deltaCopy(data.deltas.energy, true)} tone="primary" />
          <InsightRow label={t("stress")} value={data.averages.stress} delta={deltaCopy(data.deltas.stress, false)} tone="bloom" />
        </div>
      </section>

      <section className="rounded-[32px] bg-surface-muted p-5">
        <div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-ink">{t("goalTitle")}</h2><span className="text-xs text-ink-muted">{goal ? `${goal.target}` : "—"}</span></div>
        <p className="mt-2 text-sm text-ink-muted">{t("goalSubtitle")}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[{ type: "consistency", label: t("goalConsistency") }, { type: "movement", label: t("goalMovement") }, { type: "stress", label: t("goalStress") }, { type: "energy", label: t("goalEnergy") }].map((item) => <button key={item.type} type="button" disabled={goalBusy} onClick={async () => { setGoalBusy(true); try { const response = await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: item.type, target: item.type === "movement" ? 3 : item.type === "consistency" ? 4 : 3 }) }); if (response.ok) { const value = await response.json(); setGoal(value.goal); } } finally { setGoalBusy(false); } }} className={`min-h-12 rounded-2xl text-sm font-medium ${goal?.type === item.type ? "bg-primary text-surface" : "bg-surface text-ink"}`}>{item.label}</button>)}
        </div>
      </section>

      <section className="rounded-[32px] bg-surface-muted p-5">
        <h2 className="font-serif text-2xl text-ink">{t("recentSessions")}</h2>
        <div className="mt-4 space-y-2">
          {data.sessions.length === 0 ? <p className="text-sm text-ink-muted">{t("noSessionsYet")}</p> : data.sessions.slice(0, 5).map((session) => {
            const afterStress = session.afterStress ?? session.beforeStress;
            const change = Math.round((afterStress - session.beforeStress) * 10) / 10;
            return <div key={session.id} className="flex items-center justify-between rounded-2xl bg-surface p-3 ring-1 ring-black/5">
              <div><p className="text-sm font-medium text-ink">{translatedMood(session.mood, locale, t)}</p><p className="mt-1 text-xs text-ink-muted">{session.dayKey} · {Math.round(session.durationSeconds / 60)} {t("minutes")}</p></div>
              <span className="flex items-center gap-1 text-xs text-ink-muted">{change < 0 ? <ArrowDownRight className="h-4 w-4 text-primary-deep" aria-hidden /> : change > 0 ? <ArrowUpRight className="h-4 w-4 text-bloom" aria-hidden /> : null}{Math.abs(change).toFixed(1)}</span>
            </div>;
          })}
        </div>
      </section>
    </main>
  );
}

function InsightRow({ label, value, delta, tone }: { label: string; value: number; delta: string; tone: "primary" | "bloom" }) {
  return <div><div className="flex items-center justify-between text-sm"><span className="text-ink-muted">{label}</span><span className="font-semibold text-ink">{value || 0}/5</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface"><div className={`h-full rounded-full ${tone === "primary" ? "bg-primary" : "bg-bloom"}`} style={{ width: `${Math.min(100, (value || 0) * 20)}%` }} /></div><p className="mt-1 text-xs text-ink-muted">{delta}</p></div>;
}
