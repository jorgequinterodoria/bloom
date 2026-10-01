"use client";

import RegisterForm from "./RegisterForm";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl text-ink">Bloom</h1>
        <p className="text-ink-muted">{t("registerIntro")}</p>
      </header>
      <RegisterForm />
      <p className="text-center text-sm text-ink-subtle">
        {t("hasAccount")} {" "}
        <a href="/login" className="text-primary underline">
          {t("login")}
        </a>
      </p>
    </main>
  );
}
