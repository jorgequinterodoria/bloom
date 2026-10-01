"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function RegisterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      const apiErrors: Record<string, string> = {
        "Correo inválido.": t("invalidEmail"),
        "La contraseña debe tener al menos 8 caracteres.": t("shortPassword"),
        "Ese correo ya está registrado.": t("emailTaken"),
      };
      setError((data?.error && apiErrors[data.error]) || t("registerError"));
    } catch {
      setError(t("registerError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-ink-muted">{t("email")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-surface-raised bg-surface-raised px-4 text-ink outline-none focus:border-primary"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-ink-muted">{t("password")}</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-surface-raised bg-surface-raised px-4 text-ink outline-none focus:border-primary"
        />
        <span className="block text-xs text-ink-subtle">
          {t("minPassword")}
        </span>
      </label>
      {error && <p className="text-sm text-bloom">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-2xl bg-primary px-6 font-medium text-surface disabled:opacity-60"
      >
        {loading ? t("creatingAccount") : t("createAccount")}
      </button>
    </form>
  );
}
