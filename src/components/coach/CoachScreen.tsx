"use client";

import { ArrowRight, Bot, HeartHandshake, Leaf, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { SoundscapePlayer } from "@/components/soundscape/SoundscapePlayer";
import { useI18n } from "@/lib/i18n";
import { localizeCoachReply, localizeStoredCoachMessage } from "@/lib/coach-i18n";
import type { CoachReply } from "@/lib/coach";

interface CoachMessage { role: "user" | "assistant"; message: string; createdAt: string; reply?: CoachReply; }
interface CoachContextResponse { brief: CoachReply; messages: CoachMessage[]; latest: { energy: number; stress: number; mood: string | null } | null; }

const promptKeys = ["coachPromptStress", "coachPromptEnergy", "coachPromptMovement", "coachPromptProgress"] as const;

export function CoachScreen() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<CoachContextResponse | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    const response = await fetch("/api/coach", { cache: "no-store" });
    if (!response.ok) throw new Error("coach");
    setData(await response.json());
  }

  useEffect(() => { void load().then(() => { void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "coach_opened" }) }); }).catch(() => setError(true)); }, []);

  const visibleMessages = useMemo(() => data?.messages.slice(-8) ?? [], [data]);
  const localizedBrief = useMemo(() => data ? localizeCoachReply(data.brief, locale) : null, [data, locale]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    const content = message.trim();
    if (!content || sending) return;
    setSending(true);
    setError(false);
    try {
      const response = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: content }) });
      if (!response.ok) throw new Error("coach");
      const payload = await response.json();
      const reply = payload.reply as CoachReply;
      const localizedReply = localizeCoachReply(reply, locale);
      setData((current) => current ? { ...current, messages: [...current.messages, { role: "user", message: content, createdAt: new Date().toISOString() }, { role: "assistant", message: localizedReply.body, reply, createdAt: new Date().toISOString() }], brief: reply } : current);
      setMessage("");
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }

  if (!data) return <main className="py-12 text-center text-sm text-ink-muted">{t("coachLoading")}</main>;

  return (
    <main className="space-y-6 py-5 pb-28">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-deep">{t("coachEyebrow")}</p>
        <h1 className="mt-1 font-serif text-4xl leading-tight text-ink">{t("coachTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("coachSubtitle")}</p>
      </header>

      <section className="relative overflow-hidden rounded-[34px] bg-ink p-5 text-surface">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
        <div className="relative flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary-soft"><Bot className="h-5 w-5" aria-hidden /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-soft">{t("coachToday")}</p><h2 className="mt-2 font-serif text-2xl">{localizedBrief?.title}</h2><p className="mt-2 text-sm leading-relaxed text-surface/75">{localizedBrief?.body}</p></div></div>
        <div className="relative mt-4 rounded-2xl bg-white/5 p-3"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-soft">{t("coachWhy")}</p><p className="mt-1 text-xs leading-relaxed text-surface/70">{localizedBrief?.reason}</p></div>
      </section>

      {data.latest && (
        <section className="grid grid-cols-2 gap-3"><div className="rounded-3xl bg-primary-soft p-4"><p className="text-xs text-ink-muted">{t("energy")}</p><p className="mt-2 font-serif text-3xl text-ink">{data.latest.energy}/5</p></div><div className="rounded-3xl bg-accent-soft p-4"><p className="text-xs text-ink-muted">{t("stress")}</p><p className="mt-2 font-serif text-3xl text-ink">{data.latest.stress}/5</p></div></section>
      )}

      <section className="rounded-[30px] bg-surface-muted p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-bloom" aria-hidden /><h2 className="font-serif text-2xl text-ink">{t("coachAsk")}</h2></div><div className="mt-4 flex flex-wrap gap-2">{promptKeys.map((key) => { const prompt = t(key); return <button key={key} type="button" onClick={() => setMessage(prompt)} className="rounded-full bg-surface px-3 py-2 text-xs font-medium text-ink shadow-sm">{prompt}</button>; })}</div></section>

      {visibleMessages.length > 0 && <section className="space-y-3">{visibleMessages.map((item, index) => { const text = item.reply ? localizeCoachReply(item.reply, locale).body : item.role === "assistant" ? localizeStoredCoachMessage(item.message, locale) : item.message; return <div key={`${item.createdAt}-${index}`} className={`rounded-3xl p-4 ${item.role === "user" ? "ml-8 bg-primary-soft" : "mr-8 bg-surface-muted"}`}><p className="text-xs leading-relaxed text-ink">{text}</p></div>; })}</section>}

      <form onSubmit={(event) => void submit(event)} className="sticky bottom-24 z-30 rounded-[28px] border border-surface-raised bg-surface/95 p-2 shadow-[0_18px_50px_-24px_rgba(60,70,60,.5)] backdrop-blur-xl">
        <div className="flex items-end gap-2"><textarea value={message} onChange={(event) => setMessage(event.target.value.slice(0, 500))} rows={2} placeholder={t("coachPlaceholder")} className="min-h-16 flex-1 resize-none rounded-2xl bg-surface-muted px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-subtle" /><button type="submit" disabled={sending || !message.trim()} aria-label={t("coachSend")} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-surface disabled:opacity-50"><Send className="h-5 w-5" aria-hidden /></button></div>
      </form>

      {error && <p role="alert" className="text-center text-sm text-bloom">{t("coachError")}</p>}

      <div className="grid gap-3 sm:grid-cols-2"><Link href="/move" className="flex min-h-12 items-center justify-between rounded-2xl bg-primary px-4 text-sm font-semibold text-surface"><span className="flex items-center gap-2"><HeartHandshake className="h-4 w-4" aria-hidden />{localizedBrief?.action}</span><ArrowRight className="h-4 w-4" aria-hidden /></Link><Link href="/insights" className="flex min-h-12 items-center justify-between rounded-2xl bg-surface-muted px-4 text-sm font-medium text-ink"><span className="flex items-center gap-2"><Leaf className="h-4 w-4" aria-hidden />{t("viewEvolution")}</span><ArrowRight className="h-4 w-4" aria-hidden /></Link></div>

      <SoundscapePlayer />
    </main>
  );
}
