"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { localizeExercise } from "@/lib/exercise-i18n";
import { todayKey } from "@/lib/utils";
import { useI18n, translatedMood } from "@/lib/i18n";
import { playBloomChime, toggleBloomAmbience } from "@/lib/sounds";
import { nextIndex, timeLeftAfterTick } from "./flow";

interface Exercise { name: string; durationSeconds: number; instructions?: string | null; illustration?: string | null; }

type SessionStatus = "loading" | "playing" | "transition" | "summary" | "error";

export function WorkoutPlayer() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mood = searchParams.get("mood");
  const beforeEnergy = Number(searchParams.get("energy") ?? 3);
  const beforeStress = Number(searchParams.get("stress") ?? 3);
  const requestedDuration = Number(searchParams.get("duration") ?? 15);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [transitionLeft, setTransitionLeft] = useState(0);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [error, setError] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [afterEnergy, setAfterEnergy] = useState(beforeEnergy || 3);
  const [afterStress, setAfterStress] = useState(beforeStress || 3);
  const [ambient, setAmbient] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const postedRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!mood) { setError(true); setStatus("error"); return; }
    fetch(`/api/exercises?mood=${encodeURIComponent(mood)}&duration=${Math.max(5, requestedDuration)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(async (data) => {
        const list: Exercise[] = data.exercises ?? [];
        setExercises(list);
        setTimeLeft(list[0]?.durationSeconds ?? 0);
        const total = list.reduce((sum, exercise) => sum + exercise.durationSeconds, 0);
        const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", mood, day: todayKey(), beforeEnergy, beforeStress, durationSeconds: total, totalExercises: list.length }) });
        if (!response.ok) throw new Error("session");
        const session = await response.json();
        setSessionId(session.sessionId);
        setStartedAt(Date.now());
        setStatus(list.length ? "playing" : "error");
        playBloomChime("start");
      })
      .catch(() => { setError(true); setStatus("error"); });
  }, [beforeEnergy, beforeStress, mood, requestedDuration]);

  useEffect(() => {
    if (!ambient) return;
    toggleBloomAmbience(true);
    return () => toggleBloomAmbience(false);
  }, [ambient]);

  useEffect(() => {
    if (status !== "playing" || paused) return;
    const timer = window.setInterval(() => {
      setTimeLeft((left) => timeLeftAfterTick(left));
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [paused, status]);

  useEffect(() => {
    if (status !== "playing" || timeLeft !== 0 || !exercises?.length) return;
    const next = nextIndex(index, exercises.length);
    if (next === null) {
      setStatus("summary");
      playBloomChime("complete");
      return;
    }
    setStatus("transition");
    setTransitionLeft(3);
    playBloomChime("step");
  }, [exercises, index, status, timeLeft]);

  useEffect(() => {
    if (status !== "transition") return;
    const timer = window.setInterval(() => setTransitionLeft((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "transition" || transitionLeft > 0 || !exercises) return;
    const next = nextIndex(index, exercises.length);
    if (next !== null) {
      setIndex(next);
      setTimeLeft(exercises[next].durationSeconds);
      setStatus("playing");
    }
  }, [exercises, index, status, transitionLeft]);

  const current = exercises?.[index];
  const localized = current ? localizeExercise(current.name, current.instructions, locale) : null;
  const moodSummary: Record<string, string> = { Estresada: t("moodStressedSummary"), Ansiosa: t("moodAnxiousSummary"), Energética: t("moodEnergeticSummary"), "Sin motivación": t("moodUnmotivatedSummary") };
  const sessionMinutes = useMemo(() => Math.max(1, Math.round(((startedAt ? Math.max(elapsedSeconds, Math.round((Date.now() - startedAt) / 1000)) : elapsedSeconds) / 60))), [elapsedSeconds, startedAt]);

  async function complete() {
    if (!sessionId || postedRef.current) return;
    postedRef.current = true;
    const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete", sessionId, afterEnergy, afterStress, durationSeconds: Math.max(1, elapsedSeconds), exercisesCompleted: exercises?.length ?? 0, totalExercises: exercises?.length ?? 0 }) });
    if (response.ok) router.push("/");
    else setError(true);
  }

  if (status === "error" || !mood || (exercises && exercises.length === 0)) return <main className="space-y-6 py-16 text-center"><p className="text-ink-muted">{t("flowMissing")}</p><Link href="/" className="inline-flex min-h-12 items-center rounded-2xl bg-primary px-6 text-surface">{t("backHome")}</Link></main>;
  if (!exercises || !current || !localized) return <main className="flex min-h-[70vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-primary-soft" /><p className="mt-4 text-sm text-ink-muted">{t("movementReady")}</p></div></main>;

  if (status === "summary") return <Summary beforeEnergy={beforeEnergy} beforeStress={beforeStress} afterEnergy={afterEnergy} afterStress={afterStress} setAfterEnergy={setAfterEnergy} setAfterStress={setAfterStress} minutes={sessionMinutes} onComplete={complete} saving={postedRef.current} error={error} />;

  if (status === "transition") return <main className="flex min-h-[80vh] flex-col items-center justify-center text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-deep">{t("nextMove")}</p><h1 className="mt-4 max-w-xs font-serif text-4xl text-ink">{localizeExercise(exercises[nextIndex(index, exercises.length) ?? index]?.name ?? "", exercises[nextIndex(index, exercises.length) ?? index]?.instructions, locale).name}</h1><div className="mt-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary-soft font-serif text-5xl text-primary-deep">{transitionLeft}</div><p className="mt-5 text-sm text-ink-muted">{t("transitionHint")}</p></main>;

  const progress = Math.max(0, Math.min(100, ((current.durationSeconds - timeLeft) / current.durationSeconds) * 100));

  return <main className="flex min-h-[80vh] flex-col py-4 pb-24">
    <header className="flex items-center justify-between"><Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink" aria-label={t("backHome")}><ChevronLeft className="h-5 w-5" aria-hidden /></Link><div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-deep">{translatedMood(mood, locale, t)}</p><p className="mt-1 text-xs text-ink-muted">{index + 1}/{exercises.length}</p></div><button type="button" aria-label={ambient ? t("soundOn") : t("soundOff")} onClick={() => setAmbient((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-muted">{ambient ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5" aria-hidden />}</button></header>
    <section className="mt-5 rounded-[30px] bg-surface-muted p-4"><p className="text-xs leading-relaxed text-ink-muted">{moodSummary[mood] ?? t("genericMoodSummary")}</p></section>
    <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <motion.div aria-hidden className="absolute inset-0 rounded-full bg-primary-soft" animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.16, 1] }} transition={paused ? { duration: .3 } : { duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="absolute inset-8 rounded-full bg-accent-soft/80" animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.1, 1] }} transition={paused ? { duration: .3 } : { duration: 8, repeat: Infinity, ease: "easeInOut", delay: .3 }} />
        {current.illustration ? <Image unoptimized src={current.illustration} alt={localized.name} width={220} height={140} className="relative z-10 h-36 w-auto" /> : <h1 className="relative z-10 max-w-[11rem] font-serif text-2xl text-ink">{localized.name}</h1>}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary-deep">{localized.name}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{localized.instruction}</p>
      <div className="mt-6 w-full max-w-xs"><div className="flex items-center justify-between text-xs text-ink-muted"><span>{timeLeft} {t("seconds")}</span><span>{Math.round(progress)}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress}%` }} /></div></div>
    </div>
    <div className="flex gap-3"><button type="button" onClick={() => setPaused((value) => !value)} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-muted text-sm font-semibold text-ink">{paused ? <Play className="h-5 w-5" aria-hidden /> : <Pause className="h-5 w-5" aria-hidden />}{paused ? t("resume") : t("pause")}</button><button type="button" onClick={() => { const next = nextIndex(index, exercises.length); if (next === null) setStatus("summary"); else { setIndex(next); setTimeLeft(exercises[next].durationSeconds); playBloomChime("step"); } }} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-surface"><SkipForward className="h-5 w-5" aria-hidden />{t("nextMove")}</button></div>
  </main>;
}

