"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function MoveError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-ink">{t("movementError")}</p>
      <button
        type="button"
        onClick={reset}
        className="min-h-12 rounded-2xl bg-primary px-6 font-medium text-surface"
      >
        {t("retry")}
      </button>
      <Link href="/" className="inline-block min-h-12 rounded-2xl px-4 text-sm text-ink-muted underline">
        {t("backHome")}
      </Link>
    </main>
  );
}
