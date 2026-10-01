"use client";

import { CloudOff } from "lucide-react";
import { useEffect, useState } from "react";
import { flushOfflineQueue, readOfflineQueue } from "@/lib/offline";
import { useI18n } from "@/lib/i18n";

export function OfflineSync() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const refresh = () => { setOffline(!navigator.onLine); setQueued(readOfflineQueue().length); };
    const sync = async () => { await flushOfflineQueue(); refresh(); };
    refresh();
    window.addEventListener("online", sync);
    window.addEventListener("offline", refresh);
    const timer = window.setInterval(sync, 20_000);
    return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", refresh); window.clearInterval(timer); };
  }, []);

  if (!offline && queued === 0) return null;
  return <div className="fixed left-1/2 top-14 z-50 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-surface shadow-xl"><div className="flex items-center gap-3"><CloudOff className="h-4 w-4 shrink-0 text-primary-soft" aria-hidden /><p className="text-xs leading-relaxed">{offline ? t("offlineMessage") : t("offlineQueued", { count: queued })}</p></div></div>;
}
