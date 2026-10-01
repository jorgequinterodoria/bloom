import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), useSearchParams: () => new URLSearchParams("mood=Ansiosa&energy=3&stress=4&duration=5") }));
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ locale: "es", t: (key: string, values: Record<string, string | number> = {}) => { const map: Record<string, string> = { progressExercise: "Progreso del ejercicio", exerciseNumber: "Ejercicio {current} de {total}", seconds: "s", session: "Tu sesión", moodAnxiousSummary: "Ritmo suave", genericMoodSummary: "Pequeño paso", movementReady: "Preparando", flowMissing: "No encontramos tu flujo de hoy.", backHome: "Volver al inicio", doneToday: "Listo por hoy", nextMove: "Siguiente movimiento", pause: "Pausar", resume: "Reanudar", soundOn: "Desactivar sonido", soundOff: "Activar sonido", sessionComplete: "Sesión completada", howDoYouFeelNow: "¿Cómo te sientes ahora?", beforeAfterHint: "Cuéntanos", afterCheckin: "Después", sessionSavedMessage: "Progreso", saveAndBloom: "Guardar y seguir creciendo", saving: "Guardando…", saveProgressError: "No pudimos guardar" }; return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), map[key] ?? key); }, automatic: true, setLanguage: vi.fn() }) }));
vi.mock("@/lib/exercise-i18n", () => ({ localizeExercise: (name: string, instruction?: string | null) => ({ name, instruction }) }));

import { WorkoutPlayer } from "./WorkoutPlayer";

const exercises = { mood: "Ansiosa", exercises: [{ name: "Respiración profunda", durationSeconds: 2, instructions: "Inhala y exhala." }, { name: "Mariposa sentado", durationSeconds: 2 }] };
const fetchMock = vi.fn();

beforeEach(() => {
  push.mockReset();
  vi.useRealTimers();
  fetchMock.mockReset();
  fetchMock.mockImplementation((input: string, init?: RequestInit) => {
    const url = String(input);
    if (url.startsWith("/api/exercises")) return Promise.resolve({ ok: true, json: async () => exercises });
    if (url === "/api/session" && init?.method === "POST") {
      const body = JSON.parse(String(init.body));
      if (body.action === "start") return Promise.resolve({ ok: true, json: async () => ({ ok: true, sessionId: "session-1" }) });
      return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("WorkoutPlayer premium", () => {
  it("carga la sesión y muestra el primer ejercicio", async () => { render(<WorkoutPlayer />); expect(await screen.findByText("Respiración profunda")).toBeInTheDocument(); expect(screen.getByText("Ejercicio 1 de 2")).toBeInTheDocument(); expect(fetchMock.mock.calls.some(([url, init]) => url === "/api/session" && JSON.parse(String(init?.body)).action === "start")).toBe(true); });
  it("permite pausar y reanudar", async () => { render(<WorkoutPlayer />); await screen.findByText("Respiración profunda"); fireEvent.click(screen.getByRole("button", { name: /pausar/i })); expect(screen.getByRole("button", { name: /reanudar/i })).toBeInTheDocument(); });
  it("muestra la transición entre ejercicios", async () => { vi.useFakeTimers(); render(<WorkoutPlayer />); await act(async () => { await Promise.resolve(); await Promise.resolve(); }); expect(screen.getByText("Respiración profunda")).toBeInTheDocument(); act(() => { vi.advanceTimersByTime(2000); }); expect(screen.getByText(/Mariposa sentado/i)).toBeInTheDocument(); });
  it("llega al resumen al terminar", async () => { vi.useFakeTimers(); render(<WorkoutPlayer />); await act(async () => { await Promise.resolve(); await Promise.resolve(); }); act(() => { vi.advanceTimersByTime(2000); }); act(() => { vi.advanceTimersByTime(3000); }); act(() => { vi.advanceTimersByTime(2000); }); act(() => { vi.advanceTimersByTime(3000); }); expect(await screen.findByText("¿Cómo te sientes ahora?")).toBeInTheDocument(); });
});
