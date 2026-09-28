import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de Bloom en segundos.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl text-ink">Bloom</h1>
        <p className="text-ink-muted">
          Crea tu cuenta para empezar a crecer.
        </p>
      </header>
      <RegisterForm />
      <p className="text-center text-sm text-ink-subtle">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-primary underline">
          Entrar
        </a>
      </p>
    </main>
  );
}
