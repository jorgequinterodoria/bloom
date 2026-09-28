"use client";

import { useState } from "react";

export default function RegisterForm() {
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
      setError(data?.error ?? "No se pudo crear la cuenta.");
    } catch {
      setError("No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-ink-muted">Correo</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-surface-raised bg-surface-raised px-4 text-ink outline-none focus:border-primary"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-ink-muted">Contraseña</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-surface-raised bg-surface-raised px-4 text-ink outline-none focus:border-primary"
        />
        <span className="block text-xs text-ink-subtle">
          Mínimo 8 caracteres.
        </span>
      </label>
      {error && <p className="text-sm text-bloom">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-2xl bg-primary px-6 font-medium text-surface disabled:opacity-60"
      >
        {loading ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
