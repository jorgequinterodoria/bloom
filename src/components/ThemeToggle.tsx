"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const KEY = "bloom-theme";

export function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(KEY); setDark(saved === "night"); document.documentElement.dataset.theme = saved === "night" ? "night" : "day"; }, []);
  function toggle() { const next = !dark; setDark(next); localStorage.setItem(KEY, next ? "night" : "day"); document.documentElement.dataset.theme = next ? "night" : "day"; }
  return <button type="button" onClick={toggle} aria-label={t("toggleTheme")} className="fixed right-5 top-14 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-ink-muted ring-1 ring-black/5">{dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}</button>;
}
