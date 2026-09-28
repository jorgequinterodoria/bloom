import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a Bloom con tu correo y contraseña.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center gap-8 py-10">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl text-ink">Bloom</h1>
        <p className="text-ink-muted">
          Entra para cuidar tu planta y tu movimiento.
        </p>
      </header>
      <LoginForm />
      <p className="text-center text-sm text-ink-subtle">
        ¿Aún no tienes cuenta?{" "}
        <a href="/register" className="text-primary underline">
          Crear una
        </a>
      </p>
    </main>
  );
}