function Summary({ beforeEnergy, beforeStress, afterEnergy, afterStress, setAfterEnergy, setAfterStress, minutes, onComplete, saving, error }: { beforeEnergy: number; beforeStress: number; afterEnergy: number; afterStress: number; setAfterEnergy: (value: number) => void; setAfterStress: (value: number) => void; minutes: number; onComplete: () => Promise<void>; saving: boolean; error: boolean; }) {
  const { t } = useI18n();
  return <main className="space-y-6 py-8 pb-24"><div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary-deep"><Check className="h-8 w-8" aria-hidden /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">{t("sessionComplete")}</p><h1 className="mt-2 font-serif text-4xl text-ink">{t("howDoYouFeelNow")}</h1><p className="mt-2 text-sm text-ink-muted">{t("beforeAfterHint")}</p></div><section className="grid grid-cols-2 gap-3"><Compare label={t("stress")} before={beforeStress} after={afterStress} /><Compare label={t("energy")} before={beforeEnergy} after={afterEnergy} /></section><section className="rounded-[30px] bg-surface-muted p-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-deep">{t("afterCheckin")}</p><Slider label={t("energy")} value={afterEnergy} onChange={setAfterEnergy} /><Slider label={t("stress")} value={afterStress} onChange={setAfterStress} /></section><div className="rounded-[30px] bg-primary-soft p-5 text-center"><p className="font-serif text-2xl text-ink">{minutes} {t("minutes")}</p><p className="mt-1 text-sm text-ink-muted">{t("sessionSavedMessage")}</p></div>{error && <p className="text-center text-sm text-bloom">{t("saveProgressError")}</p>}<button type="button" disabled={saving} onClick={() => void onComplete()} className="min-h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-surface disabled:opacity-60">{saving ? t("saving") : t("saveAndBloom")}</button></main>;
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="mt-4 block"><span className="flex justify-between text-sm text-ink"><span>{label}</span><strong>{value}/5</strong></span><input className="mt-2 w-full accent-[var(--color-primary)]" type="range" min={1} max={5} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>; }
function Compare({ label, before, after }: { label: string; before: number; after: number }) { const delta = after - before; return <div className="rounded-3xl bg-surface-muted p-4"><p className="text-xs text-ink-muted">{label}</p><div className="mt-3 flex items-end gap-2"><span className="font-serif text-3xl text-ink">{after}</span><span className="pb-1 text-xs text-ink-muted">/5</span></div><p className={`mt-2 text-xs font-medium ${delta < 0 ? "text-primary-deep" : delta > 0 ? "text-bloom" : "text-ink-muted"}`}>{delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(0)}`}</p></div>; }
