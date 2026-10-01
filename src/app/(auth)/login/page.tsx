"use client";

import LoginForm from "./LoginForm";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl text-ink">Bloom</h1>
        <p className="text-ink-muted">{t("loginIntro")}</p>
      </header>
      <LoginForm />
      <p className="text-center text-sm text-ink-subtle">
        {t("noAccount")} {" "}
        <a href="/register" className="text-primary underline">
          {t("createOne")}
        </a>
      </p>
    </main>
  );
}
