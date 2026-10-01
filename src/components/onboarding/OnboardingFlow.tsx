"use client";

import { Check, Clock3, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const durations = [5, 10, 15, 20, 30];
const focuses = ["stress", "energy", "movement", "balance"] as const;

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [duration, setDuration] = useState(15);
  const [focus, setFocus] = useState<(typeof focuses)[number]>("balance");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  async function finish() {
    setBusy(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredDuration: duration, focus, onboardingCompleted: true }),
      });
      if (response.ok) onComplete();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-ink/45 p-4 backdrop-blur-sm">
      <div className="mx-auto flex min-h-full w-full max-w-[430px] items-center">
        <section className="w-full overflow-hidden rounded-[36px] bg-surface p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-xs text-ink-muted">{step + 1}/3</span>
          </div>

          {step === 0 && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                <Heart className="h-9 w-9" aria-hidden fill="currentColor" />
              </div>
              <h1 className="mt-6 font-serif text-4xl leading-tight text-ink">{t("onboardingTitle")}</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">{t("onboardingSubtitle")}</p>
            </div>
          )}

          {step === 1 && (
            <div className="py-7">
              <h2 className="font-serif text-3xl text-ink">{t("onboardingFocusTitle")}</h2>
              <p className="mt-2 text-sm text-ink-muted">{t("onboardingFocusSubtitle")}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {focuses.map((item) => {
                  const active = focus === item;
                  return (
                    <button key={item} type="button" onClick={() => setFocus(item)} className={`min-h-24 rounded-3xl p-4 text-left transition ${active ? "bg-primary text-surface shadow-sm" : "bg-surface-muted text-ink"}`}>
                      <span className="block font-medium">{t(`focus_${item}`)}</span>
                      <span className={`mt-1 block text-xs ${active ? "text-surface/75" : "text-ink-muted"}`}>{t(`focus_${item}_detail`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-7">
              <h2 className="font-serif text-3xl text-ink">{t("onboardingDurationTitle")}</h2>
              <p className="mt-2 text-sm text-ink-muted">{t("onboardingDurationSubtitle")}</p>
              <div className="mt-6 space-y-2">
                {durations.map((value) => {
                  const active = duration === value;
                  return (
                    <button key={value} type="button" onClick={() => setDuration(value)} className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 ${active ? "bg-primary text-surface" : "bg-surface-muted text-ink"}`}>
                      <span className="flex items-center gap-3"><Clock3 className="h-5 w-5" aria-hidden />{value} {t("minutes")}</span>
                      {active && <Check className="h-5 w-5" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 border-t border-black/5 pt-4">
            {step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="min-h-12 flex-1 rounded-2xl bg-surface-muted text-sm font-medium text-ink">{t("back")}</button>}
            {step < 2 ? <button type="button" onClick={() => setStep((value) => value + 1)} className="min-h-12 flex-1 rounded-2xl bg-primary text-sm font-semibold text-surface">{t("continue")}</button> : <button type="button" onClick={finish} disabled={busy} className="min-h-12 flex-1 rounded-2xl bg-primary text-sm font-semibold text-surface disabled:opacity-60">{busy ? t("saving") : t("finishBloom")}</button>}
          </div>
        </section>
      </div>
    </div>
  );
}
