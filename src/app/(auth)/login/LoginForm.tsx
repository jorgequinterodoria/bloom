"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    window.location.href = "/";
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="min-h-12 w-full rounded-2xl border border-surface-raised bg-surface-raised px-4 text-ink outline-none focus:border-primary"
        />
      </label>
      {error && <p className="text-sm text-bloom">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-2xl bg-primary px-6 font-medium text-surface disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
