"use client";

import Link from "next/link";

export default function MoveError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-ink">Algo salió mal al cargar tu movimiento.</p>
      <button
        type="button"
        onClick={reset}
        className="min-h-12 rounded-2xl bg-primary px-6 font-medium text-surface"
      >
        Reintentar
      </button>
      <Link href="/" className="inline-block min-h-12 rounded-2xl px-4 text-sm text-ink-muted underline">
        Volver al inicio
      </Link>
    </main>
  );
}
