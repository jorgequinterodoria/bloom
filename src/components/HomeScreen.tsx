"use client";

import { Bell, CalendarHeart, Heart, Sparkles, SunMedium, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MoodButtons } from "@/components/mood/MoodButtons";
import { PlantGrowth } from "@/components/plant/PlantGrowth";
import { SOSModal } from "@/components/sos/SOSModal";
import { translatedMood, useI18n } from "@/lib/i18n";
import { isWeekendDay, todayKey } from "@/lib/utils";

interface DayLog {
  checkedIn: boolean;
  workoutDone: boolean;
  weekendRide: boolean;
}

interface HistoryEntry {
  date: string;
  mood: string;
  energy: number;
  stress: number;
  note: string;
}

const HISTORY_KEY = "bloom-history";
const ONBOARDING_KEY = "bloom-onboarded";

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function getStreak(entries: HistoryEntry[]) {
  if (!entries.length) return 0;
  const unique = new Set(entries.map((entry) => entry.date));
  const cursor = new Date();
  let streak = 0;

  while (true) {
    const key = todayKey(cursor);
    if (!unique.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildWeeklySummary(entries: HistoryEntry[], locale: string, noRecord: string) {
  const dateLocale = { es: "es-ES", fr: "fr-FR", pt: "pt-BR", en: "en-US", it: "it-IT" }[locale] ?? "es-ES";
  const points = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = todayKey(date);
    const match = entries.find((entry) => entry.date === key);
    return {
      label: new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(date),
      key,
      mood: match?.mood ?? noRecord,
      energy: match?.energy ?? 0,
      stress: match?.stress ?? 0,
    };
  });

  const energyValues = points.map((point) => point.energy).filter((value) => value > 0);
  const stressValues = points.map((point) => point.stress).filter((value) => value > 0);

  return {
    points,
    streak: getStreak(entries),
    avgEnergy: energyValues.length ? Math.round((energyValues.reduce((a, b) => a + b, 0) / energyValues.length) * 10) / 10 : 0,
    avgStress: stressValues.length ? Math.round((stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10) / 10 : 0,
    bestDay: points.filter((point) => point.mood !== noRecord).slice(-1)[0]?.mood ?? noRecord,
  };
}

function buildMonthlySummary(entries: HistoryEntry[], noData: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDays = monthEnd.getDate();
  const monthEntries = entries.filter((entry) => {
    const value = new Date(`${entry.date}T00:00:00`);
    return value >= monthStart && value <= monthEnd;
  });

  const energyValues = monthEntries.map((entry) => entry.energy).filter((value) => value > 0);
  const stressValues = monthEntries.map((entry) => entry.stress).filter((value) => value > 0);
  const moodCounts = new Map<string, number>();

  monthEntries.forEach((entry) => {
    if (entry.mood === "Sin registro") return;
    moodCounts.set(entry.mood, (moodCounts.get(entry.mood) ?? 0) + 1);
  });

  const bestMood = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const completionRate = totalDays ? Math.min(100, Math.round((monthEntries.length / totalDays) * 100)) : 0;

  return {
    totalDays,
    completed: monthEntries.length,
    completionRate,
    avgEnergy: energyValues.length ? Math.round((energyValues.reduce((a, b) => a + b, 0) / energyValues.length) * 10) / 10 : 0,
    avgStress: stressValues.length ? Math.round((stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10) / 10 : 0,
    bestMood: bestMood ? bestMood[0] : noData,
  };
}

export default function HomeScreen() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [weekend, setWeekend] = useState(false);
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState<DayLog | null>(null);
  const [logError, setLogError] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState("");

  const loadLog = useCallback(() => {
    setLogError(false);
    fetch(`/api/log?day=${todayKey()}`)
      .then((r) => {
        if (!r.ok) throw new Error("log fetch failed");
        return r.json();
      })
      .then((d) => {
        setLog(d);
        if (typeof d?.energy === "number") setEnergy(d.energy);
        if (typeof d?.stress === "number") setStress(d.stress);
        if (typeof d?.note === "string") setNote(d.note);
      })
      .catch(() => setLogError(true));
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/history?days=7");
      if (!response.ok) throw new Error("history fetch failed");
      const data = await response.json();
      if (Array.isArray(data?.history)) {
        setHistory(data.history);
        return;
      }
    } catch {
      // fallback local para usuarios sin backend persistente aún
    }

    setHistory(readHistory());
  }, []);

  useEffect(() => {
    loadHistory();
    if (typeof window !== "undefined" && !window.localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
      window.localStorage.setItem(ONBOARDING_KEY, "1");
    }
  }, [loadHistory]);

  useEffect(() => {
    setWeekend(isWeekendDay(new Date()));
    fetch("/api/plant")
      .then((r) => {
        if (!r.ok) throw new Error("plant fetch failed");
        return r.json();
      })
      .then((d) => typeof d.stage === "number" && setStage(d.stage))
      .catch(() => { });
    loadLog();
  }, [loadLog]);

  useEffect(() => {
    if (!sosOpen) return;
    fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: todayKey() }),
    }).catch(() => { });
  }, [sosOpen]);

  const persistTodayEntry = useCallback((mood: string) => {
    const nextEntry: HistoryEntry = {
      date: todayKey(),
      mood,
      energy,
      stress,
      note,
    };

    setHistory((previous) => {
      const filtered = previous.filter((entry) => entry.date !== nextEntry.date);
      const next = [...filtered, nextEntry].sort((a, b) => a.date.localeCompare(b.date));
      writeHistory(next);
      return next;
    });
  }, [energy, note, stress]);

  const weeklySummary = useMemo(() => buildWeeklySummary(history, locale, t("noRecord")), [history, locale, t]);
  const monthlySummary = useMemo(() => buildMonthlySummary(history, t("noData")), [history, t]);

  const reminderText = useMemo(() => {
    if (weeklySummary.streak >= 3) return t("reminderStreak");
    if (weeklySummary.avgStress >= 4) return t("reminderStress");
    return t("reminderPause");
  }, [t, weeklySummary.avgStress, weeklySummary.streak]);

  const notifications = useMemo(() => {
    const items: { title: string; body: string; tone: "good" | "warn" }[] = [];

    if (weeklySummary.streak >= 3) {
      items.push({ title: t("consistency"), body: t("streakMessage"), tone: "good" });
    }

    if (monthlySummary.completionRate >= 60) {
      items.push({ title: t("monthlyGoal"), body: t("monthComplete", { rate: monthlySummary.completionRate }), tone: "good" });
    } else {
      items.push({ title: t("usefulHint"), body: t("gentleMovement"), tone: "warn" });
    }

    if (weeklySummary.avgStress >= 4) {
      items.push({ title: t("highLoad"), body: t("highStressMessage"), tone: "warn" });
    }

    return items.slice(0, 3);
  }, [monthlySummary.completionRate, t, weeklySummary.avgStress, weeklySummary.streak]);

  const goalCards = useMemo(() => {
    const cards: Array<{ label: string; ok: boolean; detail: string }> = [];

    if (weeklySummary.streak >= 3) {
      cards.push({ label: t("solidStreak"), ok: true, detail: t("severalDays") });
    } else {
      cards.push({ label: t("streak"), ok: false, detail: t("startStreak") });
    }

    if (weeklySummary.avgEnergy >= 3) {
      cards.push({ label: t("stableEnergy"), ok: true, detail: t("energyGood") });
    } else {
      cards.push({ label: t("recharge"), ok: false, detail: t("energyRest") });
    }

    if (weeklySummary.avgStress <= 3) {
      cards.push({ label: t("controlledLoad"), ok: true, detail: t("stressReduced") });
    } else {
      cards.push({ label: t("breathe"), ok: false, detail: t("stressRelease") });
    }

    return cards.slice(0, 3);
  }, [t, weeklySummary.avgEnergy, weeklySummary.avgStress, weeklySummary.streak]);

  const handleMood = useCallback(
    async (mood: string) => {
      setBusy(true);
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, day: todayKey(), energy, stress, note }),
        });
        if (!res.ok) throw new Error("checkin failed");
        const data = await res.json();
        if (typeof data.stage === "number") setStage(data.stage);
        persistTodayEntry(mood);
        setLog((prev) => ({ ...(prev ?? { checkedIn: false, workoutDone: false, weekendRide: false }), checkedIn: true }));
        router.push(`/move?mood=${encodeURIComponent(mood)}`);
      } catch {
        // fallo de red: nos quedamos en casa
      } finally {
        setBusy(false);
      }
    },
    [energy, note, persistTodayEntry, router, stress],
  );

  const handleRide = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: todayKey() }),
      });
      if (!res.ok) throw new Error("ride failed");
      const data = await res.json();
      if (typeof data.stage === "number") setStage(data.stage);
      setLog((prev) => ({ ...(prev ?? { checkedIn: false, workoutDone: false, weekendRide: false }), weekendRide: true }));
    } catch {
      // fallo de red: nos quedamos en casa
    } finally {
      setBusy(false);
    }
  }, []);

  const alreadyCheckedIn = Boolean(log?.checkedIn);
  const alreadyRode = Boolean(log?.weekendRide);
  const showCheckinConfirm = alreadyCheckedIn && !weekend;
  const showRideConfirm = weekend && alreadyRode;
  const confirmRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (showCheckinConfirm || showRideConfirm) confirmRef.current?.focus();
  }, [showCheckinConfirm, showRideConfirm]);

  return (
    <main className="relative space-y-8 py-8 pb-24">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-widest text-ink-subtle">Bloom</p>
          <h1 className="font-serif text-3xl leading-tight text-ink">{t("homeTitle")}</h1>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="min-h-12 rounded-2xl px-4 text-sm text-ink-muted underline"
        >
          {t("signOut")}
        </button>
      </header>

      <div className="flex justify-center">
        <PlantGrowth stage={stage} />
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-primary-soft p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <TrendingUp className="h-4 w-4 text-primary-deep" aria-hidden />
            <span>{t("streak")}</span>
          </div>
          <p className="mt-2 text-2xl font-serif text-ink">{weeklySummary.streak} {t("days")}</p>
        </div>
        <div className="rounded-3xl bg-accent-soft p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <SunMedium className="h-4 w-4 text-bloom" aria-hidden />
            <span>{t("energy")}</span>
          </div>
          <p className="mt-2 text-2xl font-serif text-ink">{weeklySummary.avgEnergy || 0}/5</p>
        </div>
        <div className="rounded-3xl bg-surface-muted p-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Bell className="h-4 w-4 text-ink-muted" aria-hidden />
            <span>{t("reminder")}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-ink">{reminderText}</p>
        </div>
      </section>

      {log === null ? (
        logError ? (
          <div className="space-y-4 text-center">
            <p role="alert" className="text-sm text-ink">{t("loadDayError")}</p>
            <button
              type="button"
              onClick={loadLog}
              className="min-h-12 rounded-2xl bg-primary px-4 text-sm text-surface"
            >
              {t("retry")}
            </button>
          </div>
        ) : (
          <p role="status" className="text-center text-sm text-ink-muted">{t("loadingDay")}</p>
        )
      ) : (
        <>
          {showCheckinConfirm && (
            <p
              role="status"
              aria-live="polite"
              tabIndex={-1}
              ref={confirmRef}
              className="rounded-3xl bg-primary-soft p-5 text-center text-ink"
            >
              {t("checkinThanks")}
            </p>
          )}

          {!weekend && !alreadyCheckedIn && (
            <MoodButtons weekend={false} onSelect={handleMood} onRide={handleRide} disabled={busy} />
          )}

          {weekend && !alreadyRode && (
            <MoodButtons weekend onSelect={handleMood} onRide={handleRide} disabled={busy} />
          )}

          {showRideConfirm && (
            <p
              role="status"
              aria-live="polite"
              tabIndex={-1}
              ref={confirmRef}
              className="rounded-3xl bg-accent-soft p-5 text-center text-ink"
            >
              {t("rideThanks")}
            </p>
          )}
        </>
      )}

      {!weekend && !alreadyCheckedIn && (
        <section className="rounded-3xl bg-surface-muted p-5">
          <div className="flex items-center gap-2 text-ink">
            <CalendarHeart className="h-5 w-5 text-primary-deep" aria-hidden />
            <h2 className="font-serif text-xl">{t("todayContext")}</h2>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block text-sm text-ink-muted">
              {t("energy")}: <span className="font-medium text-ink">{energy}/5</span>
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(event) => setEnergy(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
            <label className="block text-sm text-ink-muted">
              {t("stress")}: <span className="font-medium text-ink">{stress}/5</span>
              <input
                type="range"
                min={1}
                max={5}
                value={stress}
                onChange={(event) => setStress(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
            <label className="block text-sm text-ink-muted">
              {t("shortNote")}
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder={t("notePlaceholder")}
                className="mt-2 w-full rounded-2xl border border-sage-300 bg-surface p-3 text-ink placeholder:text-ink-muted"
              />
            </label>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <>
          <section className="rounded-3xl bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-ink">
                <Sparkles className="h-5 w-5 text-bloom" aria-hidden />
                <h2 className="font-serif text-xl">{t("week")}</h2>
              </div>
              <span className="rounded-full bg-primary-soft px-2 py-1 text-xs font-medium text-primary-deep">
                {t("streakDays", { count: weeklySummary.streak })}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {weeklySummary.points.map((point) => {
                const height = point.energy ? Math.max(18, point.energy * 20) : 10;
                return (
                  <div key={point.key} className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-full items-end justify-center rounded-2xl bg-surface p-1">
                      <div
                        className={point.mood === t("noRecord") ? "w-full rounded-xl bg-surface-muted" : "w-full rounded-xl bg-primary"}
                        style={{ height: `${height}px` }}
                        title={point.mood === t("noRecord") ? t("noRecord") : `${translatedMood(point.mood, locale, t)} · ${t("energy").toLowerCase()} ${point.energy}`}
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-ink-muted">{point.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
              <span>{t("avgEnergy")}: {weeklySummary.avgEnergy || 0}/5</span>
              <span>{t("avgStress")}: {weeklySummary.avgStress || 0}/5</span>
            </div>
          </section>

          <section className="rounded-3xl bg-surface-muted p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-ink">
                <CalendarHeart className="h-5 w-5 text-primary-deep" aria-hidden />
                <h2 className="font-serif text-xl">{t("monthSummary")}</h2>
              </div>
              <span className="rounded-full bg-surface px-2 py-1 text-xs font-medium text-ink">
                {monthlySummary.completionRate}%
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-ink-muted">
                  <span>{t("monthLog")}</span>
                  <span>{monthlySummary.completed}/{monthlySummary.totalDays}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${monthlySummary.completionRate}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-surface p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">{t("bestMood")}</p>
                  <p className="mt-2 font-medium text-ink">{monthlySummary.bestMood === t("noData") ? t("noData") : translatedMood(monthlySummary.bestMood, locale, t)}</p>
                </div>
                <div className="rounded-2xl bg-surface p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">{t("energy")}</p>
                  <p className="mt-2 font-medium text-ink">{monthlySummary.avgEnergy || 0}/5</p>
                </div>
                <div className="rounded-2xl bg-surface p-3">
                  <p className="text-xs uppercase tracking-wide text-ink-muted">{t("stress")}</p>
                  <p className="mt-2 font-medium text-ink">{monthlySummary.avgStress || 0}/5</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-primary-soft p-5">
            <h2 className="font-serif text-xl text-ink">{t("monthGoal")}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {goalCards.map((goal) => (
                <span
                  key={goal.label}
                  className={
                    goal.ok
                      ? "rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-primary-deep"
                      : "rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-ink-muted"
                  }
                >
                  {goal.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              {goalCards[0]?.detail ?? t("habitsImprove")}
            </p>
          </section>

          <section className="rounded-3xl bg-surface-muted p-5">
            <h2 className="font-serif text-xl text-ink">{t("reminders")}</h2>
            <div className="mt-3 space-y-2">
              {notifications.map((item) => (
                <div
                  key={item.title}
                  className={
                    item.tone === "good"
                      ? "rounded-2xl border border-primary/20 bg-surface p-3"
                      : "rounded-2xl border border-amber-300/40 bg-amber-50 p-3"
                  }
                >
                  <p className="font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {showOnboarding && (
        <section className="rounded-3xl border border-sage-300 bg-primary-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-deep">{t("welcome")}</p>
              <h2 className="mt-1 font-serif text-2xl text-ink">{t("bloomSupports")}</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowOnboarding(false)}
              className="rounded-full bg-surface px-3 py-1 text-xs text-ink-muted"
            >
              {t("understood")}
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {t("onboarding")}
          </p>
        </section>
      )}

      <button
        type="button"
        aria-label={t("urgentHelp")}
        onClick={() => setSosOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-bloom text-surface shadow-lg"
      >
        <Heart className="h-6 w-6" aria-hidden fill="currentColor" />
      </button>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </main>
  );
}
