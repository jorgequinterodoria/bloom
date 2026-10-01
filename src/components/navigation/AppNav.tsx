"use client";

import { BarChart3, Flower2, Home, PersonStanding } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function AppNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = [
    { href: "/", label: t("navHome"), icon: Home },
    { href: "/move", label: t("navMove"), icon: PersonStanding },
    { href: "/garden", label: t("navGarden"), icon: Flower2 },
    { href: "/insights", label: t("navInsights"), icon: BarChart3 },
  ];

  return (
    <nav aria-label="Bloom" className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-24px)] max-w-[406px] -translate-x-1/2 rounded-[28px] border border-white/70 bg-surface/90 p-2 shadow-[0_18px_50px_-24px_rgba(60,70,60,.5)] backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] transition ${active ? "bg-primary text-surface shadow-sm" : "text-ink-muted hover:bg-surface-muted"}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
