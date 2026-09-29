"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, SkipForward } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { todayKey } from "@/lib/utils";
import { nextIndex, timeLeftAfterTick } from "./flow";

interface Exercise {
  name: string;
  durationSeconds: number;
  instructions?: string | null;
  illustration?: string | null;
}

export function WorkoutPlayer() {
  const searchParams = useSearchParams();
  const mood = searchParams.get("mood");

  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const postedRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!mood) {
      setError(true);
      return;
    }
    fetch(`/api/exercises?mood=${encodeURIComponent(mood)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const list: Exercise[] = data.exercises ?? [];
        setExercises(list);
        setTimeLeft(list[0]?.durationSeconds ?? 0);
      })
      .catch(() => setError(true));
  }, [mood]);

  useEffect(() => {
    if (exercises?.[index]) setTimeLeft(exercises[index].durationSeconds);
  }, [exercises, index]);

  useEffect(() => {
    if (paused || finished || !exercises?.length) return;
    const id = setInterval(() => {
      setTimeLeft((left) => timeLeftAfterTick(left));
    }, 1000);
    return () => clearInterval(id);
  }, [paused, finished, exercises]);

  useEffect(() => {
    if (!exercises?.length || timeLeft !== 0 || finished) return;
    const next = nextIndex(index, exercises.length);
    if (next === null) {
      setFinished(true);
    } else {
      setIndex(next);
      setTimeLeft(exercises[next].durationSeconds);
    }
  }, [timeLeft, exercises, index, finished]);

  useEffect(() => {
    if (!finished || postedRef.current) return;
    postedRef.current = true;
    fetch("/api/workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: todayKey() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo guardar el avance");
      })
      .catch(() => setSaveFailed(true));
  }, [finished]);

  if (error || !mood || exercises?.length === 0) {
    return (
      <main className="space-y-6 py-16 text-center">
        <p className="text-ink-muted">No encontramos tu flujo de hoy.</p>
        <Link href="/" className="inline-block min-h-12 rounded-2xl bg-primary px-6 py-3 text-surface">
          Volver al inicio
        </Link>
      </main>
    );
  }

  if (!exercises) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-ink-subtle">Preparando tu movimiento…</p>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="space-y-6 py-16 text-center">
        <p role="status" className="font-serif text-3xl text-ink">Listo por hoy</p>
        <p className="text-ink-muted">Tu planta te espera en casa.</p>
        {saveFailed && (
          <p role="status" className="text-sm text-ink-muted">
            No pudimos guardar tu avance.
          </p>
        )}
        <Link href="/" className="inline-block min-h-12 rounded-2xl bg-primary px-6 py-3 text-surface">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const current = exercises[index];

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-between py-10 text-center">
      <p className="text-sm uppercase tracking-widest text-ink-subtle">
        {mood}
      </p>

      <div className="flex flex-col items-center gap-6">
        <p className="sr-only">
          Respira siguiendo el círculo: inhala lentamente y exhala despacio.
        </p>
        <div className="relative flex h-64 w-64 items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary-soft"
            animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.18, 1] }}
            transition={
              paused
                ? { duration: 0.4 }
                : { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            aria-hidden
            className="absolute inset-6 rounded-full bg-accent-soft/70"
            animate={reduce ? {} : paused ? { scale: 1 } : { scale: [1, 1.12, 1] }}
            transition={
              paused
                ? { duration: 0.4 }
                : { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
            }
          />
          <h1 className="relative z-10 max-w-[10rem] font-serif text-2xl leading-snug text-ink">
            {current.name}
          </h1>
        </div>

        <div className="w-full max-w-xs space-y-1.5">
          <p className="text-sm text-ink">{timeLeft} s</p>
          <div
            role="progressbar"
            aria-label="Progreso del ejercicio"
            aria-valuemin={0}
            aria-valuemax={current.durationSeconds}
            aria-valuenow={current.durationSeconds - timeLeft}
            className="h-2 w-full overflow-hidden rounded-full bg-primary-soft"
          >
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${((current.durationSeconds - timeLeft) / current.durationSeconds) * 100}%`,
              }}
            />
          </div>
        </div>

        <p aria-live="polite" className="text-sm text-ink-muted">
          Ejercicio {index + 1} de {exercises.length}
        </p>

        {current.illustration && (
          <Image
            unoptimized
            src={current.illustration}
            alt={current.name}
            width={320}
            height={160}
            className="h-40 w-auto"
          />
        )}
        {current.instructions && (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-muted">
            {current.instructions}
          </p>
        )}
      </div>

      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-surface-raised px-6 font-medium text-ink"
        >
          {paused ? <Play className="h-5 w-5" aria-hidden /> : <Pause className="h-5 w-5" aria-hidden />}
          {paused ? "Reanudar" : "Pausar"}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = nextIndex(index, exercises.length);
            if (next === null) setFinished(true);
            else setIndex(next);
          }}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-medium text-surface"
        >
          <SkipForward className="h-5 w-5" aria-hidden />
          Siguiente movimiento
        </button>
      </div>
    </main>
  );
}
