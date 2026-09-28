"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlantGrowth } from "@/components/plant/PlantGrowth";
import { MoodButtons } from "@/components/mood/MoodButtons";
import { SOSModal } from "@/components/sos/SOSModal";
import { isWeekendDay, todayKey } from "@/lib/utils";

interface DayLog {
  checkedIn: boolean;
  workoutDone: boolean;
  weekendRide: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [weekend, setWeekend] = useState(false);
  const [stage, setStage] = useState(0);
  const [log, setLog] = useState<DayLog | null>(null);
  const [logError, setLogError] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadLog = useCallback(() => {
    setLogError(false);
    fetch(`/api/log?day=${todayKey()}`)
      .then((r) => {
        if (!r.ok) throw new Error("log fetch failed");
        return r.json();
      })
      .then((d) => setLog(d))
      .catch(() => setLogError(true));
  }, []);

  useEffect(() => {
    setWeekend(isWeekendDay(new Date()));
    fetch("/api/plant")
      .then((r) => {
        if (!r.ok) throw new Error("plant fetch failed");
        return r.json();
      })
      .then((d) => typeof d.stage === "number" && setStage(d.stage))
      .catch(() => {});
    loadLog();
  }, [loadLog]);

  useEffect(() => {
    if (!sosOpen) return;
    fetch("/api/sos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: todayKey() }),
    }).catch(() => {});
  }, [sosOpen]);

  const handleMood = useCallback(
    async (mood: string) => {
      setBusy(true);
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, day: todayKey() }),
        });
        if (!res.ok) throw new Error("checkin failed");
        const data = await res.json();
        if (typeof data.stage === "number") setStage(data.stage);
        setLog((prev) => ({ ...(prev ?? { checkedIn: false, workoutDone: false, weekendRide: false }), checkedIn: true }));
        router.push(`/move?mood=${encodeURIComponent(mood)}`);
      } catch {
        // fallo de red: nos quedamos en casa
      } finally {
        setBusy(false);
      }
    },
    [router],
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
          <p className="text-sm uppercase tracking-widest text-ink-subtle">
            Bloom
          </p>
          <h1 className="font-serif text-3xl leading-tight text-ink">
            ¿Cómo te sientes hoy?
          </h1>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="min-h-12 rounded-2xl px-4 text-sm text-ink-muted underline"
        >
          Salir
        </button>
      </header>

      <div className="flex justify-center">
        <PlantGrowth stage={stage} />
      </div>

      {log === null ? (
        logError ? (
          <div className="space-y-4 text-center">
            <p role="alert" className="text-sm text-ink">
              No pudimos cargar tu día.
            </p>
            <button
              type="button"
              onClick={loadLog}
              className="min-h-12 rounded-2xl bg-primary px-4 text-sm text-surface"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <p role="status" className="text-center text-sm text-ink-muted">
            Cargando tu día…
          </p>
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
              Gracias por registrar cómo te sientes. Tu planta ha crecido un poco
              más.
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
              Paseo registrado. Disfruta el resto del fin de semana.
            </p>
          )}
        </>
      )}

      <button
        type="button"
        aria-label="Ayuda urgente (SOS)"
        onClick={() => setSosOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-bloom text-surface shadow-lg"
      >
        <Heart className="h-6 w-6" aria-hidden fill="currentColor" />
      </button>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </main>
  );
}
