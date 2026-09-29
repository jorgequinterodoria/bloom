import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayKey } from "@/lib/utils";

const exercises = {
  mood: "Ansiosa",
  exercises: [
    { name: "Respiración profunda", durationSeconds: 60 },
    { name: "Mariposa sentado", durationSeconds: 45 },
  ],
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams("mood=Ansiosa"),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(exercises) }),
    ),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

import { WorkoutPlayer } from "./WorkoutPlayer";

async function flushLoad() {
  await act(async () => {
    for (let i = 0; i < 10; i++) await Promise.resolve();
  });
}

describe("WorkoutPlayer", () => {
  it("asienta en el primer ejercicio tras cargar, sin interacción", async () => {
    render(<WorkoutPlayer />);
    expect(await screen.findByText("Respiración profunda")).toBeInTheDocument();
    expect(await screen.findByText("Ejercicio 1 de 2")).toBeInTheDocument();
    expect(screen.getByText("Respiración profunda")).toBeInTheDocument();
  });

  it("muestra el primer ejercicio y permite avanzar", async () => {
    render(<WorkoutPlayer />);
    expect(await screen.findByText("Respiración profunda")).toBeInTheDocument();
    expect(screen.getByText("Ejercicio 1 de 2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /siguiente movimiento/i }));
    expect(await screen.findByText("Mariposa sentado")).toBeInTheDocument();
    expect(screen.getByText("Ejercicio 2 de 2")).toBeInTheDocument();
  });

  it("completa el flujo con el temporizador y guarda el avance una sola vez", async () => {
    vi.useFakeTimers();
    render(<WorkoutPlayer />);
    await flushLoad();

    expect(screen.getByText("Respiración profunda")).toBeInTheDocument();
    expect(screen.getByText("Ejercicio 1 de 2")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Mariposa sentado")).toBeInTheDocument();
    expect(screen.getByText("Ejercicio 2 de 2")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(45_000);
    });
    expect(screen.getByText("Listo por hoy")).toBeInTheDocument();

    const postCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => url === "/api/workout");
    expect(postCalls).toHaveLength(1);
    expect(JSON.parse(String(postCalls[0][1]?.body))).toEqual({
      day: todayKey(),
    });
  });

  it("muestra el error cuando la API devuelve un flujo vacío", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exercises: [] }),
        }),
      ),
    );
    render(<WorkoutPlayer />);
    expect(
      await screen.findByText("No encontramos tu flujo de hoy."),
    ).toBeInTheDocument();
    expect(screen.getByText("Volver al inicio")).toBeInTheDocument();
  });

  it("pausa y reanuda", async () => {
    render(<WorkoutPlayer />);
    await screen.findByText("Respiración profunda");
    fireEvent.click(screen.getByRole("button", { name: /pausar/i }));
    expect(screen.getByRole("button", { name: /reanudar/i })).toBeInTheDocument();
  });
});
