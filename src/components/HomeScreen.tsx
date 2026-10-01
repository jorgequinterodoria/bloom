"use client";

import { ArrowRight, Bell, Heart, Leaf, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckinCard } from "@/components/dashboard/CheckinCard";
import { MoodButtons } from "@/components/mood/MoodButtons";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PlantGrowth } from "@/components/plant/PlantGrowth";
import { SOSModal } from "@/components/sos/SOSModal";
import { buildRecommendation } from "@/lib/recommendations";
import { useI18n } from "@/lib/i18n";
import { isWeekendDay, todayKey } from "@/lib/utils";
import { enqueueMutation } from "@/lib/offline";
import type { MoodName } from "@/lib/constants";

interface DayLog { checkedIn: boolean; workoutDone: boolean; weekendRide: boolean; moodId?: string | null; }
interface HistoryEntry { date: string; mood: string; energy: number; stress: number; note: string; }

export default function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [log, setLog] = useState<DayLog | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stage, setStage] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferredDuration, setPreferredDuration] = useState(15);
  const [offlinePending, setOfflinePending] = useState(false);
  const [recommendation, setRecommendation] = useState(buildRecommendation({ energy: 3, stress: 3 }));

  const load = useCallback(async () => {
    const day = todayKey();
    const [logResponse, historyResponse, plantResponse, profileResponse] = await Promise.all([
      fetch(`/api/log?day=${day}`),
      fetch("/api/history?days=30"),
      fetch("/api/plant"),
      fetch("/api/profile"),
    ]);
    if (logResponse.ok) {
      const data = await logResponse.json();
      setLog(data);
      setEnergy(typeof data.energy === "number" ? data.energy : 3);
      setStress(typeof data.stress === "number" ? data.stress : 3);
      setNote(typeof data.note === "string" ? data.note : "");
    }
    if (historyResponse.ok) {
      const data = await historyResponse.json();
      if (Array.isArray(data.history)) setHistory(data.history);
    }
    if (plantResponse.ok) {
      const data = await plantResponse.json();
      setStage(typeof data.stage === "number" ? data.stage : 0);
    }
    if (profileResponse.ok) {
      const data = await profileResponse.json();
      setShowOnboarding(!Boolean(data.profile?.onboardingCompleted));
      if (typeof data.profile?.preferredDuration === "number") setPreferredDuration(data.profile.preferredDuration);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    setRecommendation(buildRecommendation({
      energy,
      stress,
      preferredDuration,
      recentStress: history.slice(0, 7).map((entry) => entry.stress),
      recentEnergy: history.slice(0, 7).map((entry) => entry.energy),
    }));
  }, [energy, stress, history, preferredDuration]);

  const streak = useMemo(() => {
    const dates = new Set(history.map((entry) => entry.date));
    let count = 0;
    const cursor = new Date();
    while (dates.has(todayKey(cursor))) { count += 1; cursor.setDate(cursor.getDate() - 1); }
    return count;
  }, [history]);

  const monthCheckins = useMemo(() => history.length, [history]);
  const weekend = isWeekendDay(new Date());

  const handleMood = useCallback(async (mood: MoodName) => {
    setBusy(true);
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, day: todayKey(), energy, stress, note }),
      });
      if (!response.ok) throw new Error("checkin");
      const data = await response.json();
      if (typeof data.stage === "number") setStage(data.stage);
      setLog((current) => ({ ...(current ?? { checkedIn: false, workoutDone: false, weekendRide: false }), checkedIn: true }));
      router.push(`/move?mood=${encodeURIComponent(mood)}&energy=${energy}&stress=${stress}&duration=${recommendation.duration}`);
    } catch {
      if (!navigator.onLine) {
        enqueueMutation("/api/checkin", { mood, day: todayKey(), energy, stress, note });
        setOfflinePending(true);
        setLog((current) => ({ ...(current ?? { checkedIn: false, workoutDone: false, weekendRide: false }), checkedIn: true }));
      }
    } finally {
      setBusy(false);
    }
  }, [energy, note, recommendation.duration, router, stress]);


  const handleRide = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/ride", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day: todayKey() }) });
      if (!response.ok) throw new Error("ride");
      const data = await response.json();
      if (typeof data.stage === "number") setStage(data.stage);
      setLog((current) => ({ ...(current ?? { checkedIn: false, workoutDone: false, weekendRide: false }), weekendRide: true }));
    } catch {
      enqueueMutation("/api/ride", { day: todayKey() });
      setOfflinePending(true);
      setLog((current) => ({ ...(current ?? { checkedIn: false, workoutDone: false, weekendRide: false }), weekendRide: true }));
    } finally {
      setBusy(false);
    }
  }, []);

  const startRecommended = () => {
    if (!log?.checkedIn) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }
    router.push(`/move?mood=${encodeURIComponent(recommendation.mood)}&energy=${energy}&stress=${stress}&duration=${recommendation.duration}`);
  };

  return (
    <main className="space-y-6 py-4 pb-28">
      <header className="flex items-start justify-between gap-4 pt-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-deep">Bloom</p>
          <h1 className="mt-1 font-serif text-[2.35rem] leading-[1.05] text-ink">{t("homeGreeting")}</h1>
          <p className="mt-2 text-sm text-ink-muted">{t("homeSubline")}</p>
        </div>
        <button type="button" aria-label={t("signOut")} onClick={() => signOut({ callbackUrl: "/login" })} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted ring-1 ring-black/5">
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </header>

      <section className="relative overflow-hidden rounded-[34px] bg-surface-muted p-5 ring-1 ring-black/5">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary-soft blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep"><Leaf className="h-4 w-4" aria-hidden />{t("yourBloom")}</div>
            <p className="mt-2 font-serif text-2xl text-ink">{t(stage >= 10 ? "gardenBlooming" : stage >= 6 ? "gardenGrowing" : stage >= 3 ? "gardenSprouting" : "gardenBeginning")}</p>
            <p className="mt-1 text-xs text-ink-muted">{streak} {t("days")} · {monthCheckins} {t("checkins")}</p>
          </div>
          <div className="-mr-3 -mt-4 h-36 w-32"><PlantGrowth stage={stage} compact /></div>
        </div>
      </section>

      <RecommendationCard recommendation={recommendation} onStart={startRecommended} />

      {offlinePending && <div role="status" className="rounded-2xl bg-surface-muted px-4 py-3 text-xs text-ink-muted">{t("offlineQueued", { count: 1 })}</div>}

      {!weekend && !log?.checkedIn && (
        <CheckinCard
          energy={energy}
          stress={stress}
          note={note}
          busy={busy}
          onEnergy={setEnergy}
          onStress={setStress}
          onNote={setNote}
          onMood={handleMood}
        />
      )}

      {weekend && !log?.checkedIn && !log?.weekendRide && (
        <MoodButtons weekend onSelect={handleMood} onRide={handleRide} disabled={busy} />
      )}

      {weekend && log?.weekendRide && !log?.checkedIn && (
        <section className="rounded-[30px] bg-accent-soft p-5 text-center"><p className="font-serif text-2xl text-ink">{t("rideThanks")}</p><p className="mt-2 text-sm text-ink-muted">{t("weekendGentleDetail")}</p></section>
      )}

      {log?.checkedIn && (
        <section className="rounded-[32px] border border-primary/20 bg-primary-soft p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">{t("todayIsLogged")}</p>
              <h2 className="mt-1 font-serif text-2xl text-ink">{t("readyForMovement")}</h2>
              <p className="mt-2 text-sm text-ink-muted">{t("readyForMovementDetail")}</p>
            </div>
            <ShieldCheck className="h-6 w-6 shrink-0 text-primary-deep" aria-hidden />
          </div>
          <button type="button" onClick={startRecommended} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-surface">
            {t("startSession")}<ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </section>
      )}

      {weekend && !log?.checkedIn && (
        <section className="rounded-[30px] bg-accent-soft p-5">
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-bloom" aria-hidden /><h2 className="font-serif text-2xl text-ink">{t("weekendGentle")}</h2></div>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("weekendGentleDetail")}</p>
        </section>
      )}

      {history.length > 0 && (
        <section className="rounded-[30px] bg-surface-muted p-5">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-bloom" aria-hidden /><h2 className="font-serif text-2xl text-ink">{t("recentCare")}</h2></div><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-deep">🔥 {streak}</span></div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {history.slice(0, 7).reverse().map((entry) => <div key={entry.date} className="rounded-2xl bg-surface p-2 text-center"><div className="mx-auto h-10 w-2 rounded-full bg-surface-raised"><div className="w-full rounded-full bg-primary" style={{ height: `${entry.energy * 20}%` }} /></div><span className="mt-2 block text-[9px] text-ink-muted">{entry.date.slice(-2)}</span></div>)}
          </div>
          <button type="button" onClick={() => router.push("/insights")} className="mt-4 flex min-h-11 w-full items-center justify-between rounded-2xl bg-surface px-4 text-sm font-medium text-ink">{t("viewEvolution")}<ArrowRight className="h-4 w-4" aria-hidden /></button>
        </section>
      )}

      <button type="button" aria-label={t("urgentHelp")} onClick={() => setSosOpen(true)} className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-bloom text-surface shadow-lg ring-4 ring-surface">
        <Heart className="h-5 w-5" aria-hidden fill="currentColor" />
      </button>

      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </main>
  );
}
